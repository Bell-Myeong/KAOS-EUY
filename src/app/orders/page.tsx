'use client';

import Link from 'next/link';
import { PackageOpen } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useMyOrders } from '@/lib/hooks/useOrders';
import { formatIDR } from '@/lib/utils';
import { isForbiddenError } from '@/lib/api/errors';

export default function OrdersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { data, isLoading, error } = useMyOrders();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8" />
          <div className="bg-white rounded-xl border border-gray-200 p-6 h-80" />
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
              <PackageOpen className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Sign in required
            </h1>
            <p className="text-gray-600 mb-6">
              Please sign in to view your orders.
            </p>
            <Link href="/auth/sign-in?next=%2Forders">
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
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 h-20" />
            ))}
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
              {isForbiddenError(error) ? '403 Forbidden' : 'Failed to load orders'}
            </h2>
            <p className="text-gray-600 text-sm">{String(error)}</p>
          </div>
        </div>
      </div>
    );
  }

  const orders = data ?? [];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            My Orders
          </h1>
          <Link href="/products">
            <Button variant="outline">Shop</Button>
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
            <p className="text-gray-700 font-semibold mb-2">No orders yet</p>
            <p className="text-gray-600 text-sm mb-6">
              When you place an order, it will show up here.
            </p>
            <Link href="/products">
              <Button>Browse products</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      Order {order.id}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
                      {order.status}
                    </span>
                    <span className="font-bold text-primary">
                      {formatIDR(order.total)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

