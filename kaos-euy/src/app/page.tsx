import Link from 'next/link';
import { HeroSection } from '@/components/home/HeroSection';
import { ValuePropositions } from '@/components/home/ValuePropositions';
import { CTABanner } from '@/components/home/CTABanner';
import { EmptyState, ErrorState } from '@/components/common/States';
import { fetchActiveProducts } from '@/lib/supabase/server';
import { formatIDR } from '@/lib/utils';
import type { Product } from '@/types/product';

// 상품 목록은 급변하지 않으므로 60초 ISR로 서버 부하를 줄인다.
export const revalidate = 60;

function ProductCard({ product }: { product: Product }) {
  const imageUrl = product.images.find(Boolean) ?? null;
  const cardBody = (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="relative aspect-[4/3] bg-gray-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-sm text-gray-400">
            No Image
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-1">
          {product.name}
        </h3>
        <p className="mt-2 text-lg font-bold text-primary">
          {formatIDR(product.price_cents)}
        </p>
      </div>
    </div>
  );

  if (product.slug) {
    return (
      <Link href={`/products/${product.slug}`} className="block">
        {cardBody}
      </Link>
    );
  }

  return <div className="block cursor-not-allowed opacity-60">{cardBody}</div>;
}

export default async function Home() {
  let products: Product[] = [];
  let errorMessage: string | null = null;

  try {
    products = await fetchActiveProducts();
  } catch (error) {
    errorMessage =
      error instanceof Error
        ? error.message
        : '알 수 없는 오류가 발생했습니다.';
  }

  return (
    <div>
      <HeroSection />

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-3">
              Fresh Picks
            </h2>
            <p className="text-gray-600">
              Ready to wear? Pilih kaos favoritmu sekarang.
            </p>
            <p className="text-sm text-gray-500 mt-3">
              Kaos EUY로 오늘의 팀 컬러를 완성하세요.
            </p>
          </div>

          {errorMessage ? (
            <ErrorState
              title="상품 목록을 불러오지 못했습니다."
              description="환경 변수 설정과 Supabase 연결 상태를 확인하세요."
              details={errorMessage}
            />
          ) : products.length === 0 ? (
            <EmptyState
              title="데이터가 없습니다"
              description="Supabase에 상품을 추가하면 여기에 표시됩니다."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      <ValuePropositions />
      <CTABanner />
    </div>
  );
}
