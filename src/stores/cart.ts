import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product, Size, ProductColor, CartCustomization } from '@/types';

interface CartState {
  items: CartItem[];
  addItem: (input: {
    product: Product;
    size: Size;
    color: ProductColor;
    quantity: number;
    customization: CartCustomization;
    custom_fee_per_unit: number;
  }) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (input) => {
        const id =
          typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

        set((state) => {
          return {
            items: [
              ...state.items,
              {
                id,
                product: input.product,
                size: input.size,
                color: input.color,
                quantity: input.quantity,
                customization: input.customization,
                custom_fee_per_unit: input.custom_fee_per_unit,
              },
            ],
          };
        });
      },

      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter(
            (item) =>
              item.id !== itemId
          ),
        }));
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId
              ? { ...item, quantity }
              : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotal: () => {
        const { items } = get();
        return items.reduce(
          (total, item) =>
            total + (item.product.price + item.custom_fee_per_unit) * item.quantity,
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
      version: 2,
      migrate: (persisted) => {
        const state = persisted as Partial<CartState> | undefined;
        if (!state?.items?.length) return { items: [] };
        const ok = state.items.every((it) => {
          const anyIt = it as any;
          return (
            typeof anyIt.id === 'string' &&
            anyIt.product &&
            typeof anyIt.quantity === 'number' &&
            typeof anyIt.custom_fee_per_unit === 'number' &&
            anyIt.customization &&
            Array.isArray(anyIt.customization.applied_positions)
          );
        });
        return ok ? (state as any) : { items: [] };
      },
    }
  )
);
