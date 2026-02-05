'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="bg-white border border-red-200 rounded-xl p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-3">
            페이지 로딩 중 문제가 발생했습니다
          </h1>
          <p className="text-gray-700 mb-4">
            Supabase 환경 변수와 네트워크 상태를 확인하세요.
          </p>
          <p className="text-xs text-gray-500 break-words mb-6">
            {error.message}
          </p>
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-white font-semibold hover:bg-primary/90"
          >
            다시 시도
          </button>
        </div>
      </div>
    </div>
  );
}
