const TIMEOUT_MS = 10000;

const baseUrl = process.env.DEPLOY_BASE_URL;
if (!baseUrl) {
  console.error('DEPLOY_BASE_URL 환경 변수가 필요합니다.');
  console.error('예: DEPLOY_BASE_URL=https://example.com node scripts/verify-deploy.mjs');
  process.exit(1);
}

const targets = [
  { name: '홈', path: '/', expectedStatus: 200 },
  { name: '상품 목록', path: '/products', expectedStatus: 200 },
  { name: '상품 API', path: '/api/products', expectedStatus: 200 },
  { name: '헬스 체크', path: '/api/health', expectedStatus: 200 },
  { name: 'Admin 주문 목록 (비인증)', path: '/api/admin/orders', expectedStatus: 401 },
];

function buildUrl(path) {
  return new URL(path, baseUrl).toString();
}

async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

let failed = 0;

for (const target of targets) {
  const url = buildUrl(target.path);
  try {
    const res = await fetchWithTimeout(url);
    const ok = res.status === target.expectedStatus;
    const statusLabel = ok ? 'PASS' : 'FAIL';
    console.log(`${statusLabel} ${target.name} ${url} -> ${res.status}`);
    if (!ok) {
      failed += 1;
    }
  } catch (error) {
    failed += 1;
    const message = error instanceof Error ? error.message : String(error);
    console.log(`FAIL ${target.name} ${url} -> ${message}`);
  }
}

if (failed > 0) {
  console.error(`검증 실패: ${failed}건`);
  process.exit(1);
}

console.log('검증 완료: 모든 항목 통과');
