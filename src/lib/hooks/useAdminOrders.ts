'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchAdminOrderDetail,
  fetchAdminOrders,
  updateAdminOrderStatus,
  type OrderStatus,
} from '@/lib/api/adminOrders';

export function useAdminOrders(filters?: { status?: OrderStatus }) {
  return useQuery({
    queryKey: ['admin-orders', filters?.status ?? null],
    queryFn: () => fetchAdminOrders(filters),
  });
}

export function useAdminOrderDetail(orderId: string | null) {
  return useQuery({
    queryKey: ['admin-order', orderId],
    queryFn: () => fetchAdminOrderDetail(orderId as string),
    enabled: Boolean(orderId),
  });
}

export function useUpdateAdminOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAdminOrderStatus,
    onSuccess: async (updated) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-orders'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-order', updated.id] }),
      ]);
    },
  });
}

