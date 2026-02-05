'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { ErrorState, LoadingState } from '@/components/common/States';
import { formatCurrency } from '@/lib/utils';
import type { AdminOrderDetail } from '@/types/admin';
import type { StatusGroup } from '@/lib/admin/status';

const STATUS_OPTIONS: StatusGroup[] = ['NEW', 'IN_PROGRESS', 'DONE'];

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('id-ID');
}

function maskPhone(phone?: string | null) {
  if (!phone) return '-';
  if (phone.length <= 4) return phone;
  return `${phone.slice(0, 3)}****${phone.slice(-2)}`;
}

function maskAddress(address?: Record<string, string> | null) {
  if (!address) return '-';
  const line1 = address.address_line1 ? `${address.address_line1.slice(0, 6)}...` : '';
  const city = address.city ? address.city : '';
  const country = address.country ? address.country : '';
  return [line1, city, country].filter(Boolean).join(' / ');
}

function statusVariant(statusGroup: StatusGroup) {
  if (statusGroup === 'NEW') return 'warning';
  if (statusGroup === 'IN_PROGRESS') return 'info';
  return 'success';
}

export default function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [status, setStatus] = useState<StatusGroup>('NEW');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      setAuthError(false);
      try {
        const res = await fetch(`/api/admin/orders/${params.id}`);
        const data = await res.json();
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            setAuthError(true);
            throw new Error('세션이 만료되었거나 권한이 없습니다.');
          }
          throw new Error(data.message || '주문 상세를 불러오지 못했습니다.');
        }
        setOrder(data);
        setStatus(data.statusGroup);
      } catch (err) {
        setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [params.id]);

  const handleSave = async () => {
    if (!order) return;
    setSaving(true);
    setSaveMessage(null);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || '상태 변경에 실패했습니다.');
      }
      setOrder((prev) =>
        prev ? { ...prev, status: data.status, statusGroup: data.statusGroup } : prev
      );
      setSaveMessage('상태가 업데이트되었습니다.');
    } catch (err) {
      setSaveMessage(err instanceof Error ? err.message : '상태 변경 실패');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <LoadingState title="주문 정보를 불러오는 중입니다" description="잠시만 기다려주세요." />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-10">
        <ErrorState
          title={error || '주문을 찾을 수 없습니다.'}
          action={
            authError ? (
              <Link href="/admin/login" className="text-sm text-primary font-semibold">
                로그인 페이지로 이동
              </Link>
            ) : (
              <Link href="/admin" className="text-sm text-primary font-semibold">
                목록으로 돌아가기
              </Link>
            )
          }
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin" className="text-sm text-primary font-semibold">
            목록으로 돌아가기
          </Link>
          <h1 className="text-3xl font-bold text-secondary mt-2">{order.orderNumber}</h1>
          <p className="text-sm text-gray-500">{formatDateTime(order.createdAt)}</p>
        </div>
        <Badge variant={statusVariant(order.statusGroup)}>{order.statusGroup}</Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
            <h2 className="text-lg font-bold text-gray-900">구매자 정보</h2>
            <p className="text-sm text-gray-700">이름: {order.buyerName}</p>
            <p className="text-sm text-gray-700">연락처: {maskPhone(order.buyerPhone)}</p>
            <p className="text-sm text-gray-700">이메일: {order.buyerEmail || '-'}</p>
            <p className="text-sm text-gray-700">배송지: {maskAddress(order.shippingAddress)}</p>
            {order.notes && (
              <p className="text-sm text-gray-600">요청사항: {order.notes}</p>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">주문 아이템</h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex justify-between gap-4">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {item.productName || item.productId || '상품'}
                      </p>
                      {item.options && Object.keys(item.options).length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          {Object.entries(item.options)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {item.quantity} x {formatCurrency(item.unitPriceCents, 'IDR')}
                      </p>
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(item.unitPriceCents * item.quantity, 'IDR')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">상태 변경</h2>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as StatusGroup)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-primary focus:outline-none"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <Button variant="primary" size="sm" onClick={handleSave} loading={saving} fullWidth>
              상태 저장
            </Button>
            {saveMessage && (
              <p className="text-xs text-gray-500 text-center">{saveMessage}</p>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-2">
            <h2 className="text-lg font-bold text-gray-900">금액 요약</h2>
            <p className="text-sm text-gray-700">Subtotal: {formatCurrency(order.subtotalCents, 'IDR')}</p>
            <p className="text-sm text-gray-700">Shipping: {formatCurrency(order.shippingCents, 'IDR')}</p>
            <p className="text-base font-semibold text-gray-900">Total: {formatCurrency(order.totalCents, 'IDR')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}