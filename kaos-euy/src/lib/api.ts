import { NextResponse } from 'next/server';

export type FieldErrors = Record<string, string>;

interface ErrorResponseOptions {
  status: number;
  code: string;
  message: string;
  fieldErrors?: FieldErrors;
  requestId: string;
  endpoint: string;
  error?: unknown;
  headers?: Record<string, string>;
}

export function createRequestId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown';
  }
  const realIp = request.headers.get('x-real-ip');
  return realIp || 'unknown';
}

export function logApiError(options: {
  requestId: string;
  endpoint: string;
  code: string;
  message: string;
  error?: unknown;
}) {
  const detail = options.error instanceof Error ? options.error.message : options.error ? String(options.error) : '';
  const detailSuffix = detail ? ` | detail=${detail}` : '';
  console.error(`[${options.requestId}] ${options.endpoint} ${options.code}: ${options.message}${detailSuffix}`);
}

export function buildErrorResponse({
  status,
  code,
  message,
  fieldErrors,
  requestId,
  endpoint,
  error,
  headers,
}: ErrorResponseOptions) {
  logApiError({ requestId, endpoint, code, message, error });
  return NextResponse.json(
    {
      code,
      message,
      fieldErrors: fieldErrors ?? {},
    },
    {
      status,
      headers: {
        'x-request-id': requestId,
        ...(headers ?? {}),
      },
    }
  );
}
