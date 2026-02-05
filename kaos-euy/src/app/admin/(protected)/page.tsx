'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { EmptyState, ErrorState, LoadingState } from '@/components/common/States';
import { formatCurrency } from '@/lib/utils';
import type { AdminCustomRequestListItem, AdminOrderListItem } from '@/types/admin';
import type { StatusGroup } from '@/lib/admin/status';

type TabKey = 'orders' | 'custom';
type StatusFilter = 'ALL' | StatusGroup;

const STATUS_FILTERS: StatusFilter[] = ['ALL', 'NEW', 'IN_PROGRESS', 'DONE'];

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('id-ID');
}

function statusVariant(statusGroup: StatusGroup) {
  if (statusGroup === 'NEW') return 'warning';
  if (statusGroup === 'IN_PROGRESS') return 'info';
  return 'success';
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>('orders');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState(false);

  const [orders, setOrders] = useState<AdminOrderListItem[]>([]);
  const [orderNextOffset, setOrderNextOffset] = useState<number | null>(null);

  const [customRequests, setCustomRequests] = useState<AdminCustomRequestListItem[]>([]);
  const [customNextOffset, setCustomNextOffset] = useState<number | null>(null);

  const activeList = useMemo(() => {
    return tab === 'orders' ? orders : customRequests;
  }, [tab, orders, customRequests]);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const handleAuthFailure = () => {
    setAuthError(true);
    setError('세션이 만료되었거나 권한이 없습니다. 다시 로그인해주세요.');
  };

  const loadOrders = async (append = false) => {
    setError(null);
    setAuthError(false);
    setLoading(true);

    const offset = append && orderNextOffset != null ? orderNextOffset : 0;
    try {
      const res = await fetch(`/api/admin/orders?status=${statusFilter}&limit=20&offset=${offset}`);
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          handleAuthFailure();
          return;
        }
        throw new Error(data.message || '주문 목록을 불러오지 못했습니다.');
      }
      setOrders((prev) => (append ? [...prev, ...data.items] : data.items));
      setOrderNextOffset(data.nextOffset ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadCustomRequests = async (append = false) => {
    setError(null);
    setAuthError(false);
    setLoading(true);

    const offset = append && customNextOffset != null ? customNextOffset : 0;
    try {
      const res = await fetch(`/api/admin/custom-requests?status=${statusFilter}&limit=20&offset=${offset}`);
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          handleAuthFailure();
          return;
        }
        throw new Error(data.message || '요청 목록을 불러오지 못했습니다.');
      }
      setCustomRequests((prev) => (append ? [...prev, ...data.items] : data.items));
      setCustomNextOffset(data.nextOffset ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 'orders') {
      loadOrders(false);
    } else {
      loadCustomRequests(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, statusFilter]);

  const handleLoadMore = () => {
    if (tab === 'orders') {
      loadOrders(true);
    } else {
      loadCustomRequests(true);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-secondary">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            주문과 커스텀 요청을 최신순으로 확인하세요.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          로그아웃
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-6">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={tab === 'orders' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setTab('orders')}
          >
            Orders
          </Button>
          <Button
            variant={tab === 'custom' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setTab('custom')}
          >
            Custom Requests
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 lg:ml-auto">
          {STATUS_FILTERS.map((filter) => (
            <Button
              key={filter}
              variant={statusFilter === filter ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(filter)}
            >
              {filter}
            </Button>
          ))}
        </div>
      </div>

      {error && (
        <ErrorState
          title="요청 처리 중 문제가 발생했습니다."
          description={error}
          action={
            authError ? (
              <Link href="/admin/login" className="text-sm text-primary font-semibold">
                로그인 페이지로 이동
              </Link>
            ) : undefined
          }
        />
      )}

      {loading && activeList.length === 0 ? (
        <LoadingState
          title="데이터를 불러오는 중입니다"
          description="잠시만 기다려주세요."
        />
      ) : activeList.length === 0 ? (
        <EmptyState
          title="표시할 데이터가 없습니다"
          description="필터 조건을 변경하거나 나중에 다시 확인해주세요."
        />
      ) : tab === 'orders' ? (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/admin/orders/${order.id}`}
              className="block rounded-xl border border-gray-200 bg-white p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <p className="text-sm text-gray-500">{formatDateTime(order.createdAt)}</p>
                  <h3 className="text-lg font-semibold text-gray-900">{order.orderNumber}</h3>
                  <p className="text-sm text-gray-600">{order.buyerName}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={statusVariant(order.statusGroup)}>{order.statusGroup}</Badge>
                  <span className="text-lg font-bold text-primary">
                    {formatCurrency(order.totalCents, 'IDR')}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {customRequests.map((request) => (
            <Link
              key={request.id}
              href={`/admin/custom-requests/${request.id}`}
              className="block rounded-xl border border-gray-200 bg-white p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <p className="text-sm text-gray-500">{formatDateTime(request.createdAt)}</p>
                  <h3 className="text-lg font-semibold text-gray-900">{request.requestNumber}</h3>
                  <p className="text-sm text-gray-600">
                    {request.orgName || request.requesterName}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={statusVariant(request.statusGroup)}>{request.statusGroup}</Badge>
                  <span className="text-sm text-gray-600">
                    Qty {request.quantityEstimate ?? '-'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-6 flex justify-center">
        {tab === 'orders' && orderNextOffset != null && (
          <Button variant="outline" size="sm" onClick={handleLoadMore} disabled={loading}>
            더보기
          </Button>
        )}
        {tab === 'custom' && customNextOffset != null && (
          <Button variant="outline" size="sm" onClick={handleLoadMore} disabled={loading}>
            더보기
          </Button>
        )}
      </div>
    </div>
  );
}
