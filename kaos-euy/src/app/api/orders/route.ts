import { NextResponse } from 'next/server';
import { supabaseAdminFetch } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/utils';
import { sendSlackNotification } from '@/lib/notifications/slack';
import { buildErrorResponse, createRequestId, getClientIp } from '@/lib/api';
import { checkRateLimit } from '@/lib/rate-limit';
import type { CreateOrderRequest, CreateOrderResponse } from '@/types/order';

interface ProductIdRow {
  id: string;
}

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 5;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function generateOrderNumber() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const suffix = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');

  // 사람이 읽기 쉬운 규칙: EUY-YYYYMMDD-XXXX (XXXX는 랜덤 4자리)
  return `EUY-${yyyy}${mm}${dd}-${suffix}`;
}

export async function POST(request: Request) {
  const requestId = createRequestId();
  const endpoint = 'POST /api/orders';
  const ip = getClientIp(request);
  const rate = checkRateLimit(`orders:${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
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

  let body: CreateOrderRequest;

  try {
    body = (await request.json()) as CreateOrderRequest;
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

  if (isNonEmptyString(body.company_website)) {
    return buildErrorResponse({
      status: 400,
      code: 'SPAM_DETECTED',
      message: '요청이 정상적으로 처리되지 않았습니다.',
      fieldErrors: {
        company_website: '스팸 방지 필드가 입력되었습니다.',
      },
      requestId,
      endpoint,
    });
  }

  const fieldErrors: Record<string, string> = {};

  if (!isNonEmptyString(body.buyer_name)) {
    fieldErrors.buyer_name = '이름은 필수입니다.';
  }
  if (!isNonEmptyString(body.buyer_phone)) {
    fieldErrors.buyer_phone = '연락처는 필수입니다.';
  }

  if (!body.shipping_address || typeof body.shipping_address !== 'object') {
    fieldErrors.shipping_address = '배송지 정보가 필요합니다.';
  } else {
    if (!isNonEmptyString(body.shipping_address.address_line1)) {
      fieldErrors['shipping_address.address_line1'] = '주소는 필수입니다.';
    }
    if (!isNonEmptyString(body.shipping_address.city)) {
      fieldErrors['shipping_address.city'] = '도시는 필수입니다.';
    }
    if (!isNonEmptyString(body.shipping_address.country)) {
      fieldErrors['shipping_address.country'] = '국가는 필수입니다.';
    }
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    fieldErrors.items = '아이템은 최소 1개 이상 필요합니다.';
  }

  const sanitizedItems: CreateOrderRequest['items'] = [];
  if (Array.isArray(body.items)) {
    body.items.forEach((item, index) => {
      if (!isNonEmptyString(item.product_id)) {
        fieldErrors[`items.${index}.product_id`] = 'product_id가 필요합니다.';
      }
      if (!Number.isInteger(item.quantity) || item.quantity < 1) {
        fieldErrors[`items.${index}.quantity`] = '수량은 1 이상이어야 합니다.';
      }
      if (!Number.isFinite(item.unit_price_cents) || item.unit_price_cents < 0) {
        fieldErrors[`items.${index}.unit_price_cents`] = '단가는 0 이상이어야 합니다.';
      }

      const options: Record<string, string> = {};
      if (item.options && typeof item.options === 'object') {
        Object.entries(item.options).forEach(([key, value]) => {
          if (typeof value === 'string') {
            options[key] = value;
          }
        });
      }

      sanitizedItems.push({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price_cents: item.unit_price_cents,
        options,
      });
    });
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

  const productIds = Array.from(
    new Set(sanitizedItems.map((item) => item.product_id))
  );

  try {
    if (productIds.length > 0) {
      const query = new URLSearchParams({
        select: 'id',
        id: `in.(${productIds.join(',')})`,
      });

      const found = await supabaseAdminFetch<ProductIdRow[]>(`products?${query.toString()}`);
      if (found.length !== productIds.length) {
        return buildErrorResponse({
          status: 400,
          code: 'INVALID_PRODUCT',
          message: '존재하지 않는 상품이 포함되어 있습니다.',
          fieldErrors: {
            items: 'product_id 검증 실패',
          },
          requestId,
          endpoint,
        });
      }
    }

    const subtotal = sanitizedItems.reduce(
      (sum, item) => sum + item.unit_price_cents * item.quantity,
      0
    );
    const shipping = 0;
    const total = subtotal + shipping;

    const orderNumber = generateOrderNumber();

    const orderPayload = {
      order_number: orderNumber,
      buyer_name: body.buyer_name.trim(),
      buyer_phone: body.buyer_phone.trim(),
      buyer_email: body.buyer_email?.trim() || null,
      shipping_address: body.shipping_address,
      notes: body.notes?.trim() || null,
      status: 'PENDING_CONFIRMATION',
      subtotal_cents: subtotal,
      shipping_cents: shipping,
      total_cents: total,
    };

    const orderRows = await supabaseAdminFetch<CreateOrderResponse[]>(
      'orders',
      {
        method: 'POST',
        headers: {
          Prefer: 'return=representation',
        },
        body: JSON.stringify(orderPayload),
      }
    );

    if (!orderRows || orderRows.length === 0) {
      throw new Error('Order insert failed');
    }

    const order = orderRows[0];

    const orderItemsPayload = sanitizedItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price_cents: item.unit_price_cents,
      options: item.options ?? {},
    }));

    await supabaseAdminFetch('order_items', {
      method: 'POST',
      headers: {
        Prefer: 'return=representation',
      },
      body: JSON.stringify(orderItemsPayload),
    });

    const totalFormatted = formatCurrency(order.total_cents, 'IDR');
    const messageLines = [
      `NEW ORDER - ${order.order_number}`,
      `Buyer: ${order.buyer_name}`,
      `Total: ${totalFormatted}`,
      `Items: ${sanitizedItems.length}`,
      `Admin: /admin/orders/${order.id}`,
    ];
    await sendSlackNotification(messageLines.join('\n'));

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    return buildErrorResponse({
      status: 500,
      code: 'SERVER_ERROR',
      message: '주문 저장 중 오류가 발생했습니다.',
      fieldErrors: {},
      requestId,
      endpoint,
      error,
    });
  }
}
