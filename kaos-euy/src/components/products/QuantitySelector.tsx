'use client';

import { Minus, Plus } from 'lucide-react';
import { clsx } from 'clsx';

export interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  className,
}: QuantitySelectorProps) {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  return (
    <div className={clsx('flex items-center gap-3', className)}>
      <label className="text-sm font-semibold text-gray-700">Quantity</label>
      <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden">
        <button
          onClick={handleDecrement}
          disabled={value <= min}
          className="p-2.5 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Decrease quantity"
        >
          <Minus className="w-4 h-4 text-gray-600" />
        </button>

        <input
          type="number"
          value={value}
          onChange={handleInputChange}
          min={min}
          max={max}
          className="w-16 text-center font-semibold text-gray-900 focus:outline-none"
        />

        <button
          onClick={handleIncrement}
          disabled={value >= max}
          className="p-2.5 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Increase quantity"
        >
          <Plus className="w-4 h-4 text-gray-600" />
        </button>
      </div>
    </div>
  );
}
