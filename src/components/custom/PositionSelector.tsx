'use client';

import { Check } from 'lucide-react';
import { useCustomDesignStore, CustomPosition } from '@/stores/customDesign';
import { formatIDR } from '@/lib/utils';

const PRICE_PER_PART = 25000;

const positionInfo: Record<CustomPosition, { label: string; labelId: string }> = {
  front: { label: 'Front', labelId: 'Depan' },
  back: { label: 'Back', labelId: 'Belakang' },
  leftArm: { label: 'Left Sleeve', labelId: 'Lengan Kiri' },
  rightArm: { label: 'Right Sleeve', labelId: 'Lengan Kanan' },
};

export function PositionSelector() {
  const {
    front,
    back,
    leftArm,
    rightArm,
    togglePart,
    setActivePosition,
    getCustomPrice,
  } = useCustomDesignStore();

  const positions: { key: CustomPosition; part: typeof front }[] = [
    { key: 'front', part: front },
    { key: 'back', part: back },
    { key: 'leftArm', part: leftArm },
    { key: 'rightArm', part: rightArm },
  ];

  const handleToggle = (pos: CustomPosition) => {
    togglePart(pos);
    setActivePosition(pos);
  };

  const totalCustomPrice = getCustomPrice();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Select Custom Positions</h3>
        <span className="text-sm text-gray-500">+{formatIDR(PRICE_PER_PART)}/position</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {positions.map(({ key, part }) => (
          <button
            key={key}
            onClick={() => handleToggle(key)}
            className={`relative p-4 rounded-xl border-2 transition-all ${
              part.applied
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <p className="font-medium text-gray-900">{positionInfo[key].label}</p>
                <p className="text-xs text-gray-500">{positionInfo[key].labelId}</p>
              </div>
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  part.applied
                    ? 'bg-primary border-primary text-white'
                    : 'border-gray-300'
                }`}
              >
                {part.applied && <Check className="w-4 h-4" />}
              </div>
            </div>

            {part.image_url && (
              <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                <Check className="w-3 h-3" />
                Design uploaded
              </div>
            )}
          </button>
        ))}
      </div>

      {totalCustomPrice > 0 && (
        <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
          <span className="text-sm font-medium text-gray-700">Custom Total:</span>
          <span className="font-bold text-primary">{formatIDR(totalCustomPrice)}</span>
        </div>
      )}
    </div>
  );
}
