'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { createOrderFromCart, getMyOrders, getOrderDetail } from '@/lib/api/orders';
import { queryKeys } from '@/lib/query/keys';

export function useMyOrders() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  return useQuery({
    queryKey: queryKeys.myOrders(userId),
    queryFn: getMyOrders,
    enabled: Boolean(userId),
  });
}

export function useOrderDetail(orderId: string) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  return useQuery({
    queryKey: queryKeys.orderDetail(userId, orderId),
    queryFn: () => getOrderDetail(orderId),
    enabled: Boolean(userId) && Boolean(orderId),
  });
}

export function useCreateOrderFromCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrderFromCart,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['cart-items'] }),
        queryClient.invalidateQueries({ queryKey: ['my-orders'] }),
      ]);
    },
  });
}
