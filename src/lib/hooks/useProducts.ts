'use client';

import { useQuery } from '@tanstack/react-query';
import type { ProductCategory } from '@/types';
import { fetchProducts } from '@/lib/api/products';
import { queryKeys } from '@/lib/query/keys';

export function useProducts(filters: {
  slug?: string;
  category?: ProductCategory;
  inStock?: boolean;
}) {
  return useQuery({
    queryKey: queryKeys.products(filters),
    queryFn: () => fetchProducts(filters),
  });
}

