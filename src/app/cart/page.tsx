'use client';

import Link from 'next/link';
import { CartItem } from '@/components/cart/CartItem';
import { EmptyCart } from '@/components/cart/EmptyCart';
import { Button } from '@/components/common/Button';
import { Separator } from '@/components/common/Separator';
import { formatIDR } from '@/lib/utils';
import { useCartStore } from '@/stores/cart';

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const subtotal = items.reduce(
    (sum, item) =>
      sum + (item.product.price + item.custom_fee_per_unit) * item.quantity,
    0
  );
  const shippingCost = 0;
  const total = subtotal + shippingCost;

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
                key={item.id}
                item={item}
                onUpdateQuantity={(quantity) =>
                  updateQuantity(item.id, quantity)
                }
                onRemove={() =>
                  removeItem(item.id)
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
