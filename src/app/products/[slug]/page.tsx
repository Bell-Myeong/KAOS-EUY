'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { ProductColor, Size } from '@/types';
import { useProducts } from '@/lib/hooks/useProducts';
import { Button } from '@/components/common/Button';
import { ColorSelector } from '@/components/products/ColorSelector';
import { SizeSelector } from '@/components/products/SizeSelector';
import { QuantitySelector } from '@/components/products/QuantitySelector';
import { formatIDR } from '@/lib/utils';
import { useCartStore } from '@/stores/cart';
import { PositionSelector } from '@/components/custom/PositionSelector';
import { CustomVisualizer } from '@/components/custom/CustomVisualizer';
import { DesignUploader } from '@/components/custom/DesignUploader';
import { useCustomDesignStore } from '@/stores/customDesign';

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

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
  const [isAdding, setIsAdding] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showCustomizer, setShowCustomizer] = useState(false);

  const resetAllDesign = useCustomDesignStore((s) => s.resetAll);
  const getAppliedParts = useCustomDesignStore((s) => s.getAppliedParts);
  const getCustomPrice = useCustomDesignStore((s) => s.getCustomPrice);

  useEffect(() => {
    if (!size && defaultSize) setSize(defaultSize);
  }, [defaultSize, size]);

  useEffect(() => {
    if (!color && defaultColor) setColor(defaultColor);
  }, [defaultColor, color]);

  useEffect(() => {
    resetAllDesign();
    setShowCustomizer(false);
  }, [resetAllDesign, product?.id]);

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

  const appliedParts = getAppliedParts();
  const customFeePerUnit = getCustomPrice();
  const unitTotal = product.price + customFeePerUnit;
  const lineTotal = unitTotal * quantity;

  const canAdd = Boolean(product.in_stock && size && color && quantity > 0);
  const images = product.images ?? [];
  const mainImage = images[currentImageIndex] ?? images[0];

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
                src={mainImage ?? 'https://placehold.co/800x800/png'}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>

            {images.length > 1 ? (
              <div className="p-4 border-t border-gray-200">
                <p className="text-xs font-semibold text-gray-700 mb-2">Examples</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentImageIndex(0)}
                    className={`px-3 h-16 rounded-lg border text-sm font-medium transition-colors ${
                      currentImageIndex === 0
                        ? 'border-primary ring-2 ring-primary/20 text-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                    }`}
                    aria-label="View main image"
                  >
                    Main
                  </button>
                  {images.slice(1).map((src, idx) => {
                    const realIndex = idx + 1;
                    const active = currentImageIndex === realIndex;
                    return (
                      <button
                        key={`${product.slug}-thumb-${realIndex}`}
                        type="button"
                        onClick={() => setCurrentImageIndex(realIndex)}
                        className={`relative w-16 h-16 rounded-lg overflow-hidden border transition-colors ${
                          active
                            ? 'border-primary ring-2 ring-primary/20'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        aria-label={`View image ${realIndex + 1}`}
                      >
                        <Image
                          src={src}
                          alt={`${product.name} example ${realIndex + 1}`}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
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

            <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900">Customization</p>
                  <p className="text-sm text-gray-600">
                    +{formatIDR(25000)}/position ({appliedParts.length} selected)
                  </p>
                </div>
                <Button
                  type="button"
                  variant={showCustomizer ? 'outline' : 'primary'}
                  size="sm"
                  onClick={() => setShowCustomizer((v) => !v)}
                >
                  {showCustomizer ? 'Hide' : 'Customize'}
                </Button>
              </div>

              {showCustomizer && (
                <div className="space-y-6">
                  <CustomVisualizer
                    baseColor="#ffffff"
                    productImage="/products/blank-tee-white.svg"
                  />
                  <PositionSelector />
                  <DesignUploader />
                </div>
              )}
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex items-center justify-between text-sm text-gray-700">
                <span>Unit</span>
                <span className="font-semibold">{formatIDR(unitTotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-700 mt-1">
                <span>Customization</span>
                <span className="font-semibold">{formatIDR(customFeePerUnit)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-700 mt-1">
                <span>Quantity</span>
                <span className="font-semibold">× {quantity}</span>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-base font-semibold text-gray-900">Total</span>
                <span className="text-xl font-bold text-primary">{formatIDR(lineTotal)}</span>
              </div>
            </div>

            <Button
              fullWidth
              disabled={!canAdd || isAdding}
              loading={isAdding}
              onClick={async () => {
                if (!size || !color) return;
                setIsAdding(true);
                try {
                   const design = useCustomDesignStore.getState();
                   const parts = {
                     front: design.front,
                     back: design.back,
                     leftArm: design.leftArm,
                     rightArm: design.rightArm,
                   };

                  addItem({
                    product,
                    size,
                    color,
                    quantity,
                    customization: {
                      parts,
                      applied_positions: design.getAppliedParts(),
                    },
                    custom_fee_per_unit: design.getCustomPrice(),
                  });
                  resetAllDesign();
                  router.push('/cart');
                } finally {
                  setIsAdding(false);
                }
              }}
            >
              Custom & add to cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
