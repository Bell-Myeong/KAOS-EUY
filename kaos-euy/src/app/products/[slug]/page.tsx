import { notFound } from 'next/navigation';
import { fetchProductBySlug } from '@/lib/supabase/server';
import ProductDetailClient from './ProductDetailClient';

// 상품 상세는 변경 빈도가 낮아 60초 ISR 적용
export const revalidate = 60;

interface ProductDetailPageProps {
  params: {
    slug: string;
  };
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const product = await fetchProductBySlug(params.slug);

  if (!product || !product.is_active) {
    notFound();
  }

  const options = product.options ?? {};
  const sizes = toStringArray(
    (options as Record<string, unknown>).sizes ??
      (options as Record<string, unknown>).size
  );
  const colors = toStringArray(
    (options as Record<string, unknown>).colors ??
      (options as Record<string, unknown>).color
  );

  return (
    <ProductDetailClient
      product={product}
      sizes={sizes}
      colors={colors}
    />
  );
}
