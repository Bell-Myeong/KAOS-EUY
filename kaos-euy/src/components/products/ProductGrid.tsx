import type { Product } from '@/types';
import { ProductCard } from './ProductCard';

export interface ProductGridProps {
  products: Product[];
  onQuickAdd?: (product: Product) => void;
}

export function ProductGrid({ products, onQuickAdd }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-xl text-gray-500">상품이 없습니다</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onQuickAdd={onQuickAdd}
        />
      ))}
    </div>
  );
}
