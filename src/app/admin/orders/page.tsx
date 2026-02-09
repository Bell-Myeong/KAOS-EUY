'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Eye, X, Download, Package } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Separator } from '@/components/common/Separator';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { formatIDR } from '@/lib/utils';
import {
  useAdminOrderDetail,
  useAdminOrders,
  useUpdateAdminOrderStatus,
} from '@/lib/hooks/useAdminOrders';
import type { OrderStatus } from '@/lib/api/adminOrders';

const statusOptions: OrderStatus[] = [
  'pending',
  'processing',
  'printing',
  'shipped',
  'completed',
  'cancelled',
];

function safeString(v: unknown) {
  return typeof v === 'string' ? v : '';
}

function safeNumber(v: unknown, fallback = 0) {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback;
}

function getShipping(order: any): { full_address?: string; notes?: string } {
  const s = order?.guest_shipping;
  if (!s || typeof s !== 'object') return {};
  return {
    full_address: safeString((s as any).full_address),
    notes: safeString((s as any).notes),
  };
}

type CustomizationSummary = {
  position: 'front' | 'back' | 'leftArm' | 'rightArm';
  type: 'image' | 'text';
  value: string;
};

type CustomPosition = 'front' | 'back' | 'leftArm' | 'rightArm';

type CustomizationPart = {
  applied: boolean;
  image_url: string | null;
  text: string;
  position: { x: number; y: number };
  scale: number;
};

type CustomizationPartsByPosition = Record<CustomPosition, CustomizationPart>;

function getCustomizationParts(customization: unknown): CustomizationPartsByPosition | null {
  if (!customization || typeof customization !== 'object') return null;
  const parts = (customization as any).parts;
  if (!parts || typeof parts !== 'object') return null;

  const normalizePart = (raw: any): CustomizationPart => {
    const imageUrl = safeString(raw?.image_url);
    const text = safeString(raw?.text);
    const pos = raw?.position ?? {};
    const x = safeNumber(pos?.x, 0);
    const y = safeNumber(pos?.y, 0);
    const scale = safeNumber(raw?.scale, 1);
    const applied =
      Boolean(raw?.applied) || Boolean(imageUrl) || text.trim().length > 0;

    return {
      applied,
      image_url: imageUrl ? imageUrl : null,
      text,
      position: { x, y },
      scale: Math.max(0.5, Math.min(2, scale)),
    };
  };

  const fallback: CustomizationPart = {
    applied: false,
    image_url: null,
    text: '',
    position: { x: 0, y: 0 },
    scale: 1,
  };

  return {
    front: normalizePart((parts as any).front ?? fallback),
    back: normalizePart((parts as any).back ?? fallback),
    leftArm: normalizePart((parts as any).leftArm ?? fallback),
    rightArm: normalizePart((parts as any).rightArm ?? fallback),
  };
}

function getCustomizationSummary(customization: unknown): CustomizationSummary[] {
  const parts = getCustomizationParts(customization);
  if (!parts) return [];

  const out: CustomizationSummary[] = [];
  (['front', 'back', 'leftArm', 'rightArm'] as const).forEach((pos) => {
    const part = parts[pos];
    const imageUrl = safeString(part.image_url);
    const text = safeString(part.text).trim();
    if (imageUrl) out.push({ position: pos, type: 'image', value: imageUrl });
    else if (text) out.push({ position: pos, type: 'text', value: text });
  });
  return out;
}

