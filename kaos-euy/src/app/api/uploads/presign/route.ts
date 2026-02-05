import { NextResponse } from 'next/server';
import { supabaseStorageAdminFetch } from '@/lib/supabase/server';
import {
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
  UPLOAD_BUCKET,
  getFileExtension,
  sanitizeFileName,
} from '@/lib/uploads';
import { buildErrorResponse, createRequestId, getClientIp } from '@/lib/api';
import { checkRateLimit } from '@/lib/rate-limit';
import type { PresignUploadRequest, PresignUploadResponse } from '@/types/custom-request';

const EXPIRES_IN_SECONDS = 10 * 60;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 20;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export async function POST(request: Request) {
  const requestId = createRequestId();
  const endpoint = 'POST /api/uploads/presign';
  const ip = getClientIp(request);
  const rate = checkRateLimit(`uploads-presign:${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
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

  let body: PresignUploadRequest;

  try {
    body = (await request.json()) as PresignUploadRequest;
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

  const fieldErrors: Record<string, string> = {};

  if (body.ownerType !== 'custom_request') {
    fieldErrors.ownerType = 'ownerType은 custom_request 여야 합니다.';
  }
  if (!isNonEmptyString(body.uploadGroupId)) {
    fieldErrors.uploadGroupId = 'uploadGroupId가 필요합니다.';
  }
  if (!isNonEmptyString(body.fileName)) {
    fieldErrors.fileName = 'fileName이 필요합니다.';
  }
  if (!isNonEmptyString(body.mimeType)) {
    fieldErrors.mimeType = 'mimeType이 필요합니다.';
  }
  if (!Number.isFinite(body.sizeBytes) || body.sizeBytes <= 0) {
    fieldErrors.sizeBytes = 'sizeBytes가 올바르지 않습니다.';
  }

  const extension = body.fileName ? getFileExtension(body.fileName) : '';
  if (!extension) {
    fieldErrors.fileName = '확장자가 포함된 파일명이 필요합니다.';
  } else if (!ALLOWED_EXTENSIONS.includes(extension as typeof ALLOWED_EXTENSIONS[number])) {
    fieldErrors.fileName = `허용되지 않은 확장자입니다. (${ALLOWED_EXTENSIONS.join(', ')})`;
  }
  if (body.mimeType && !ALLOWED_MIME_TYPES.includes(body.mimeType as typeof ALLOWED_MIME_TYPES[number])) {
    fieldErrors.mimeType = '허용되지 않은 mimeType입니다.';
  }
  if (Number.isFinite(body.sizeBytes) && body.sizeBytes > MAX_FILE_SIZE_BYTES) {
    fieldErrors.sizeBytes = `파일 용량은 ${Math.round(MAX_FILE_SIZE_BYTES / (1024 * 1024))}MB 이하여야 합니다.`;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return buildErrorResponse({
      status: 400,
      code: 'VALIDATION_ERROR',
      message: '요청 값이 유효하지 않습니다.',
      fieldErrors,
      requestId,
      endpoint,
    });
  }

  const bucket = process.env.SUPABASE_STORAGE_BUCKET || UPLOAD_BUCKET;
  const safeFileName = sanitizeFileName(body.fileName);
  const timestamp = Date.now();
  const path = `custom-requests/${body.uploadGroupId}/${timestamp}_${safeFileName}`;

  try {
    const storagePath = `object/upload/sign/${bucket}/${encodeURI(path)}`;

    const signed = await supabaseStorageAdminFetch<{ signedUrl?: string; signedURL?: string; url?: string }>(
      storagePath,
      {
        method: 'POST',
        body: JSON.stringify({
          expiresIn: EXPIRES_IN_SECONDS,
          contentType: body.mimeType,
        }),
      }
    );

    const signedUrl = signed.signedUrl || signed.signedURL || signed.url;
    if (!signedUrl) {
      throw new Error('signedUrl 발급 실패');
    }

    const response: PresignUploadResponse = {
      bucket,
      path,
      signedUrl,
      expiresAt: new Date(Date.now() + EXPIRES_IN_SECONDS * 1000).toISOString(),
    };

    return NextResponse.json(response, { status: 200 });
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
