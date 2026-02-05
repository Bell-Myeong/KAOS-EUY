import { NextResponse } from 'next/server';
import { assertRequiredEnv } from '@/lib/env';
import { createRequestId } from '@/lib/api';

export const dynamic = 'force-dynamic';

export function GET() {
  const requestId = createRequestId();
  assertRequiredEnv();

  return NextResponse.json(
    {
      ok: true,
      requestId,
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        'x-request-id': requestId,
      },
    }
  );
}
