import { NextResponse } from 'next/server';
import { supabaseStorageAdminFetch } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/admin/guard';
import { UPLOAD_BUCKET } from '@/lib/uploads';
import { buildErrorResponse, createRequestId, getClientIp } from '@/lib/api';
import { checkRateLimit } from '@/lib/rate-limit';

const EXPIRES_IN_SECONDS = 60 * 3;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 60;

export async function GET(request: Request) {
  const requestId = createRequestId();
  const endpoint = 'GET /api/admin/files/signed-url';
  const ip = getClientIp(request);
  const rate = checkRateLimit(`admin-files-signed:${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
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

  const auth = requireAdmin(request);
  if (!auth.ok) {
    return buildErrorResponse({
      status: 401,
      code: auth.code,
      message: auth.message,
      fieldErrors: {},
      requestId,
      endpoint,
    });
  }

  const { searchParams } = new URL(request.url);
  const bucket = searchParams.get('bucket') || process.env.SUPABASE_STORAGE_BUCKET || UPLOAD_BUCKET;
  const path = searchParams.get('path');

  if (!bucket || !path) {
    return buildErrorResponse({
      status: 400,
      code: 'VALIDATION_ERROR',
      message: 'bucket과 path가 필요합니다.',
      fieldErrors: {
        bucket: 'bucket이 필요합니다.',
        path: 'path가 필요합니다.',
      },
      requestId,
      endpoint,
    });
  }

  try {
    const storagePath = `object/sign/${bucket}/${encodeURI(path)}`;
    const signed = await supabaseStorageAdminFetch<{ signedUrl?: string; signedURL?: string; url?: string }>(
      storagePath,
      {
        method: 'POST',
        body: JSON.stringify({
          expiresIn: EXPIRES_IN_SECONDS,
        }),
      }
    );

    const signedUrl = signed.signedUrl || signed.signedURL || signed.url;
    if (!signedUrl) {
      throw new Error('signedUrl 발급 실패');
    }

    return NextResponse.json(
      {
        signedUrl,
        expiresAt: new Date(Date.now() + EXPIRES_IN_SECONDS * 1000).toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    return buildErrorResponse({
      status: 500,
      code: 'SERVER_ERROR',
      message: 'Signed URL 발급 중 오류가 발생했습니다.',
      fieldErrors: {},
      requestId,
      endpoint,
      error,
    });
  }
}