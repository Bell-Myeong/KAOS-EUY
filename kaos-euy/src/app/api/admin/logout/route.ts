import { NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME, getAdminCookieOptions } from '@/lib/admin/auth';
import { buildErrorResponse, createRequestId, getClientIp } from '@/lib/api';
import { checkRateLimit } from '@/lib/rate-limit';

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 30;

export async function POST(request: Request) {
  const requestId = createRequestId();
  const endpoint = 'POST /api/admin/logout';
  const ip = getClientIp(request);
  const rate = checkRateLimit(`admin-logout:${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
  if (!rate.allowed) {
    return buildErrorResponse({
      status: 429,
      code: 'RATE_LIMITED',
      message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
      fieldErrors: {},
      requestId,
      endpoint,
      headers: {
        'Retry-After': String(rate.retryAfter),
      },
    });
  }

  const response = NextResponse.json({ ok: true }, { status: 200 });
  response.cookies.set(ADMIN_COOKIE_NAME, '', {
    ...getAdminCookieOptions(),
    maxAge: 0,
  });
  return response;
}