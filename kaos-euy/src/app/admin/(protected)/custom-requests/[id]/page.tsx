'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { ErrorState, LoadingState } from '@/components/common/States';
import { formatNumber } from '@/lib/utils';
import type { AdminCustomRequestDetail } from '@/types/admin';
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

function statusVariant(statusGroup: StatusGroup) {
  if (statusGroup === 'NEW') return 'warning';
  if (statusGroup === 'IN_PROGRESS') return 'info';
  return 'success';
}

export default function AdminCustomRequestDetailPage({ params }: { params: { id: string } }) {
  const [detail, setDetail] = useState<AdminCustomRequestDetail | null>(null);
  const [status, setStatus] = useState<StatusGroup>('NEW');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [fileLoadingId, setFileLoadingId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      setAuthError(false);
      try {
        const res = await fetch(`/api/admin/custom-requests/${params.id}`);
        const data = await res.json();
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            setAuthError(true);
            throw new Error('세션이 만료되었거나 권한이 없습니다.');
          }
          throw new Error(data.message || '요청 상세를 불러오지 못했습니다.');
        }
        setDetail(data);
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
    if (!detail) return;
    setSaving(true);
    setSaveMessage(null);
    try {
      const res = await fetch(`/api/admin/custom-requests/${detail.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || '상태 변경에 실패했습니다.');
      }
      setDetail((prev) =>
        prev ? { ...prev, status: data.status, statusGroup: data.statusGroup } : prev
      );
      setSaveMessage('상태가 업데이트되었습니다.');
    } catch (err) {
      setSaveMessage(err instanceof Error ? err.message : '상태 변경 실패');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenFile = async (bucket: string, path: string, fileId: string) => {
    setFileLoadingId(fileId);
    try {
      const query = new URLSearchParams({ bucket, path });
      const res = await fetch(`/api/admin/files/signed-url?${query.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Signed URL 발급 실패');
      }
      window.open(data.signedUrl, '_blank');
    } catch (err) {
      setSaveMessage(err instanceof Error ? err.message : '파일 열기에 실패했습니다.');
    } finally {
      setFileLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <LoadingState title="요청 정보를 불러오는 중입니다" description="잠시만 기다려주세요." />
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="container mx-auto px-4 py-10">
        <ErrorState
          title={error || '요청을 찾을 수 없습니다.'}
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
          <h1 className="text-3xl font-bold text-secondary mt-2">{detail.requestNumber}</h1>
          <p className="text-sm text-gray-500">{formatDateTime(detail.createdAt)}</p>
        </div>
        <Badge variant={statusVariant(detail.statusGroup)}>{detail.statusGroup}</Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
            <h2 className="text-lg font-bold text-gray-900">요청 정보</h2>
            <p className="text-sm text-gray-700">담당자: {detail.requesterName}</p>
            <p className="text-sm text-gray-700">조직/팀: {detail.orgName || '-'}</p>
            <p className="text-sm text-gray-700">WhatsApp: {maskPhone(detail.whatsapp)}</p>
            <p className="text-sm text-gray-700">
              제품 종류: {detail.productTypes.length > 0 ? detail.productTypes.join(', ') : '-'}
            </p>
            <p className="text-sm text-gray-700">
              예상 수량: {detail.quantityEstimate ? formatNumber(detail.quantityEstimate) : '-'}
            </p>
            <p className="text-sm text-gray-700">
              희망 납기일: {detail.deadlineDate || '-'}
            </p>
            {detail.notes && (
              <p className="text-sm text-gray-600">요청사항: {detail.notes}</p>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">첨부 파일</h2>
            {detail.files.length === 0 ? (
              <p className="text-sm text-gray-500">첨부된 파일이 없습니다.</p>
            ) : (
              <div className="space-y-3">
                {detail.files.map((file) => (
                  <div key={file.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {file.originalName || file.path}
                        </p>
                        <p className="text-xs text-gray-500">
                          {file.mimeType || 'unknown'} · {file.sizeBytes ? `${(file.sizeBytes / (1024 * 1024)).toFixed(2)}MB` : '-'}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenFile(file.bucket, file.path, file.id)}
                        loading={fileLoadingId === file.id}
                      >
                        열기
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
        </div>
      </div>
    </div>
  );
}