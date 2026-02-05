import Link from 'next/link';

interface ThankYouPageProps {
  searchParams?: {
    order_number?: string;
  };
}

export default function ThankYouPage({ searchParams }: ThankYouPageProps) {
  const orderNumber = searchParams?.order_number;

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            주문이 접수되었습니다
          </h1>
          <p className="text-gray-600 mb-6">
            주문 확인 후 WhatsApp 또는 이메일로 결제 및 배송 안내를 드립니다.
          </p>

          <div className="bg-gray-50 rounded-lg py-4 px-6 inline-block mb-6">
            <p className="text-sm text-gray-500 mb-1">주문번호</p>
            <p className="text-xl font-semibold text-gray-900">
              {orderNumber ?? '주문번호 없음'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-white font-semibold hover:bg-primary/90"
            >
              홈으로 돌아가기
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-6 py-3 text-gray-700 hover:bg-gray-50"
            >
              더 둘러보기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
