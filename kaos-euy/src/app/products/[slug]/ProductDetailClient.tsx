'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Product } from '@/types/product';
import type { SelectedOptions } from '@/types/cart';
import { useCartStore } from '@/stores/cart';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/common/Button';

interface ProductDetailClientProps {
  product: Product;
  sizes: string[];
  colors: string[];
}

function isHexColor(value: string) {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim());
}

export default function ProductDetailClient({
  product,
  sizes,
  colors,
}: ProductDetailClientProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState<{
    type: 'error' | 'success';
    message: string;
  } | null>(null);

  const addItem = useCartStore((state) => state.addItem);

  const imageUrl = product.images.find(Boolean) ?? null;
  const currencyLabel = product.currency || 'IDR';

  const optionSummary = useMemo(() => {
    const summary: SelectedOptions = {};
    if (selectedSize) summary.size = selectedSize;
    if (selectedColor) summary.color = selectedColor;
    return summary;
  }, [selectedSize, selectedColor]);

  const handleAddToCart = () => {
    if (sizes.length > 0 && !selectedSize) {
      setFeedback({ type: 'error', message: '사이즈를 선택해주세요.' });
      return;
    }
    if (colors.length > 0 && !selectedColor) {
      setFeedback({ type: 'error', message: '색상을 선택해주세요.' });
      return;
    }

    addItem({
      productId: product.id,
      slug: product.slug ?? null,
      name: product.name,
      unitPriceCents: product.price_cents,
      currency: product.currency,
      quantity,
      selectedOptions: optionSummary,
      imageUrl,
    });

    setFeedback({ type: 'success', message: '카트에 담겼습니다.' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-10">
        <div className="text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-primary">
            Home
          </Link>
          {' / '}
          <Link href="/products" className="hover:text-primary">
            Products
          </Link>
          {' / '}
          <span className="text-gray-900">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="relative aspect-square bg-gray-100">
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
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                {product.name}
              </h1>
              <p className="text-gray-600">
                {product.description || '설명이 없습니다.'}
              </p>
            </div>

            <div className="border-y border-gray-200 py-4">
              <div className="text-3xl font-bold text-primary">
                {formatCurrency(product.price_cents, currencyLabel)}
              </div>
            </div>

            {sizes.length > 0 && (
              <div>
                <p className="font-semibold text-gray-900 mb-2">사이즈</p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        setSelectedSize(size);
                        setFeedback(null);
                      }}
                      className={`px-3 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                        selectedSize === size
                          ? 'border-primary bg-primary text-white'
                          : 'border-gray-200 text-gray-700 hover:border-primary/60'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {colors.length > 0 && (
              <div>
                <p className="font-semibold text-gray-900 mb-2">색상</p>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => {
                    const isSelected = selectedColor === color;
                    const showSwatch = isHexColor(color);
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => {
                          setSelectedColor(color);
                          setFeedback(null);
                        }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                          isSelected
                            ? 'border-primary bg-primary text-white'
                            : 'border-gray-200 text-gray-700 hover:border-primary/60'
                        }`}
                      >
                        {showSwatch && (
                          <span
                            className="inline-flex h-4 w-4 rounded-full border border-white/70"
                            style={{ backgroundColor: color }}
                          />
                        )}
                        <span>{color}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <p className="font-semibold text-gray-900 mb-2">수량</p>
              <div className="inline-flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2">
                <button
                  type="button"
                  className="px-2 text-lg text-gray-600 disabled:text-gray-300"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(event) => {
                    const next = Math.max(1, Number(event.target.value) || 1);
                    setQuantity(next);
                  }}
                  className="w-16 text-center outline-none"
                />
                <button
                  type="button"
                  className="px-2 text-lg text-gray-600"
                  onClick={() => setQuantity((prev) => prev + 1)}
                >
                  +
                </button>
              </div>
            </div>

            {feedback && (
              <div
                className={`rounded-lg border px-4 py-3 text-sm ${
                  feedback.type === 'success'
                    ? 'border-green-200 bg-green-50 text-green-700'
                    : 'border-red-200 bg-red-50 text-red-700'
                }`}
              >
                {feedback.message}
              </div>
            )}

            <div className="space-y-3">
              <Button variant="primary" size="lg" fullWidth onClick={handleAddToCart}>
                Add to Cart
              </Button>

              <Link
                href="/cart"
                className="inline-flex w-full items-center justify-center rounded-lg border border-primary px-6 py-3 text-primary font-bold hover:bg-primary hover:text-white transition-colors"
              >
                카트로 이동
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
