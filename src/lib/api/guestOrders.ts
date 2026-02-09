import { getSupabaseBrowserClient } from '@/lib/supabase/browser';
import { ApiError } from '@/lib/api/errors';
import type { CartItem } from '@/types';
import type { Json } from '@/lib/supabase/database.types';

export type GuestCustomerInput = {
  email: string;
  name?: string;
  phone?: string;
};

export type GuestShippingInput = {
  full_address?: string;
  notes?: string;
  // You can add structured fields later (city, postal_code, etc.)
};

export async function createGuestOrder(input: {
  items: CartItem[];
  customer: GuestCustomerInput;
  shipping: GuestShippingInput;
}): Promise<{ orderId: string; lookupToken: string }> {
  const supabase = getSupabaseBrowserClient();

  const p_items = input.items.map((item) => ({
    product_id: item.product.id,
    size: item.size,
    color_code: item.color.code,
    color_name: item.color.name,
    quantity: item.quantity,
    customization: item.customization ?? null,
  })) as unknown as Json;

  const { data, error, status } = await supabase
    .rpc('create_order_guest', {
      p_items,
      p_customer: input.customer as unknown as Json,
      p_shipping: input.shipping as unknown as Json,
    })
    .single();

  if (error) {
    throw new ApiError(error.message, { status, code: error.code, cause: error });
  }

  const orderId = (data as unknown as { order_id: string }).order_id;
  const lookupToken = (data as unknown as { lookup_token: string }).lookup_token;

  if (!orderId || !lookupToken) {
    throw new ApiError('Invalid RPC response', { status: 500 });
  }

  return { orderId, lookupToken };
}

export type GuestOrderLookupResult = {
  // Shape comes from `get_order_guest()` which returns jsonb.
  // We keep it loose but consistent for UI.
  order: Record<string, unknown>;
  items: Array<Record<string, unknown>>;
};

export async function getGuestOrder(input: {
  orderId: string;
  email: string;
  token: string;
}): Promise<GuestOrderLookupResult> {
  const supabase = getSupabaseBrowserClient();

  const { data, error, status } = await supabase.rpc('get_order_guest', {
    p_order_id: input.orderId,
    p_email: input.email,
    p_token: input.token,
  });

  if (error) {
    throw new ApiError(error.message, { status, code: error.code, cause: error });
  }

  if (!data || typeof data !== 'object') {
    throw new ApiError('Invalid RPC response', { status: 500 });
  }

  const anyData = data as unknown as GuestOrderLookupResult;
  return anyData;
}
