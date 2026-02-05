import { NextResponse } from 'next/server';
import {
  ADMIN_COOKIE_NAME,
  buildAdminSessionValue,
  getAdminCookieOptions,
  isAdminConfigured,
} from '@/lib/admin/auth';
import { buildErrorResponse, createRequestId, getClientIp } from '@/lib/api';
import { checkRateLimit } from '@/lib/rate-limit';

interface LoginBody {
  password?: string;
}

const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const RATE_LIMIT_MAX = 10;

export async function POST(request: Request) {
  const requestId = createRequestId();
  const endpoint = 'POST /api/admin/login';
  const ip = getClientIp(request);
  const rate = checkRateLimit(`admin-login:${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
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

  if (!isAdminConfigured()) {
    return buildErrorResponse({
      status: 500,
      code: 'ADMIN_CONFIG_MISSING',
      message: 'ADMIN_PASSWORD가 설정되지 않았습니다.',
      fieldErrors: {},
      requestId,
      endpoint,
    });
  }

  let body: LoginBody;
  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return buildErrorResponse({
      status: 400,
      code: 'INVALID_JSON',
      message: '요청 본문이 올바른 JSON이 아닙니다.',
      fieldErrors: {},
      requestId,
      endpoint,
    });
  }

  if (!body.password) {
    return buildErrorResponse({
      status: 400,
      code: 'VALIDATION_ERROR',
      message: '비밀번호가 필요합니다.',
      fieldErrors: {
        password: '비밀번호를 입력해주세요.',
      },
      requestId,
      endpoint,
    });
  }

  const adminPassword = process.env.ADMIN_PASSWORD?.trim();
  if (!adminPassword || body.password !== adminPassword) {
    return buildErrorResponse({
      status: 401,
      code: 'UNAUTHORIZED',
      message: '비밀번호가 올바르지 않습니다.',
      fieldErrors: {},
      requestId,
      endpoint,
    });
  }

  const response = NextResponse.json({ ok: true }, { status: 200 });
  response.cookies.set(
    ADMIN_COOKIE_NAME,
    buildAdminSessionValue(adminPassword),
    getAdminCookieOptions()
  );

  return response;
}