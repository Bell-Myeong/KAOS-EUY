'use client';

import { useEffect } from 'react';
import Link from 'next/link';

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
            상품 정보를 불러오는 중 문제가 발생했습니다
          </h1>
          <p className="text-gray-700 mb-4">
            Supabase 환경 변수와 네트워크 상태를 확인하세요.
          </p>
          <p className="text-xs text-gray-500 break-words mb-6">
            {error.message}
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => reset()}
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-white font-semibold hover:bg-primary/90"
            >
              다시 시도
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              홈으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
