import { getSupabaseBrowserClient } from '@/lib/supabase/browser';
import type { Database } from '@/lib/supabase/database.types';
import { ApiError } from './errors';
import { requireUserId } from './auth';

type OrderRow = Database['public']['Tables']['orders']['Row'];
type OrderItemRow = Database['public']['Tables']['order_items']['Row'];

export async function createOrderFromCart() {
  const supabase = getSupabaseBrowserClient();
  const userId = await requireUserId(supabase);

  const { data: cartRows, error: cartError, status: cartStatus } = await supabase
    .from('cart_items')
    .select(
      `
      quantity,
      size,
      color_code,
      color_name,
      product:products ( id, name, price )
    `
    )
    .order('created_at', { ascending: false });

  if (cartError) {
    throw new ApiError(cartError.message, {
      status: cartStatus,
      code: cartError.code,
      cause: cartError,
    });
  }

  const items = (cartRows ?? []).map((row) => {
    const product = row.product as { id: string; name: string; price: number } | null;
    if (!product) return null;
    return {
      product_id: product.id,
      product_name: product.name,
      unit_price: product.price,
      quantity: row.quantity,
      size: row.size as string,
      color_code: row.color_code,
      color_name: row.color_name,
      line_total: product.price * row.quantity,
    };
  }).filter((x): x is NonNullable<typeof x> => Boolean(x));

  if (items.length === 0) {
    throw new ApiError('Cart is empty', { status: 400 });
  }

  const subtotal = items.reduce((sum, item) => sum + item.line_total, 0);
  const shippingFee = 0;
  const total = subtotal + shippingFee;

  const { data: order, error: orderError, status: orderStatus } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      status: 'pending',
      currency: 'IDR',
      subtotal,
      shipping_fee: shippingFee,
      total,
    })
    .select('*')
    .single();

  if (orderError) {
    throw new ApiError(orderError.message, {
      status: orderStatus,
      code: orderError.code,
      cause: orderError,
    });
  }

  const orderId = (order as OrderRow).id;

  const { error: itemError, status: itemStatus } = await supabase
    .from('order_items')
    .insert(
      items.map((item) => ({
        order_id: orderId,
        ...item,
      }))
    );

  if (itemError) {
    await supabase.from('orders').delete().eq('id', orderId);
    throw new ApiError(itemError.message, { status: itemStatus, code: itemError.code, cause: itemError });
  }

  const { error: clearError, status: clearStatus } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId);

  if (clearError) {
    throw new ApiError(clearError.message, { status: clearStatus, code: clearError.code, cause: clearError });
  }

  return orderId;
}

export async function getMyOrders(): Promise<OrderRow[]> {
  const supabase = getSupabaseBrowserClient();
  await requireUserId(supabase);

  const { data, error, status } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new ApiError(error.message, { status, code: error.code, cause: error });
  }

  return (data ?? []) as OrderRow[];
}

export async function getOrderDetail(orderId: string): Promise<
  (OrderRow & { items: OrderItemRow[] }) | null
> {
  const supabase = getSupabaseBrowserClient();
  await requireUserId(supabase);

  const { data, error, status } = await supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .eq('id', orderId)
    .single();

  if (error) {
    throw new ApiError(error.message, { status, code: error.code, cause: error });
  }

  return data as unknown as OrderRow & { items: OrderItemRow[] };
}

