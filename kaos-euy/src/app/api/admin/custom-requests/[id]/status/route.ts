import { NextResponse } from 'next/server';
import { supabaseAdminFetch } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/admin/guard';
import { mapCustomStatusToGroup, resolveCustomStatusInput } from '@/lib/admin/status';
import { buildErrorResponse, createRequestId, getClientIp } from '@/lib/api';
import { checkRateLimit } from '@/lib/rate-limit';

interface StatusBody {
  status?: string;
}

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 60;

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const requestId = createRequestId();
  const endpoint = 'PATCH /api/admin/custom-requests/[id]/status';
  const ip = getClientIp(request);
  const rate = checkRateLimit(`admin-custom-requests-status:${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
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

  const requestIdParam = params.id;
  if (!requestIdParam) {
    return buildErrorResponse({
      status: 400,
      code: 'INVALID_ID',
      message: 'request id가 필요합니다.',
      fieldErrors: {
        id: 'request id가 필요합니다.',
      },
      requestId,
      endpoint,
    });
  }

  let body: StatusBody;
  try {
    body = (await request.json()) as StatusBody;
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

  if (!body.status) {
    return buildErrorResponse({
      status: 400,
      code: 'VALIDATION_ERROR',
      message: 'status가 필요합니다.',
      fieldErrors: {
        status: 'status가 필요합니다.',
      },
      requestId,
      endpoint,
    });
  }

  const resolved = resolveCustomStatusInput(body.status);
  if (!resolved) {
    return buildErrorResponse({
      status: 400,
      code: 'INVALID_STATUS',
      message: '유효하지 않은 status입니다.',
      fieldErrors: {
        status: 'status 값을 확인해주세요.',
      },
      requestId,
      endpoint,
    });
  }

  const updateRows = await supabaseAdminFetch<{ id: string; status: string; updated_at: string }[]>(
    `custom_requests?id=eq.${requestIdParam}`,
    {
      method: 'PATCH',
      headers: {
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        status: resolved,
        updated_at: new Date().toISOString(),
      }),
    }
  );

  if (!updateRows || updateRows.length === 0) {
    return buildErrorResponse({
      status: 404,
      code: 'NOT_FOUND',
      message: '요청을 찾을 수 없습니다.',
      fieldErrors: {},
      requestId,
      endpoint,
    });
  }

  const updated = updateRows[0];

  return NextResponse.json(
    {
      id: updated.id,
      status: updated.status,
      statusGroup: mapCustomStatusToGroup(updated.status),
      updatedAt: updated.updated_at,
    },
    { status: 200 }
  );
}