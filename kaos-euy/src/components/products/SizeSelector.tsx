'use client';

import { clsx } from 'clsx';
import type { Size } from '@/types';

export interface SizeSelectorProps {
  sizes: Size[];
  selected?: Size;
  onChange: (size: Size) => void;
  disabledSizes?: Size[];
}

export function SizeSelector({
  sizes,
  selected,
  onChange,
  disabledSizes = [],
}: SizeSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-gray-700">
          Select Size
        </label>
        <button className="text-sm text-primary hover:underline">
          Size Guide
        </button>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
        {sizes.map((size) => {
          const isSelected = selected === size;
          const isDisabled = disabledSizes.includes(size);

          return (
            <button
              key={size}
              onClick={() => !isDisabled && onChange(size)}
              disabled={isDisabled}
              className={clsx(
                'py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200',
                'border-2',
                isSelected &&
                  !isDisabled &&
                  'bg-primary text-white border-primary',
                !isSelected &&
                  !isDisabled &&
                  'bg-white text-gray-700 border-gray-300 hover:border-primary',
                isDisabled &&
                  'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through'
              )}
            >
              {size}
            </button>
          );
        })}
      </div>
    </div>
  );
}
