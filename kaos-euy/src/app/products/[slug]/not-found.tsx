import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            상품을 찾을 수 없습니다
          </h1>
          <p className="text-gray-600 mb-6">
            요청하신 상품이 존재하지 않거나 비활성화되었습니다.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-white font-semibold hover:bg-primary/90"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
