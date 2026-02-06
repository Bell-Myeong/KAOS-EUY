'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { CartItem } from '@/components/cart/CartItem';
import { EmptyCart } from '@/components/cart/EmptyCart';
import { Button } from '@/components/common/Button';
import { Separator } from '@/components/common/Separator';
import { formatIDR } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  useCartItems,
  useRemoveCartItem,
  useUpdateCartQuantity,
} from '@/lib/hooks/useCart';
import { isForbiddenError } from '@/lib/api/errors';

export default function CartPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { data, isLoading, error } = useCartItems();
  const updateQuantity = useUpdateCartQuantity();
  const removeItem = useRemoveCartItem();

  const items = data ?? [];

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const shippingCost = 0;
  const total = subtotal + shippingCost;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg h-28" />
              ))}
            </div>
            <div className="bg-white rounded-lg h-64" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Sign in required
            </h1>
            <p className="text-gray-600 mb-6">
              Your cart is saved to your account.
            </p>
            <Link href="/auth/sign-in?next=%2Fcart">
              <Button fullWidth>Sign in</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg h-28" />
              ))}
            </div>
            <div className="bg-white rounded-lg h-64" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {isForbiddenError(error) ? '403 Forbidden' : 'Failed to load cart'}
            </h2>
            <p className="text-gray-600 text-sm">{String(error)}</p>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <EmptyCart />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-primary mb-4"
          >
            ← Continue shopping
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Your Cart
          </h1>
          <p className="text-gray-600 mt-2">Total {items.length} item(s)</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <CartItem
                key={`${item.product.id}-${item.size}-${item.color.code}`}
                item={item}
                onUpdateQuantity={(quantity) =>
                  updateQuantity.mutate({
                    productId: item.product.id,
                    size: item.size,
                    colorCode: item.color.code,
                    quantity,
                  })
                }
                onRemove={() =>
                  removeItem.mutate({
                    productId: item.product.id,
                    size: item.size,
                    colorCode: item.color.code,
                  })
                }
              />
            ))}
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4 h-fit">
            <h2 className="text-xl font-bold text-gray-900">Summary</h2>

            <Separator />

            <div className="space-y-3 text-gray-700">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatIDR(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shippingCost === 0 ? 'Free' : formatIDR(shippingCost)}</span>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-primary">
                {formatIDR(total)}
              </span>
            </div>

            <Link href="/checkout">
              <Button fullWidth size="lg">
                Checkout
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

