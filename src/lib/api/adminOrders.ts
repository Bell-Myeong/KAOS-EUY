import { getSupabaseBrowserClient } from '@/lib/supabase/browser';
import type { Database } from '@/lib/supabase/database.types';
import { ApiError } from '@/lib/api/errors';

export type OrderStatus = Database['public']['Enums']['order_status'];
export type OrderRow = Database['public']['Tables']['orders']['Row'];
export type OrderItemRow = Database['public']['Tables']['order_items']['Row'];

export async function fetchAdminOrders(params?: {
  status?: OrderStatus;
}): Promise<OrderRow[]> {
  const supabase = getSupabaseBrowserClient();

  let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
  if (params?.status) query = query.eq('status', params.status);

  const { data, error, status } = await query;
  if (error) {
    throw new ApiError(error.message, { status, code: error.code, cause: error });
  }

  return (data ?? []) as OrderRow[];
}

export async function fetchAdminOrderDetail(orderId: string): Promise<(OrderRow & { items: OrderItemRow[] }) | null> {
  const supabase = getSupabaseBrowserClient();

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

export async function updateAdminOrderStatus(input: { orderId: string; status: OrderStatus }): Promise<OrderRow> {
  const supabase = getSupabaseBrowserClient();

  const { data, error, status } = await supabase
    .from('orders')
    .update({ status: input.status })
    .eq('id', input.orderId)
    .select('*')
    .single();

  if (error) {
    throw new ApiError(error.message, { status, code: error.code, cause: error });
  }

  return data as OrderRow;
}

