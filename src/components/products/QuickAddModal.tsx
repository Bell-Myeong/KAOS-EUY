'use client';

import { useMemo, useState } from 'react';
import type { Product, ProductColor, Size } from '@/types';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { ColorSelector } from '@/components/products/ColorSelector';
import { SizeSelector } from '@/components/products/SizeSelector';
import { QuantitySelector } from '@/components/products/QuantitySelector';
import { useAddToCart } from '@/lib/hooks/useCart';

export function QuickAddModal({
  product,
  isOpen,
  onClose,
}: {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}) {
  const defaultSize = useMemo<Size | undefined>(() => {
    return (product.sizes?.[0] as Size | undefined) ?? undefined;
  }, [product.sizes]);

  const defaultColor = useMemo<ProductColor | undefined>(() => {
    return product.colors?.[0] ?? undefined;
  }, [product.colors]);

  const [size, setSize] = useState<Size | undefined>(defaultSize);
  const [color, setColor] = useState<ProductColor | undefined>(defaultColor);
  const [quantity, setQuantity] = useState(1);

  const addToCart = useAddToCart();

  const canSubmit = Boolean(product.in_stock && size && color && quantity > 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!addToCart.isPending) onClose();
      }}
      title="Quick add"
      size="md"
    >
      <div className="space-y-5">
        <div>
          <p className="font-semibold text-gray-900">{product.name}</p>
          <p className="text-sm text-gray-600">Choose variant and quantity.</p>
        </div>

        {product.colors?.length ? (
          <ColorSelector
            colors={product.colors}
            selected={color}
            onChange={(c) => setColor(c)}
          />
        ) : (
          <p className="text-sm text-gray-600">No colors configured.</p>
        )}

        {product.sizes?.length ? (
          <SizeSelector
            sizes={product.sizes as Size[]}
            selected={size}
            onChange={(s) => setSize(s)}
          />
        ) : (
          <p className="text-sm text-gray-600">No sizes configured.</p>
        )}

        <QuantitySelector value={quantity} onChange={setQuantity} />

        {addToCart.error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {String(addToCart.error)}
          </div>
        )}

        <div className="flex gap-3">
          <Button
            type="button"
            variant="ghost"
            className="flex-1"
            onClick={onClose}
            disabled={addToCart.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="flex-1"
            disabled={!canSubmit || addToCart.isPending}
            loading={addToCart.isPending}
            onClick={async () => {
              if (!size || !color) return;
              await addToCart.mutateAsync({
                productId: product.id,
                size,
                color,
                quantity,
              });
              onClose();
            }}
          >
            Add to cart
          </Button>
        </div>
      </div>
    </Modal>
  );
}

