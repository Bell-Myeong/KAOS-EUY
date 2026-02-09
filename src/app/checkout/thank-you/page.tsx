'use client';

import Link from 'next/link';
import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Copy, Check, Search } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Separator } from '@/components/common/Separator';
import { useGuestOrderDetail } from '@/lib/hooks/useGuestOrders';
import { formatIDR } from '@/lib/utils';
import { CustomizationDetails } from '@/components/orders/CustomizationDetails';

function ThankYouInner() {
  const params = useSearchParams();
  const orderId = params.get('order_id');
  const token = params.get('token');
  const email = params.get('email');

  const { data, isLoading, error } = useGuestOrderDetail({
    orderId,
    token,
    email,
  });

  const [copied, setCopied] = useState<null | 'order' | 'token'>(null);

  const order = data?.order ?? null;
  const items = data?.items ?? [];

  const createdAt = useMemo(() => {
    const v = (order as any)?.created_at;
    return typeof v === 'string' ? new Date(v) : null;
  }, [order]);

  const subtotal = Number((order as any)?.subtotal ?? 0);
  const shippingFee = Number((order as any)?.shipping_fee ?? 0);
  const total = Number((order as any)?.total ?? 0);

  const copy = async (kind: 'order' | 'token', value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(kind);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-5 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Order received
            </h1>
            <p className="text-gray-600">
              Save your Order ID and Lookup Token to track your order.
            </p>
          </div>

          {!orderId || !token || !email ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <p className="font-semibold text-gray-900 mb-2">Missing receipt info</p>
              <p className="text-sm text-gray-600">
                Please return to checkout and place the order again.
              </p>
              <div className="mt-4">
                <Link href="/checkout">
                  <Button>Back to checkout</Button>
                </Link>
              </div>
            </div>
          ) : isLoading ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-56 mb-3" />
              <div className="h-4 bg-gray-200 rounded w-full mb-2" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          ) : error ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <p className="font-semibold text-gray-900 mb-2">Failed to load order</p>
              <p className="text-sm text-gray-600">{String(error)}</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Order ID</p>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-semibold text-primary break-all">
                      {orderId}
                    </code>
                    <button
                      onClick={() => copy('order', orderId)}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Copy"
                    >
                      {copied === 'order' ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Lookup Token</p>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-semibold text-primary break-all">
                      {token}
                    </code>
                    <button
                      onClick={() => copy('token', token)}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Copy"
                    >
                      {copied === 'token' ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="text-sm text-gray-700 space-y-1">
                <p>
                  <span className="font-semibold">Email:</span> {email}
                </p>
                <p>
                  <span className="font-semibold">Placed:</span>{' '}
                  {createdAt ? createdAt.toLocaleString() : '-'}
                </p>
                <p>
                  <span className="font-semibold">Status:</span>{' '}
                  {String((order as any)?.status ?? 'pending')}
                </p>
              </div>

              <Separator className="my-6" />

              <div className="space-y-2">
                {items.map((it: any, idx: number) => (
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
                  <span>{formatIDR(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shippingFee === 0 ? 'Free' : formatIDR(shippingFee)}</span>
                </div>
                <div className="flex justify-between font-semibold text-gray-900">
                  <span>Total</span>
                  <span className="text-primary">{formatIDR(total)}</span>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link
                  className="flex-1"
                  href={`/order-lookup?order_id=${encodeURIComponent(
                    orderId
                  )}&token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`}
                >
                  <Button fullWidth leftIcon={Search}>
                    Track order
                  </Button>
                </Link>
                <Link className="flex-1" href="/products">
                  <Button variant="outline" fullWidth>
                    Continue shopping
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-56 mb-4" />
              <div className="h-4 bg-gray-200 rounded w-full mb-2" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          </div>
        </div>
      }
    >
      <ThankYouInner />
    </Suspense>
  );
}