function downloadJson(filename: string, data: unknown) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function AdminOrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const { data, isLoading, error } = useAdminOrders({
    status: statusFilter === 'all' ? undefined : statusFilter,
  });
  const detail = useAdminOrderDetail(selectedOrderId);
  const updateStatus = useUpdateAdminOrderStatus();

  const orders = useMemo(() => {
    const list = data ?? [];
    if (!searchTerm.trim()) return list;

    const q = searchTerm.trim().toLowerCase();
    return list.filter((o) => {
      const email = (o.guest_email ?? '').toLowerCase();
      const name = (o.guest_name ?? '').toLowerCase();
      const id = (o.id ?? '').toLowerCase();
      return email.includes(q) || name.includes(q) || id.includes(q);
    });
  }, [data, searchTerm]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500">Manage and track guest orders</p>
        </div>
        <Button variant="outline" leftIcon={Download} disabled>
          Export CSV
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order id, name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
              className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
            >
              <option value="all">All Status</option>
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-3" />
          <div className="h-4 bg-gray-200 rounded w-full mb-2" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="font-semibold text-gray-900 mb-2">Failed to load orders</p>
          <p className="text-sm text-gray-600">{String(error)}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm text-primary font-medium">
                        {order.id.slice(0, 8)}…
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {order.guest_name ?? 'Guest'}
                        </p>
                        <p className="text-sm text-gray-500">{order.guest_email ?? '-'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={order.status as any} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {formatIDR(order.total)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">{formatDate(order.created_at)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => setSelectedOrderId(order.id)}
                        className="text-primary hover:text-primary/80 p-2"
                        aria-label="View"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {orders.length === 0 && (
            <div className="p-12 text-center">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No orders found</p>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {selectedOrderId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedOrderId(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Order Details</h2>
                  <p className="text-sm text-gray-500 font-mono">{selectedOrderId}</p>
                </div>
                <button
                  onClick={() => setSelectedOrderId(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {detail.isLoading ? (
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-56 mb-3" />
                    <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                  </div>
                ) : detail.error ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {String(detail.error)}
                  </div>
                ) : detail.data ? (
                  <>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <div className="mt-1">
                          <StatusBadge status={detail.data.status as any} />
                        </div>
                      </div>

                      <div className="min-w-[200px]">
                        <p className="text-sm text-gray-500 mb-1">Update status</p>
                        <select
                          value={detail.data.status as any}
                          onChange={(e) => {
                            const orderId = detail.data?.id;
                            if (!orderId) return;
                            updateStatus.mutate({
                              orderId,
                              status: e.target.value as OrderStatus,
                            });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                          disabled={updateStatus.isPending}
                        >
                          {statusOptions.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        {updateStatus.error && (
                          <p className="text-xs text-red-600 mt-1">
                            {String(updateStatus.error)}
                          </p>
                        )}
                      </div>
                    </div>

                    <Separator />

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-gray-900">Customer</h3>
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Name:</span>{' '}
                          {detail.data.guest_name ?? 'Guest'}
                        </p>
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Email:</span>{' '}
                          {detail.data.guest_email ?? '-'}
                        </p>
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Phone:</span>{' '}
                          {detail.data.guest_phone ?? '-'}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-semibold text-gray-900">Shipping</h3>
                        {(() => {
                          const s = getShipping(detail.data as any);
                          return (
                            <>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                {s.full_address || '-'}
                              </p>
                              {s.notes ? (
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Notes:</span> {s.notes}
                                </p>
                              ) : null}
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Items</h3>
                      <div className="space-y-3">
                        {detail.data.items.map((it) => (
                          <div key={it.id} className="flex justify-between gap-4">
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 truncate">
                                {it.product_name}
                              </p>
                              <p className="text-xs text-gray-600">
                                {it.color_name} / {it.size} × {it.quantity}
                              </p>
                               {it.custom_fee > 0 && (
                                 <p className="text-xs text-gray-600">
                                   Custom +{formatIDR(it.custom_fee)}
                                 </p>
                               )}
                               {(() => {
                                 const parts = getCustomizationParts(it.customization);
                                 const summary = getCustomizationSummary(it.customization);
                                 if (!parts || summary.length === 0) return null;

                                 const posLabel: Record<CustomPosition, string> = {
                                   front: 'Front',
                                   back: 'Back',
                                   leftArm: 'Left sleeve',
                                   rightArm: 'Right sleeve',
                                 };

                                 const orderId = detail.data?.id ?? 'order';

                                 return (
                                   <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-3">
                                     <div className="flex items-center justify-between gap-3">
                                       <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                         Customization
                                       </p>
                                       <button
                                         type="button"
                                         onClick={() =>
                                           downloadJson(
                                             `customization-${orderId}-${it.id}.json`,
                                             it.customization
                                           )
                                         }
                                         className="text-xs text-primary hover:underline"
                                       >
                                         Download JSON
                                       </button>
                                     </div>

                                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                       {(Object.keys(parts) as CustomPosition[]).map((pos) => {
                                         const part = parts[pos];
                                         const imageUrl = part.image_url;
                                         const text = part.text.trim();
                                         const kind: 'image' | 'text' | 'none' =
                                           imageUrl ? 'image' : text ? 'text' : 'none';

                                         return (
                                           <div
                                             key={pos}
                                             className="rounded-lg bg-white border border-gray-200 p-3"
                                           >
                                             <div className="flex items-center justify-between gap-2">
                                               <p className="text-sm font-medium text-gray-900">
                                                 {posLabel[pos]}
                                               </p>
                                               <span
                                                 className={`text-[11px] px-2 py-0.5 rounded-full border ${
                                                   kind === 'image'
                                                     ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                     : kind === 'text'
                                                       ? 'bg-amber-50 text-amber-800 border-amber-200'
                                                       : 'bg-gray-50 text-gray-600 border-gray-200'
                                                 }`}
                                               >
                                                 {kind === 'image'
                                                   ? 'Image'
                                                   : kind === 'text'
                                                     ? 'Text'
                                                     : 'None'}
                                               </span>
                                             </div>

                                             <div className="mt-2 grid grid-cols-2 gap-3 items-start">
                                               <div className="relative aspect-square rounded-md bg-gray-100 border border-gray-200 overflow-hidden">
                                                 {(imageUrl || text) ? (
                                                   <div
                                                     className="absolute left-1/2 top-1/2"
                                                     style={{
                                                       transform: `translate(-50%, -50%) translate(${part.position.x}%, ${part.position.y}%) scale(${part.scale})`,
                                                     }}
                                                   >
                                                     {imageUrl ? (
                                                       // eslint-disable-next-line @next/next/no-img-element
                                                       <img
                                                         src={imageUrl}
                                                         alt={`${pos} design`}
                                                         className="w-14 h-14 object-contain drop-shadow-sm"
                                                       />
                                                     ) : (
                                                       <div className="max-w-[96px] text-center text-[11px] font-semibold text-gray-900 leading-snug whitespace-pre-wrap break-words">
                                                         {text}
                                                       </div>
                                                     )}
                                                   </div>
                                                 ) : null}
                                               </div>

                                               <div className="space-y-1 text-xs text-gray-700">
                                                 <p>
                                                   <span className="text-gray-500">x/y:</span>{' '}
                                                   {Math.round(part.position.x)},{' '}
                                                   {Math.round(part.position.y)}
                                                 </p>
                                                 <p>
                                                   <span className="text-gray-500">scale:</span>{' '}
                                                   {part.scale.toFixed(2)}
                                                 </p>
                                                 {kind === 'image' && imageUrl ? (
                                                   <a
                                                     href={imageUrl}
                                                     target="_blank"
                                                     rel="noreferrer"
                                                     className="inline-block text-primary hover:underline"
                                                   >
                                                     Open image
                                                   </a>
                                                 ) : null}
                                                 {kind === 'text' && text ? (
                                                   <p className="text-gray-600 line-clamp-3">
                                                     <span className="text-gray-500">text:</span>{' '}
                                                     {text}
                                                   </p>
                                                 ) : null}
                                               </div>
                                             </div>
                                           </div>
                                         );
                                       })}
                                     </div>
                                   </div>
                                 );
                               })()}
                             </div>
                             <p className="font-semibold text-gray-900">
                               {formatIDR(it.line_total)}
                             </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2 text-gray-700">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>{formatIDR(detail.data.subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span>
                          {detail.data.shipping_fee === 0
                            ? 'Free'
                            : formatIDR(detail.data.shipping_fee)}
                        </span>
                      </div>
                      <div className="flex justify-between font-semibold text-gray-900">
                        <span>Total</span>
                        <span className="text-primary">{formatIDR(detail.data.total)}</span>
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
