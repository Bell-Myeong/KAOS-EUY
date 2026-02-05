'use client';

import { clsx } from 'clsx';
import { Check } from 'lucide-react';
import type { ProductColor } from '@/types';

export interface ColorSelectorProps {
  colors: ProductColor[];
  selected?: ProductColor;
  onChange: (color: ProductColor) => void;
}

export function ColorSelector({
  colors,
  selected,
  onChange,
}: ColorSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-700">
        Select Color
      </label>
      <div className="flex flex-wrap gap-3">
        {colors.map((color) => {
          const isSelected = selected?.code === color.code;

          return (
            <button
              key={color.code}
              onClick={() => onChange(color)}
              className="group relative"
              title={color.name}
            >
              <div
                className={clsx(
                  'w-10 h-10 rounded-full border-2 transition-all duration-200',
                  'flex items-center justify-center',
                  isSelected
                    ? 'border-primary scale-110'
                    : 'border-gray-300 group-hover:border-primary/60'
                )}
                style={{ backgroundColor: color.code }}
              >
                {isSelected && (
                  <Check
                    className={clsx(
                      'w-5 h-5',
                      color.code === '#FFFFFF' ||
                        color.code.toLowerCase() === '#ffeaa7'
                        ? 'text-gray-800'
                        : 'text-white'
                    )}
                    strokeWidth={3}
                  />
                )}
              </div>

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {color.name}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
