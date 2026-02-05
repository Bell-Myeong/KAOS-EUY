import { NextResponse } from 'next/server';
import { supabaseAdminFetch } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/admin/guard';
import { mapOrderStatusToGroup, resolveOrderStatusFilter } from '@/lib/admin/status';
import { buildErrorResponse, createRequestId, getClientIp } from '@/lib/api';
import { checkRateLimit } from '@/lib/rate-limit';
import type { AdminListResponse, AdminOrderListItem } from '@/types/admin';

interface OrderRow {
  id: string;
  order_number: string;
  buyer_name: string;
  status: string;
  total_cents: number;
  created_at: string;
}

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 60;

function toNumber(value: string | null, fallback: number) {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function GET(request: Request) {
  const requestId = createRequestId();
  const endpoint = 'GET /api/admin/orders';
  const ip = getClientIp(request);
  const rate = checkRateLimit(`admin-orders:${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
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
  const limit = Math.min(50, Math.max(1, toNumber(searchParams.get('limit'), 20)));
  const offset = Math.max(0, toNumber(searchParams.get('offset'), 0));
  const statusParam = searchParams.get('status');
  const statusFilter = resolveOrderStatusFilter(statusParam);

  if (statusParam && statusParam !== 'ALL' && !statusFilter) {
    return buildErrorResponse({
      status: 400,
      code: 'INVALID_STATUS',
      message: '유효하지 않은 상태 필터입니다.',
      fieldErrors: {
        status: '상태 필터 값을 확인해주세요.',
      },
      requestId,
      endpoint,
    });
  }

  const query = new URLSearchParams({
    select: 'id,order_number,buyer_name,status,total_cents,created_at',
    order: 'created_at.desc',
    limit: String(limit),
    offset: String(offset),
  });

  if (statusFilter && statusFilter.length > 0) {
    const filter =
      statusFilter.length === 1
        ? `eq.${statusFilter[0]}`
        : `in.(${statusFilter.join(',')})`;
    query.set('status', filter);
  }

  const rows = await supabaseAdminFetch<OrderRow[]>(`orders?${query.toString()}`);

  const items: AdminOrderListItem[] = rows.map((row) => ({
    id: row.id,
    orderNumber: row.order_number,
    buyerName: row.buyer_name,
    status: row.status,
    statusGroup: mapOrderStatusToGroup(row.status),
    totalCents: row.total_cents,
    createdAt: row.created_at,
  }));

  const response: AdminListResponse<AdminOrderListItem> = {
    items,
    nextOffset: rows.length === limit ? offset + limit : null,
  };

  return NextResponse.json(response, { status: 200 });
}