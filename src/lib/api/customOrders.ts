import { getSupabaseBrowserClient } from '@/lib/supabase/browser';
import type { Json } from '@/lib/supabase/database.types';
import { ApiError } from './errors';
import { requireUserId } from './auth';

export type SubmitCustomOrderPayload = {
  order_type: 'personal' | 'bulk';
  customer_info: Json;
  product_base: Json;
  size_quantity: Json;
  design: Json;
  sundanese_elements?: Json | null;
  order_details?: Json | null;
  shipping?: Json | null;
};

export async function submitCustomOrder(payload: SubmitCustomOrderPayload) {
  const supabase = getSupabaseBrowserClient();
  const userId = await requireUserId(supabase);

  const { data, error, status } = await supabase
    .from('custom_orders')
    .insert({
      user_id: userId,
      ...payload,
    })
    .select('id')
    .single();

  if (error) {
    throw new ApiError(error.message, { status, code: error.code, cause: error });
  }

  return data.id as string;
}

