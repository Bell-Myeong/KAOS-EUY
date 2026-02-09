import { execFileSync, spawnSync } from 'node:child_process';

const ADMIN_EMAIL = 'admin@local.test';
const ADMIN_PASSWORD = 'Admin1234!';

function run(command, args, options = {}) {
  return execFileSync(command, args, { encoding: 'utf8', ...options }).trim();
}

function runNpx(args) {
  if (process.platform === 'win32') {
    const cmd = ['npx', ...args].join(' ');
    return run(process.env.ComSpec ?? 'cmd.exe', ['/d', '/s', '/c', cmd]);
  }
  return run('npx', args);
}

function runDockerExec(args) {
  const res = spawnSync('docker', ['exec', ...args], { encoding: 'utf8' });
  if (res.status !== 0) {
    throw new Error(res.stderr || `docker exec failed: ${res.status}`);
  }
  return (res.stdout ?? '').trim();
}

function getSupabaseStatus() {
  const raw = runNpx(['--yes', 'supabase', 'status', '--output', 'json']);
  const json = JSON.parse(raw);
  const apiUrl = json.API_URL;
  const serviceRoleKey = json.SERVICE_ROLE_KEY;
  if (!apiUrl || !serviceRoleKey) {
    throw new Error('Failed to read API_URL / SERVICE_ROLE_KEY from `supabase status`');
  }
  return { apiUrl, serviceRoleKey };
}

async function createAuthUser({ apiUrl, serviceRoleKey }) {
  const res = await fetch(`${apiUrl}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
    }),
  });

  if (res.ok) {
    const data = await res.json();
    return { created: true, userId: data.id };
  }

  // If user already exists, gotrue typically returns 422.
  const text = await res.text().catch(() => '');
  return { created: false, userId: null, error: `${res.status} ${res.statusText} ${text}` };
}

async function waitForPublicUserRow(maxAttempts = 20) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const row = runDockerExec([
      'supabase_db_kaos-euy',
      'psql',
      '-U',
      'postgres',
      '-d',
      'postgres',
      '-t',
      '-A',
      '-c',
      `select id from public.users where email='${ADMIN_EMAIL}' limit 1;`,
    ]);
    if (row) return row;
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error('Timed out waiting for public.users row (trigger) to be created');
}

async function setAdminFlag() {
  runDockerExec([
    'supabase_db_kaos-euy',
    'psql',
    '-U',
    'postgres',
    '-d',
    'postgres',
    '-v',
    'ON_ERROR_STOP=1',
    '-c',
    `update public.users set is_admin = true where email='${ADMIN_EMAIL}';`,
  ]);
}

async function main() {
  const { apiUrl, serviceRoleKey } = getSupabaseStatus();

  const result = await createAuthUser({ apiUrl, serviceRoleKey });
  if (result.created) {
    process.stdout.write(`Created auth user: ${ADMIN_EMAIL}\n`);
  } else {
    process.stdout.write(`Auth user exists or could not be created: ${ADMIN_EMAIL}\n`);
  }

  await waitForPublicUserRow();
  await setAdminFlag();

  const summary = runDockerExec([
    'supabase_db_kaos-euy',
    'psql',
    '-U',
    'postgres',
    '-d',
    'postgres',
    '-t',
    '-A',
    '-c',
    `select id||'|'||email||'|'||is_admin from public.users where email='${ADMIN_EMAIL}' limit 1;`,
  ]);

  process.stdout.write(`Admin ready: ${summary}\n`);
  process.stdout.write(`Password: ${ADMIN_PASSWORD}\n`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : String(e));
  process.exit(1);
});
