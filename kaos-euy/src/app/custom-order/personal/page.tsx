'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '@/components/common/Button';
import { useCustomOrderStore } from '@/stores/customOrder';
import { useLanguage } from '@/contexts/LanguageContext';

export default function PersonalOrderPage() {
  const router = useRouter();
  const { updateOrder, setOrderType } = useCustomOrderStore();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic schema based on current language
  const personalOrderSchema = z.object({
    name: z.string().min(2, t('personalOrder.errors.nameMin')),
    email: z.string().email(t('personalOrder.errors.emailInvalid')),
    phone: z.string().min(10, t('personalOrder.errors.phoneMin')),
    size: z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']),
    quantity: z.number().min(1).max(10),
    color: z.string().min(1, t('personalOrder.errors.colorRequired')),
    designDescription: z.string().min(10, t('personalOrder.errors.designMin')),
  });

  type PersonalOrderForm = z.infer<typeof personalOrderSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PersonalOrderForm>({
    resolver: zodResolver(personalOrderSchema),
  });

  const onSubmit = async (data: PersonalOrderForm) => {
    setIsSubmitting(true);

    // Set order type
    setOrderType('personal');

    // Update order data
    updateOrder({
      customer_info: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        preferred_contact: 'whatsapp',
      },
      size_quantity: {
        personal: {
          size: data.size,
          quantity: data.quantity,
        },
      },
      product_base: {
        category: 'tshirt',
        color: {
          code: data.color,
          name: data.color,
        },
        material: {
          grade: 'premium',
          gsm: 200,
        },
      },
      design: {
        source: 'request',
        request: {
          description: data.designDescription,
          style_preference: 'modern',
        },
        print_position: {
          front: {
            enabled: true,
          },
        },
        print_method: 'dtf',
      },
    });

    // Simulate submission
    setTimeout(() => {
      alert(t('personalOrder.successMessage'));
      router.push('/');
    }, 1000);
  };

  return (
    <div className="py-12 md:py-20 bg-background/30">
      <div className="container px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-secondary mb-3">
              {t('personalOrder.title')}
            </h1>
            <p className="font-body text-gray-600">
              {t('personalOrder.subtitle')}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-lg p-8 space-y-6">
            {/* Customer Info */}
            <div>
              <h2 className="font-display text-xl font-bold text-secondary mb-4">
                {t('personalOrder.contactInfo')}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block font-body font-semibold text-gray-700 mb-2">
                    {t('personalOrder.fields.fullName')} {t('personalOrder.required')}
                  </label>
                  <input
                    type="text"
                    {...register('name')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder={t('personalOrder.fields.fullNamePlaceholder')}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block font-body font-semibold text-gray-700 mb-2">
                    {t('personalOrder.fields.email')} {t('personalOrder.required')}
                  </label>
                  <input
                    type="email"
                    {...register('email')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder={t('personalOrder.fields.emailPlaceholder')}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block font-body font-semibold text-gray-700 mb-2">
                    {t('personalOrder.fields.whatsapp')} {t('personalOrder.required')}
                  </label>
                  <input
                    type="tel"
                    {...register('phone')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder={t('personalOrder.fields.whatsappPlaceholder')}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div>
              <h2 className="font-display text-xl font-bold text-secondary mb-4">
                {t('personalOrder.productDetails')}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block font-body font-semibold text-gray-700 mb-2">
                    {t('personalOrder.fields.size')} {t('personalOrder.required')}
                  </label>
                  <select
                    {...register('size')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">{t('personalOrder.fields.sizePlaceholder')}</option>
                    <option value="XS">XS</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                    <option value="3XL">3XL</option>
                  </select>
                  {errors.size && (
                    <p className="text-red-500 text-sm mt-1">{errors.size.message}</p>
                  )}
                </div>

                <div>
                  <label className="block font-body font-semibold text-gray-700 mb-2">
                    {t('personalOrder.fields.quantity')} {t('personalOrder.required')}
                  </label>
                  <input
                    type="number"
                    {...register('quantity', { valueAsNumber: true })}
                    min="1"
                    max="10"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder={t('personalOrder.fields.quantityPlaceholder')}
                  />
                  {errors.quantity && (
                    <p className="text-red-500 text-sm mt-1">{errors.quantity.message}</p>
                  )}
                </div>

                <div>
                  <label className="block font-body font-semibold text-gray-700 mb-2">
                    {t('personalOrder.fields.color')} {t('personalOrder.required')}
                  </label>
                  <select
                    {...register('color')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">{t('personalOrder.fields.colorPlaceholder')}</option>
                    <option value="#FFFFFF">{t('personalOrder.fields.colors.white')}</option>
                    <option value="#000000">{t('personalOrder.fields.colors.black')}</option>
                    <option value="#1E3A8A">{t('personalOrder.fields.colors.navy')}</option>
                    <option value="#6B7280">{t('personalOrder.fields.colors.gray')}</option>
                    <option value="#DC2626">{t('personalOrder.fields.colors.red')}</option>
                    <option value="#EAB308">{t('personalOrder.fields.colors.yellow')}</option>
                  </select>
                  {errors.color && (
                    <p className="text-red-500 text-sm mt-1">{errors.color.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Design */}
            <div>
              <h2 className="font-display text-xl font-bold text-secondary mb-4">
                {t('personalOrder.design')}
              </h2>

              <div>
                <label className="block font-body font-semibold text-gray-700 mb-2">
                  {t('personalOrder.fields.designDescription')} {t('personalOrder.required')}
                </label>
                <textarea
                  {...register('designDescription')}
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder={t('personalOrder.fields.designDescriptionPlaceholder')}
                />
                {errors.designDescription && (
                  <p className="text-red-500 text-sm mt-1">{errors.designDescription.message}</p>
                )}
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={isSubmitting}
              >
                {isSubmitting ? t('personalOrder.submitting') : t('personalOrder.submitButton')}
              </Button>
              <p className="text-sm text-gray-500 text-center mt-3">
                {t('personalOrder.footerNote')}
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
