import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CustomOrder, OrderType } from '@/types';

interface CustomOrderState {
  currentOrder: Partial<CustomOrder> | null;
  savedDesigns: Partial<CustomOrder>[];
  setOrderType: (type: OrderType) => void;
  updateOrder: (updates: Partial<CustomOrder>) => void;
  saveDesign: (design: Partial<CustomOrder>) => void;
  loadDesign: (index: number) => void;
  clearOrder: () => void;
  getCurrentStep: () => number;
}

export const useCustomOrderStore = create<CustomOrderState>()(
  persist(
    (set, get) => ({
      currentOrder: null,
      savedDesigns: [],

      setOrderType: (type) => {
        set((state) => ({
          currentOrder: {
            ...state.currentOrder,
            order_type: type,
          },
        }));
      },

      updateOrder: (updates) => {
        set((state) => ({
          currentOrder: {
            ...state.currentOrder,
            ...updates,
          },
        }));
      },

      saveDesign: (design) => {
        set((state) => ({
          savedDesigns: [...state.savedDesigns, design],
        }));
      },

      loadDesign: (index) => {
        const { savedDesigns } = get();
        if (savedDesigns[index]) {
          set({ currentOrder: savedDesigns[index] });
        }
      },

      clearOrder: () => {
        set({ currentOrder: null });
      },

      getCurrentStep: () => {
        const { currentOrder } = get();
        if (!currentOrder) return 0;
        if (!currentOrder.order_type) return 0;
        if (!currentOrder.customer_info) return 1;
        if (!currentOrder.product_base) return 2;
        if (!currentOrder.size_quantity) return 3;
        if (!currentOrder.design) return 4;
        if (!currentOrder.order_details) return 5;
        if (!currentOrder.shipping) return 6;
        return 7;
      },
    }),
    {
      name: 'kaos-euy-custom-order',
    }
  )
);
