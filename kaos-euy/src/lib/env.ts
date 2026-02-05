const REQUIRED_ENV = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'ADMIN_PASSWORD',
] as const;

export type RequiredEnvKey = (typeof REQUIRED_ENV)[number];

function isMissing(value: string | undefined) {
  return !value || value.trim().length === 0;
}

export function assertRequiredEnv(): void {
  const missing = REQUIRED_ENV.filter((key) => isMissing(process.env[key]));
  if (missing.length > 0) {
    const message = [
      '필수 환경 변수가 누락되었습니다.',
      `누락: ${missing.join(', ')}`,
      '로컬에서는 .env.local 또는 .env에 값을 설정하세요.',
    ].join(' ');
    console.error(message);
    throw new Error(message);
  }
}

export function getSupabaseEnv() {
  assertRequiredEnv();
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY as string,
  };
}
