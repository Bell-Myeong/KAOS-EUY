'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/common/Button';

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = (await res.json()) as { message?: string };
      if (!res.ok) {
        setError(data.message || '로그인에 실패했습니다.');
        return;
      }

      router.push('/admin');
    } catch (err) {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4"
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold text-secondary">Admin Login</h1>
          <p className="text-sm text-gray-500 mt-1">
            운영자 전용 페이지입니다. 비밀번호를 입력해주세요.
          </p>
        </div>

        {reason === 'expired' && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">
            세션이 만료되었거나 권한이 없습니다. 다시 로그인해주세요.
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Admin Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-primary focus:outline-none"
            placeholder="********"
            autoComplete="current-password"
          />
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <Button type="submit" variant="primary" size="md" fullWidth loading={loading}>
          로그인
        </Button>

        <p className="text-xs text-gray-400 text-center">
          ADMIN_PASSWORD 환경 변수로 보호됩니다.
        </p>
      </form>
    </div>
  );
}
