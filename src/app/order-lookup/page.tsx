'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { Search, AlertCircle, Package, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Separator } from '@/components/common/Separator';
import { Badge } from '@/components/common/Badge';
import { getGuestOrder } from '@/lib/api/guestOrders';
import { formatIDR } from '@/lib/utils';
import { CustomizationDetails } from '@/components/orders/CustomizationDetails';

type OrderStatus =
  | 'pending'
  | 'processing'
  | 'printing'
  | 'shipped'
  | 'completed'
  | 'cancelled';

const statusConfig: Record<
  OrderStatus,
  { label: string; color: 'warning' | 'info' | 'primary' | 'success' | 'danger'; icon: React.ElementType }
> = {
  pending: { label: 'Pending', color: 'warning', icon: Clock },
  processing: { label: 'Processing', color: 'info', icon: Package },
  printing: { label: 'Printing', color: 'primary', icon: Package },
  shipped: { label: 'Shipped', color: 'success', icon: Truck },
  completed: { label: 'Completed', color: 'success', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'danger', icon: XCircle },
};

function OrderLookupInner() {
  const params = useSearchParams();
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    const qOrder = params.get('order_id');
    const qEmail = params.get('email');
    const qToken = params.get('token');
    if (qOrder) setOrderId(qOrder);
    if (qEmail) setEmail(qEmail);
    if (qToken) setToken(qToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lookup = useMutation({
    mutationFn: getGuestOrder,
  });

  const order = (lookup.data?.order ?? null) as any | null;
  const items = (lookup.data?.items ?? []) as any[];

  const createdAt = useMemo(() => {
    const v = order?.created_at;
    return typeof v === 'string' ? new Date(v) : null;
  }, [order]);

  const status = String(order?.status ?? 'pending') as OrderStatus;
  const statusUi = statusConfig[status] ?? statusConfig.pending;
  const StatusIcon = statusUi.icon;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Order</h1>
            <p className="text-gray-600">
              Enter your Order ID, Email, and Lookup Token.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                lookup.mutate({ orderId, email, token });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block font-semibold text-gray-700 mb-2">Order ID</label>
                <input
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="UUID (from your receipt)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="The email used for your order"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-2">Lookup Token</label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Token (from your receipt)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={lookup.isPending}
                leftIcon={Search}
                disabled={lookup.isPending}
              >
                {lookup.isPending ? 'Searching...' : 'Track Order'}
              </Button>
            </form>
          </div>

          {lookup.isError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Order Not Found</h3>
              <p className="text-gray-600">{String(lookup.error)}</p>
            </div>
          )}

          {lookup.data && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-primary to-accent p-6 text-white">
                <div className="flex items-center justify-between mb-3">
                  <div className="min-w-0">
                    <p className="text-white/80 text-sm">Order ID</p>
                    <p className="text-base font-semibold break-all">{orderId}</p>
                  </div>
                  <Badge variant={statusUi.color as any} size="lg">
                    {statusUi.label}
                  </Badge>
                </div>
                <p className="text-white/80 text-sm">
                  {createdAt ? `Ordered on ${createdAt.toLocaleString()}` : ''}
                </p>
              </div>

              <div className="p-6 border-b border-gray-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <StatusIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Current status</p>
                  <p className="text-sm text-gray-600">{statusUi.label}</p>
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Items</h3>
                <div className="space-y-3">
                  {items.map((it, idx) => (
                    <div key={it?.id ?? idx} className="flex justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {String(it?.product_name ?? 'Item')}
                        </p>
                        <p className="text-xs text-gray-600">
                          {String(it?.color_name ?? '')} / {String(it?.size ?? '')} ×{' '}
                          {String(it?.quantity ?? 1)}
                        </p>
                        {Number(it?.custom_fee ?? 0) > 0 && (
                          <p className="text-xs text-gray-600">
                            Custom +{formatIDR(Number(it?.custom_fee ?? 0))}
                          </p>
                        )}
                        <div className="mt-2">
                          <details className="group">
                            <summary className="cursor-pointer text-xs text-primary hover:underline list-none">
                              <span className="group-open:hidden">View customization</span>
                              <span className="hidden group-open:inline">Hide customization</span>
                            </summary>
                            <div className="mt-2">
                              <CustomizationDetails
                                customization={it?.customization}
                                downloadName={
                                  orderId
                                    ? `customization-${orderId}-${String(it?.id ?? idx)}.json`
                                    : undefined
                                }
                                variant="customer"
                              />
                            </div>
                          </details>
                        </div>
                      </div>
                      <p className="font-semibold text-gray-900">
                        {formatIDR(Number(it?.line_total ?? 0))}
                      </p>
                    </div>
                  ))}
                </div>

                <Separator className="my-6" />

                <div className="space-y-2 text-gray-700">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatIDR(Number(order?.subtotal ?? 0))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>
                      {Number(order?.shipping_fee ?? 0) === 0
                        ? 'Free'
                        : formatIDR(Number(order?.shipping_fee ?? 0))}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold text-gray-900">
                    <span>Total</span>
                    <span className="text-primary">{formatIDR(Number(order?.total ?? 0))}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OrderLookupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-56 mb-4" />
              <div className="h-4 bg-gray-200 rounded w-full mb-2" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          </div>
        </div>
      }
    >
      <OrderLookupInner />
    </Suspense>
  );
}
