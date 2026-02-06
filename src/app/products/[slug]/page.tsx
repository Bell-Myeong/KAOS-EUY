'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { ProductColor, Size } from '@/types';
import { useProducts } from '@/lib/hooks/useProducts';
import { useAuth } from '@/contexts/AuthContext';
import { useAddToCart } from '@/lib/hooks/useCart';
import { Button } from '@/components/common/Button';
import { ColorSelector } from '@/components/products/ColorSelector';
import { SizeSelector } from '@/components/products/SizeSelector';
import { QuantitySelector } from '@/components/products/QuantitySelector';
import { formatIDR } from '@/lib/utils';

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  const { data, isLoading, error } = useProducts({ slug });
  const product = data?.[0];

  const defaultSize = useMemo<Size | undefined>(() => {
    return (product?.sizes?.[0] as Size | undefined) ?? undefined;
  }, [product?.sizes]);

  const defaultColor = useMemo<ProductColor | undefined>(() => {
    return product?.colors?.[0] ?? undefined;
  }, [product?.colors]);

  const [size, setSize] = useState<Size | undefined>(defaultSize);
  const [color, setColor] = useState<ProductColor | undefined>(defaultColor);
  const [quantity, setQuantity] = useState(1);

  const addToCart = useAddToCart();

  useEffect(() => {
    if (!size && defaultSize) setSize(defaultSize);
  }, [defaultSize, size]);

  useEffect(() => {
    if (!color && defaultColor) setColor(defaultColor);
  }, [defaultColor, color]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-6" />
          <div className="grid lg:grid-cols-2 gap-10">
            <div className="aspect-square bg-gray-200 rounded-2xl" />
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 rounded w-3/4" />
              <div className="h-6 bg-gray-200 rounded w-40" />
              <div className="h-20 bg-gray-200 rounded w-full" />
              <div className="h-12 bg-gray-200 rounded w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="font-semibold text-gray-900 mb-2">Failed to load product</p>
            <p className="text-sm text-gray-600">{String(error)}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="font-semibold text-gray-900 mb-2">Product not found</p>
            <Link href="/products" className="text-primary hover:underline text-sm">
              Back to products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const canAdd = Boolean(product.in_stock && size && color && quantity > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <Link href="/products" className="text-sm text-gray-600 hover:text-primary">
          ← Back to products
        </Link>

        <div className="grid lg:grid-cols-2 gap-10 mt-6">
          <div className="bg-white rounded-2xl overflow-hidden border border-gray-200">
            <div className="relative aspect-square bg-gray-100">
              <Image
                src={product.images?.[0] ?? 'https://placehold.co/800x800/png'}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              <p className="text-xl font-bold text-primary mt-2">
                {formatIDR(product.price)}
              </p>
              {product.description && (
                <p className="text-gray-600 mt-4">{product.description}</p>
              )}
            </div>

            {product.colors?.length ? (
              <ColorSelector
                colors={product.colors}
                selected={color}
                onChange={(c) => setColor(c)}
              />
            ) : null}

            {product.sizes?.length ? (
              <SizeSelector
                sizes={product.sizes as Size[]}
                selected={size}
                onChange={(s) => setSize(s)}
              />
            ) : null}

            <QuantitySelector value={quantity} onChange={setQuantity} />

            {!user ? (
              <Button
                fullWidth
                onClick={() => {
                  router.push(
                    `/auth/sign-in?next=${encodeURIComponent(pathname || '/products')}`
                  );
                }}
              >
                Sign in to add to cart
              </Button>
            ) : (
              <Button
                fullWidth
                disabled={!canAdd || addToCart.isPending}
                loading={addToCart.isPending}
                onClick={async () => {
                  if (!size || !color) return;
                  await addToCart.mutateAsync({
                    productId: product.id,
                    size,
                    color,
                    quantity,
                  });
                  router.push('/cart');
                }}
              >
                Add to cart
              </Button>
            )}

            {addToCart.error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {String(addToCart.error)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
