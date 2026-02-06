'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/common/Button';
import { Separator } from '@/components/common/Separator';
import { useAuth } from '@/contexts/AuthContext';
import { useOrderDetail } from '@/lib/hooks/useOrders';
import { formatIDR } from '@/lib/utils';
import { isForbiddenError } from '@/lib/api/errors';

export default function OrderDetailPage() {
  const params = useParams<{ orderId: string }>();
  const orderId = params?.orderId ?? '';

  const { user, isLoading: authLoading } = useAuth();
  const { data, isLoading, error } = useOrderDetail(orderId);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-56 mb-8" />
          <div className="bg-white rounded-xl border border-gray-200 p-6 h-96" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Sign in required
            </h1>
            <p className="text-gray-600 mb-6">
              Please sign in to view order details.
            </p>
            <Link href={`/auth/sign-in?next=${encodeURIComponent(`/orders/${orderId}`)}`}>
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
          <div className="h-8 bg-gray-200 rounded w-56 mb-8" />
          <div className="bg-white rounded-xl border border-gray-200 p-6 h-96" />
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
              {isForbiddenError(error) ? '403 Forbidden' : 'Failed to load order'}
            </h2>
            <p className="text-gray-600 text-sm">{String(error)}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <p className="text-gray-700 font-semibold mb-2">Order not found</p>
            <Link href="/orders" className="text-primary hover:underline text-sm">
              Back to orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const order = data;
  const items = order.items ?? [];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 truncate">
              Order {order.id}
            </h1>
            <p className="text-sm text-gray-600">
              {new Date(order.created_at).toLocaleString()} · {order.status}
            </p>
          </div>
          <Link href="/orders">
            <Button variant="outline">Back</Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Items</h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {item.product_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {item.color_name} / {item.size} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {formatIDR(item.line_total)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 h-fit">
            <h2 className="text-xl font-bold text-gray-900">Summary</h2>

            <Separator />

            <div className="space-y-3 text-gray-700">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatIDR(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{order.shipping_fee === 0 ? 'Free' : formatIDR(order.shipping_fee)}</span>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-primary">
                {formatIDR(order.total)}
              </span>
            </div>

            <Link href="/products">
              <Button fullWidth>Shop again</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

