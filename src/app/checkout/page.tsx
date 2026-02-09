'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CreditCard } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/common/Button';
import { Separator } from '@/components/common/Separator';
import { EmptyCart } from '@/components/cart/EmptyCart';
import { useCartStore } from '@/stores/cart';
import { useCreateGuestOrder } from '@/lib/hooks/useGuestOrders';
import { formatIDR } from '@/lib/utils';

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const createOrder = useCreateGuestOrder();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const subtotal = useMemo(() => {
    return items.reduce(
      (sum, item) =>
        sum + (item.product.price + item.custom_fee_per_unit) * item.quantity,
      0
    );
  }, [items]);
  const shippingFee = 0;
  const total = subtotal + shippingFee;

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
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
          Checkout
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Contact</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    required
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Name (optional)
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    type="text"
                    placeholder="Your name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone (optional)
                  </label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    type="tel"
                    placeholder="+62 ..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Shipping</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    placeholder="Full address"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Notes (optional)
                  </label>
                  <input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    type="text"
                    placeholder="Delivery instructions"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Items</h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={`${item.product.id}-${item.size}-${item.color.code}`}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {item.product.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {item.color.name} / {item.size} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      {formatIDR(
                        (item.product.price + item.custom_fee_per_unit) *
                          item.quantity
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 h-fit">
            <h2 className="text-xl font-bold text-gray-900">Summary</h2>

            <Separator />

            <div className="space-y-3 text-gray-700">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatIDR(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shippingFee === 0 ? 'Free' : formatIDR(shippingFee)}</span>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-primary">
                {formatIDR(total)}
              </span>
            </div>

            {createOrder.error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {String(createOrder.error)}
              </div>
            )}

            <Button
              fullWidth
              size="lg"
              loading={createOrder.isPending}
              disabled={createOrder.isPending || !email || !address}
              onClick={async () => {
                const { orderId, lookupToken } = await createOrder.mutateAsync({
                  items,
                  customer: { email, name, phone },
                  shipping: { full_address: address, notes },
                });

                clearCart();
                router.push(
                  `/checkout/thank-you?order_id=${encodeURIComponent(
                    orderId
                  )}&token=${encodeURIComponent(lookupToken)}&email=${encodeURIComponent(
                    email
                  )}`
                );
              }}
            >
              Place order
            </Button>

            <Link href="/cart">
              <Button variant="ghost" fullWidth>
                Back to cart
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
