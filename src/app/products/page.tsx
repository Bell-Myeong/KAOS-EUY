'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { ProductCategory } from '@/types';
import { ProductGrid } from '@/components/products/ProductGrid';
import { fadeInUp } from '@/lib/animations';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProducts } from '@/lib/hooks/useProducts';
import { isForbiddenError } from '@/lib/api/errors';

export default function ProductsPage() {
  const { t } = useLanguage();
  const [category, setCategory] = useState<ProductCategory | 'all'>('all');
  const [inStockOnly, setInStockOnly] = useState(false);

  const { data, isLoading, error } = useProducts({
    category: category === 'all' ? undefined : category,
    inStock: inStockOnly ? true : undefined,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-4">
            {t('products.title')}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('products.subtitle')}
          </p>
        </motion.div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-8 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-gray-700">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ProductCategory | 'all')}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="all">All</option>
              <option value="tshirt">T-shirt</option>
              <option value="hoodie">Hoodie</option>
              <option value="totebag">Tote bag</option>
              <option value="other">Other</option>
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="w-4 h-4 text-primary rounded focus:ring-primary"
            />
            In stock only
          </label>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-10 bg-gray-200 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {isForbiddenError(error) ? '403 Forbidden' : 'Failed to load products'}
            </h2>
            <p className="text-gray-600 text-sm">{String(error)}</p>
          </div>
        ) : (
          <ProductGrid products={data ?? []} />
        )}
      </div>
    </div>
  );
}
