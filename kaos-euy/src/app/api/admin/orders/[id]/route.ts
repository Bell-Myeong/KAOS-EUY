import { NextResponse } from 'next/server';
import { supabaseAdminFetch } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/admin/guard';
import { mapOrderStatusToGroup } from '@/lib/admin/status';
import { buildErrorResponse, createRequestId, getClientIp } from '@/lib/api';
import { checkRateLimit } from '@/lib/rate-limit';
import type { AdminOrderDetail, AdminOrderItem } from '@/types/admin';

interface OrderRow {
  id: string;
  order_number: string;
  buyer_name: string;
  buyer_phone: string | null;
  buyer_email: string | null;
  shipping_address: Record<string, string> | null;
  notes: string | null;
  status: string;
  subtotal_cents: number;
  shipping_cents: number;
  total_cents: number;
  created_at: string;
}

interface OrderItemRow {
  id: string;
  product_id: string | null;
  quantity: number;
  unit_price_cents: number;
  options: Record<string, string> | null;
  products?: {
    name?: string | null;
    slug?: string | null;
  } | null;
}

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 60;

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const requestId = createRequestId();
  const endpoint = 'GET /api/admin/orders/[id]';
  const ip = getClientIp(request);
  const rate = checkRateLimit(`admin-orders-detail:${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
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

  const orderId = params.id;
  if (!orderId) {
    return buildErrorResponse({
      status: 400,
      code: 'INVALID_ID',
      message: 'order id가 필요합니다.',
      fieldErrors: {
        id: 'order id가 필요합니다.',
      },
      requestId,
      endpoint,
    });
  }

  const orderRows = await supabaseAdminFetch<OrderRow[]>(
    `orders?id=eq.${orderId}&select=id,order_number,buyer_name,buyer_phone,buyer_email,shipping_address,notes,status,subtotal_cents,shipping_cents,total_cents,created_at&limit=1`
  );

  if (!orderRows || orderRows.length === 0) {
    return buildErrorResponse({
      status: 404,
      code: 'NOT_FOUND',
      message: '주문을 찾을 수 없습니다.',
      fieldErrors: {},
      requestId,
      endpoint,
    });
  }

  const order = orderRows[0];

  const itemQuery = new URLSearchParams({
    select: 'id,product_id,quantity,unit_price_cents,options,products(name,slug)',
    order_id: `eq.${orderId}`,
    order: 'created_at.asc',
  });

  const itemRows = await supabaseAdminFetch<OrderItemRow[]>(
    `order_items?${itemQuery.toString()}`
  );

  const items: AdminOrderItem[] = itemRows.map((item) => ({
    id: item.id,
    productId: item.product_id,
    productName: item.products?.name ?? null,
    productSlug: item.products?.slug ?? null,
    quantity: item.quantity,
    unitPriceCents: item.unit_price_cents,
    options: item.options ?? {},
  }));

  const response: AdminOrderDetail = {
    id: order.id,
    orderNumber: order.order_number,
    buyerName: order.buyer_name,
    buyerPhone: order.buyer_phone,
    buyerEmail: order.buyer_email,
    shippingAddress: order.shipping_address,
    notes: order.notes,
    status: order.status,
    statusGroup: mapOrderStatusToGroup(order.status),
    subtotalCents: order.subtotal_cents,
    shippingCents: order.shipping_cents,
    totalCents: order.total_cents,
    createdAt: order.created_at,
    items,
  };

  return NextResponse.json(response, { status: 200 });
}