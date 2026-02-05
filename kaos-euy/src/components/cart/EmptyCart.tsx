import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/common/Button';

export function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
        <ShoppingCart className="w-12 h-12 text-gray-400" />
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-3">
        Your cart is empty
      </h2>

      <p className="text-gray-600 mb-8 max-w-md">
        Add your favorite products to your cart!
      </p>

      <Link href="/products">
        <Button variant="primary" size="lg">
          Browse Products
        </Button>
      </Link>
    </div>
  );
}
