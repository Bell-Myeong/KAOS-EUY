import { getSupabaseBrowserClient } from '@/lib/supabase/browser';
import type { ProductColor, Size, CartItem, Product } from '@/types';
import { ApiError } from './errors';
import { requireUserId } from './auth';

export type CartVariantKey = {
  productId: string;
  size: Size;
  colorCode: string;
};

export async function getCartItems(): Promise<CartItem[]> {
  const supabase = getSupabaseBrowserClient();
  await requireUserId(supabase);

  const { data, error, status } = await supabase
    .from('cart_items')
    .select(
      `
      quantity,
      size,
      color_code,
      color_name,
      product:products (
        id,
        name,
        slug,
        description,
        price,
        images,
        category,
        sizes,
        colors,
        in_stock,
        is_customizable
      )
    `
    )
    .order('created_at', { ascending: false });

  if (error) {
    throw new ApiError(error.message, { status, code: error.code, cause: error });
  }

  return (data ?? [])
    .map((row) => {
      const product = row.product as unknown as Product | null;
      if (!product) return null;

      const color: ProductColor = {
        code: row.color_code,
        name: row.color_name,
      };

      return {
        product,
        quantity: row.quantity,
        size: row.size as Size,
        color,
      } satisfies CartItem;
    })
    .filter((x): x is CartItem => Boolean(x));
}

export async function upsertCartItem(input: {
  productId: string;
  size: Size;
  color: ProductColor;
  quantity: number;
}) {
  const supabase = getSupabaseBrowserClient();
  const userId = await requireUserId(supabase);

  const { data: existing, error: existingError, status: existingStatus } =
    await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', userId)
      .eq('product_id', input.productId)
      .eq('size', input.size)
      .eq('color_code', input.color.code)
      .maybeSingle();

  if (existingError) {
    throw new ApiError(existingError.message, {
      status: existingStatus,
      code: existingError.code,
      cause: existingError,
    });
  }

  if (existing) {
    const nextQuantity = existing.quantity + input.quantity;
    const { error, status } = await supabase
      .from('cart_items')
      .update({ quantity: nextQuantity })
      .eq('id', existing.id);

    if (error) {
      throw new ApiError(error.message, { status, code: error.code, cause: error });
    }

    return;
  }

  const { error, status } = await supabase.from('cart_items').insert({
    user_id: userId,
    product_id: input.productId,
    size: input.size,
    color_code: input.color.code,
    color_name: input.color.name,
    quantity: input.quantity,
  });

  if (error) {
    throw new ApiError(error.message, { status, code: error.code, cause: error });
  }
}

export async function updateCartItemQuantity(input: CartVariantKey & { quantity: number }) {
  const supabase = getSupabaseBrowserClient();
  await requireUserId(supabase);

  if (input.quantity <= 0) {
    await removeCartItem(input);
    return;
  }

  const { error, status } = await supabase
    .from('cart_items')
    .update({ quantity: input.quantity })
    .eq('product_id', input.productId)
    .eq('size', input.size)
    .eq('color_code', input.colorCode);

  if (error) {
    throw new ApiError(error.message, { status, code: error.code, cause: error });
  }
}

export async function removeCartItem(input: CartVariantKey) {
  const supabase = getSupabaseBrowserClient();
  await requireUserId(supabase);

  const { error, status } = await supabase
    .from('cart_items')
    .delete()
    .eq('product_id', input.productId)
    .eq('size', input.size)
    .eq('color_code', input.colorCode);

  if (error) {
    throw new ApiError(error.message, { status, code: error.code, cause: error });
  }
}

