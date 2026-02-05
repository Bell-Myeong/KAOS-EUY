import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AddToCartInput, CartItem, SelectedOptions } from '@/types/cart';

function normalizeOptions(options: SelectedOptions | undefined): SelectedOptions {
  if (!options) return {};
  const normalized: SelectedOptions = {};
  Object.keys(options)
    .sort()
    .forEach((key) => {
      const value = options[key];
      if (typeof value === 'string' && value.trim() !== '') {
        normalized[key] = value;
      }
    });
  return normalized;
}

function buildItemKey(productId: string, options: SelectedOptions): string {
  return `${productId}::${JSON.stringify(options)}`;
}

interface CartState {
  items: CartItem[];
  addItem: (input: AddToCartInput) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (input) => {
        const normalizedOptions = normalizeOptions(input.selectedOptions);
        const key = buildItemKey(input.productId, normalizedOptions);
        const quantity = Math.max(1, input.quantity ?? 1);

        set((state) => {
          const existing = state.items.find((item) => item.key === key);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.key === key
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }

          const nextItem: CartItem = {
            key,
            productId: input.productId,
            slug: input.slug ?? null,
            name: input.name,
            unitPriceCents: input.unitPriceCents,
            currency: input.currency ?? 'IDR',
            quantity,
            selectedOptions: normalizedOptions,
            imageUrl: input.imageUrl ?? null,
          };

          return { items: [...state.items, nextItem] };
        });
      },

      removeItem: (key) => {
        set((state) => ({
          items: state.items.filter((item) => item.key !== key),
        }));
      },

      updateQuantity: (key, quantity) => {
        if (quantity <= 0) {
          get().removeItem(key);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.key === key ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getSubtotal: () => {
        const { items } = get();
        return items.reduce(
          (total, item) => total + item.unitPriceCents * item.quantity,
          0
        );
      },

      getItemCount: () => {
        const { items } = get();
        return items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'kaos-euy-cart',
    }
  )
);
