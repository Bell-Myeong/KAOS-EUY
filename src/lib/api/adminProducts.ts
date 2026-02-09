import { getSupabaseBrowserClient } from '@/lib/supabase/browser';
import type { Product, ProductColor, Size } from '@/types';
import { ApiError } from '@/lib/api/errors';

function parseProductColors(input: unknown): ProductColor[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((c) => {
      if (!c || typeof c !== 'object') return null;
      const anyC = c as { code?: unknown; name?: unknown };
      if (typeof anyC.code !== 'string' || typeof anyC.name !== 'string') return null;
      return { code: anyC.code, name: anyC.name } satisfies ProductColor;
    })
    .filter((x): x is ProductColor => Boolean(x));
}

export type AdminProductInput = {
  name: string;
  slug: string;
  description: string;
  price: number;
  images: string[];
  sizes: Size[];
  colors: ProductColor[];
  in_stock: boolean;
  is_customizable: boolean;
};

export async function createProduct(input: AdminProductInput): Promise<Product> {
  const supabase = getSupabaseBrowserClient();
  const { data, error, status } = await supabase
    .from('products')
    .insert({
      name: input.name,
      slug: input.slug,
      description: input.description,
      price: input.price,
      images: input.images,
      sizes: input.sizes,
      colors: input.colors as unknown as any,
      in_stock: input.in_stock,
      is_customizable: input.is_customizable,
    })
    .select('*')
    .single();

  if (error) {
    throw new ApiError(error.message, { status, code: error.code, cause: error });
  }

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    description: data.description ?? '',
    price: data.price,
    images: Array.isArray(data.images) ? data.images : [],
    sizes: (Array.isArray(data.sizes) ? data.sizes : []) as Size[],
    colors: parseProductColors(data.colors),
    in_stock: data.in_stock,
    is_customizable: data.is_customizable,
  };
}

export async function updateProduct(
  productId: string,
  input: Partial<AdminProductInput>
): Promise<Product> {
  const supabase = getSupabaseBrowserClient();
  const { data, error, status } = await supabase
    .from('products')
    .update({
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.slug !== undefined ? { slug: input.slug } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.price !== undefined ? { price: input.price } : {}),
      ...(input.images !== undefined ? { images: input.images } : {}),
      ...(input.sizes !== undefined ? { sizes: input.sizes } : {}),
      ...(input.colors !== undefined ? { colors: input.colors as unknown as any } : {}),
      ...(input.in_stock !== undefined ? { in_stock: input.in_stock } : {}),
      ...(input.is_customizable !== undefined ? { is_customizable: input.is_customizable } : {}),
    })
    .eq('id', productId)
    .select('*')
    .single();

  if (error) {
    throw new ApiError(error.message, { status, code: error.code, cause: error });
  }

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    description: data.description ?? '',
    price: data.price,
    images: Array.isArray(data.images) ? data.images : [],
    sizes: (Array.isArray(data.sizes) ? data.sizes : []) as Size[],
    colors: parseProductColors(data.colors),
    in_stock: data.in_stock,
    is_customizable: data.is_customizable,
  };
}

export async function deleteProduct(productId: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error, status } = await supabase.from('products').delete().eq('id', productId);
  if (error) {
    throw new ApiError(error.message, { status, code: error.code, cause: error });
  }
}
