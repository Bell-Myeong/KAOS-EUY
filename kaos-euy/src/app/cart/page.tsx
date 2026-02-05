'use client';

import Link from 'next/link';
import { useCartStore } from '@/stores/cart';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/States';

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const subtotal = useCartStore((state) => state.getSubtotal());

  const currency = items[0]?.currency ?? 'IDR';

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <EmptyState
            title="장바구니가 비어있습니다"
            description="마음에 드는 상품을 담아보세요."
            action={(
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-white font-semibold hover:bg-primary/90"
              >
                계속 쇼핑하기
              </Link>
            )}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-600 mt-2">총 {items.length}개 품목</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.key}
                className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4"
              >
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-xs text-gray-400">
                      No Image
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {item.name}
                      </h3>
                      {Object.keys(item.selectedOptions).length > 0 && (
                        <div className="text-sm text-gray-500 mt-1">
                          {Object.entries(item.selectedOptions)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(' / ')}
                        </div>
                      )}
                      <div className="mt-2 text-primary font-semibold">
                        {formatCurrency(item.unitPriceCents, item.currency)}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.key)}
                      className="text-sm text-gray-400 hover:text-red-500"
                    >
                      삭제
                    </button>
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.key, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="h-8 w-8 rounded border border-gray-200 text-gray-600 disabled:text-gray-300"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(event) => {
                        const next = Math.max(1, Number(event.target.value) || 1);
                        updateQuantity(item.key, next);
                      }}
                      className="w-16 h-8 text-center border border-gray-200 rounded"
                    />
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.key, item.quantity + 1)}
                      className="h-8 w-8 rounded border border-gray-200 text-gray-600"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <div className="sticky top-6 bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal, currency)}</span>
              </div>
              <div className="border-t border-gray-200 pt-4 flex justify-between text-gray-900 font-semibold">
                <span>Total</span>
                <span>{formatCurrency(subtotal, currency)}</span>
              </div>
              <Link href="/checkout">
                <Button variant="secondary" size="lg" fullWidth>
                  Checkout
                </Button>
              </Link>
              <Link href="/">
                <Button variant="ghost" size="md" fullWidth>
                  계속 쇼핑하기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
