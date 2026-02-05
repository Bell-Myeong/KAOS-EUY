'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import type { CartItem as CartItemType } from '@/types';
import { QuantitySelector } from '@/components/products/QuantitySelector';
import { formatIDR } from '@/lib/utils';
import { Checkbox } from '@/components/common/Checkbox';

export interface CartItemProps {
  item: CartItemType;
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
}

export function CartItem({
  item,
  selected,
  onSelect,
  onUpdateQuantity,
  onRemove,
}: CartItemProps) {
  const itemTotal = item.product.price * item.quantity;

  return (
    <div className="flex gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      {/* Checkbox */}
      {onSelect && (
        <div className="flex items-start pt-1">
          <Checkbox checked={selected} onChange={(e) => onSelect(e.target.checked)} />
        </div>
      )}

      {/* Image */}
      <Link href={`/products/${item.product.slug}`} className="flex-shrink-0">
        <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
          <Image
            src={item.product.images[0]}
            alt={item.product.name}
            fill
            className="object-cover"
          />
        </div>
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/products/${item.product.slug}`}
          className="hover:text-primary"
        >
          <h3 className="font-semibold text-gray-900 mb-1">
            {item.product.name}
          </h3>
        </Link>

        <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-2">
            <span>Color:</span>
            <div
              className="w-5 h-5 rounded-full border border-gray-300"
              style={{ backgroundColor: item.color.code }}
              title={item.color.name}
            />
            <span>{item.color.name}</span>
          </div>
          <div>
            <span>Size: </span>
            <span className="font-medium">{item.size}</span>
          </div>
        </div>

        {/* Mobile: Price */}
        <div className="md:hidden mb-3">
          <p className="text-sm text-gray-600">
            Unit Price: {formatIDR(item.product.price)}
          </p>
          <p className="text-lg font-bold text-primary">
            {formatIDR(itemTotal)}
          </p>
        </div>

        {/* Quantity Selector */}
        <QuantitySelector
          value={item.quantity}
          onChange={onUpdateQuantity}
          className="mb-2"
        />
      </div>

      {/* Desktop: Price */}
      <div className="hidden md:flex flex-col items-end justify-between">
        <div className="text-right">
          <p className="text-sm text-gray-600 mb-1">
            {formatIDR(item.product.price)} x {item.quantity}
          </p>
          <p className="text-xl font-bold text-primary">
            {formatIDR(itemTotal)}
          </p>
        </div>

        {/* Delete Button */}
        <button
          onClick={onRemove}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          aria-label="Remove item"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile: Delete Button */}
      <div className="md:hidden flex items-start">
        <button
          onClick={onRemove}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          aria-label="Remove item"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
