'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/stores/cart';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/States';
import type { CheckoutForm, CreateOrderRequest, CreateOrderResponse, ApiErrorResponse } from '@/types/order';

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.getSubtotal());
  const clearCart = useCartStore((state) => state.clearCart());

  const [form, setForm] = useState<CheckoutForm>({
    buyer_name: '',
    buyer_phone: '',
    buyer_email: '',
    shipping_address: {
      address_line1: '',
      city: '',
      country: 'ID',
    },
    notes: '',
    company_website: '',
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currency = items[0]?.currency ?? 'IDR';

  const orderItems = useMemo(
    () =>
      items.map((item) => ({
        product_id: item.productId,
        quantity: item.quantity,
        unit_price_cents: item.unitPriceCents,
        options: item.selectedOptions,
      })),
    [items]
  );

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <EmptyState
            title="장바구니가 비어있습니다"
            description="먼저 상품을 담아주세요."
            action={(
              <Link
                href="/cart"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-white font-semibold hover:bg-primary/90"
              >
                장바구니로 이동
              </Link>
            )}
          />
        </div>
      </div>
    );
  }

  const handleChange = (field: keyof CheckoutForm, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddressChange = (field: keyof CheckoutForm['shipping_address'], value: string) => {
    setForm((prev) => ({
      ...prev,
      shipping_address: {
        ...prev.shipping_address,
        [field]: value,
      },
    }));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!form.buyer_name.trim()) {
      errors.buyer_name = '이름을 입력해주세요.';
    }
    if (!form.buyer_phone.trim()) {
      errors.buyer_phone = '연락처를 입력해주세요.';
    }
    if (!form.shipping_address.address_line1.trim()) {
      errors['shipping_address.address_line1'] = '주소를 입력해주세요.';
    }
    if (!form.shipping_address.city.trim()) {
      errors['shipping_address.city'] = '도시를 입력해주세요.';
    }
    if (!form.shipping_address.country.trim()) {
      errors['shipping_address.country'] = '국가를 입력해주세요.';
    }
    if (orderItems.length === 0) {
      errors.items = '주문할 상품이 없습니다.';
    }
    return errors;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError(null);
    setFieldErrors({});

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setSubmitError('필수 항목이 비어 있습니다. 표시된 항목을 확인해주세요.');
      return;
    }

    const payload: CreateOrderRequest = {
      buyer_name: form.buyer_name.trim(),
      buyer_phone: form.buyer_phone.trim(),
      buyer_email: form.buyer_email?.trim() || undefined,
      shipping_address: {
        address_line1: form.shipping_address.address_line1.trim(),
        city: form.shipping_address.city.trim(),
        country: form.shipping_address.country.trim(),
      },
      items: orderItems,
      notes: form.notes?.trim() || undefined,
      company_website: form.company_website?.trim() || undefined,
    };

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as CreateOrderResponse | ApiErrorResponse;

      if (!res.ok) {
        const errorPayload = data as ApiErrorResponse;
        setSubmitError(errorPayload.message || '주문 생성에 실패했습니다.');
        if (errorPayload.fieldErrors) {
          setFieldErrors(errorPayload.fieldErrors);
        }
        return;
      }

      const successPayload = data as CreateOrderResponse;
      clearCart();
      router.push(`/thank-you?order_number=${encodeURIComponent(successPayload.order_number)}`);
    } catch (error) {
      setSubmitError('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2">
            주문 생성 후 결제 및 진행 안내를 드립니다.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            필수 항목은 * 표시입니다. 누락 시 하단에 안내가 표시됩니다.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                <span className="font-semibold text-gray-700">빠른 이동</span>
                <a href="#buyer" className="hover:text-primary">구매자 정보</a>
                <a href="#shipping" className="hover:text-primary">배송지 정보</a>
                <a href="#notes" className="hover:text-primary">추가 요청사항</a>
              </div>

              <div className="absolute left-[-9999px] top-0" aria-hidden="true">
                <label htmlFor="company_website">Company Website</label>
                <input
                  id="company_website"
                  type="text"
                  name="company_website"
                  value={form.company_website}
                  onChange={(event) => handleChange('company_website', event.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <div id="buyer" className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 scroll-mt-24">
                <h2 className="text-xl font-bold text-gray-900">구매자 정보</h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      이름 *
                    </label>
                    <input
                      type="text"
                      value={form.buyer_name}
                      onChange={(event) => handleChange('buyer_name', event.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-primary focus:outline-none"
                      placeholder="홍길동"
                      autoComplete="name"
                    />
                    {fieldErrors.buyer_name && (
                      <p className="text-xs text-red-500 mt-1">
                        {fieldErrors.buyer_name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      연락처 *
                    </label>
                    <input
                      type="tel"
                      inputMode="tel"
                      value={form.buyer_phone}
                      onChange={(event) => handleChange('buyer_phone', event.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-primary focus:outline-none"
                      placeholder="+62 812-3456-7890"
                      autoComplete="tel"
                    />
                    {fieldErrors.buyer_phone && (
                      <p className="text-xs text-red-500 mt-1">
                        {fieldErrors.buyer_phone}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    이메일 (선택)
                  </label>
                  <input
                    type="email"
                    value={form.buyer_email}
                    onChange={(event) => handleChange('buyer_email', event.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-primary focus:outline-none"
                    placeholder="email@example.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div id="shipping" className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 scroll-mt-24">
                <h2 className="text-xl font-bold text-gray-900">배송지 정보</h2>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    주소 *
                  </label>
                  <input
                    type="text"
                    value={form.shipping_address.address_line1}
                    onChange={(event) => handleAddressChange('address_line1', event.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-primary focus:outline-none"
                    placeholder="Jl. Asia Afrika 1"
                    autoComplete="address-line1"
                  />
                  {fieldErrors['shipping_address.address_line1'] && (
                    <p className="text-xs text-red-500 mt-1">
                      {fieldErrors['shipping_address.address_line1']}
                    </p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      도시 *
                    </label>
                    <input
                      type="text"
                      value={form.shipping_address.city}
                      onChange={(event) => handleAddressChange('city', event.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-primary focus:outline-none"
                      placeholder="Bandung"
                      autoComplete="address-level2"
                    />
                    {fieldErrors['shipping_address.city'] && (
                      <p className="text-xs text-red-500 mt-1">
                        {fieldErrors['shipping_address.city']}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      국가 *
                    </label>
                    <input
                      type="text"
                      value={form.shipping_address.country}
                      onChange={(event) => handleAddressChange('country', event.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-primary focus:outline-none"
                      placeholder="ID"
                      autoComplete="country"
                    />
                    {fieldErrors['shipping_address.country'] && (
                      <p className="text-xs text-red-500 mt-1">
                        {fieldErrors['shipping_address.country']}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div id="notes" className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 scroll-mt-24">
                <h2 className="text-xl font-bold text-gray-900">추가 요청사항</h2>
                <textarea
                  value={form.notes}
                  onChange={(event) => handleChange('notes', event.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 min-h-[120px] focus:border-primary focus:outline-none"
                  placeholder="배송/연락 관련 요청사항이 있다면 적어주세요."
                />
              </div>

              {submitError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {submitError}
                </div>
              )}

              {fieldErrors.items && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {fieldErrors.items}
                </div>
              )}

              <Button type="submit" variant="primary" size="lg" fullWidth loading={isSubmitting}>
                주문 생성하기
              </Button>
            </form>
          </div>

          <div>
            <div className="sticky top-6 bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="text-xl font-bold text-gray-900">주문 요약</h2>

              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.key} className="text-sm text-gray-700">
                    <div className="flex justify-between">
                      <span className="font-semibold">{item.name}</span>
                      <span>{formatCurrency(item.unitPriceCents, item.currency)}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      수량: {item.quantity}
                      {Object.keys(item.selectedOptions).length > 0 &&
                        ` · ${Object.entries(item.selectedOptions)
                          .map(([key, value]) => `${key}: ${value}`)
                          .join(' / ')}`}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal, currency)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>0 (추후 안내)</span>
                </div>
                <div className="flex justify-between text-gray-900 font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(subtotal, currency)}</span>
                </div>
              </div>

              <Link href="/cart" className="text-sm text-primary font-semibold hover:underline">
                장바구니로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
