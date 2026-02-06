import { getSupabaseBrowserClient } from '@/lib/supabase/browser';
import type { Database } from '@/lib/supabase/database.types';
import type { Product, ProductCategory, ProductColor, Size } from '@/types';
import { ApiError } from './errors';

type DbProduct = Database['public']['Tables']['products']['Row'];

function parseProductColors(colors: DbProduct['colors']): ProductColor[] {
  if (!Array.isArray(colors)) return [];

  return colors
    .map((c) => {
      if (!c || typeof c !== 'object') return null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const anyC = c as any;
      if (typeof anyC.code !== 'string' || typeof anyC.name !== 'string') {
        return null;
      }
      return { code: anyC.code, name: anyC.name } satisfies ProductColor;
    })
    .filter((x): x is ProductColor => Boolean(x));
}

function normalizeProduct(p: DbProduct): Product {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description ?? '',
    price: p.price,
    images: Array.isArray(p.images) ? p.images : [],
    category: p.category as ProductCategory,
    sizes: (Array.isArray(p.sizes) ? p.sizes : []) as Size[],
    colors: parseProductColors(p.colors),
    in_stock: p.in_stock,
    is_customizable: p.is_customizable,
  };
}

export async function fetchProducts(params?: {
  slug?: string;
  category?: ProductCategory;
  inStock?: boolean;
}) {
  const supabase = getSupabaseBrowserClient();

  let query = supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (params?.slug) query = query.eq('slug', params.slug);
  if (params?.category) query = query.eq('category', params.category);
  if (typeof params?.inStock === 'boolean') {
    query = query.eq('in_stock', params.inStock);
  }

  const { data, error, status } = await query;

  if (error) {
    throw new ApiError(error.message, { status, code: error.code, cause: error });
  }

  return (data ?? []).map(normalizeProduct);
}

