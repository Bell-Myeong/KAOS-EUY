'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { createGuestOrder, getGuestOrder } from '@/lib/api/guestOrders';

export function useCreateGuestOrder() {
  return useMutation({
    mutationFn: createGuestOrder,
  });
}

export function useGuestOrderDetail(input: {
  orderId: string | null;
  email: string | null;
  token: string | null;
}) {
  return useQuery({
    queryKey: ['guest-order', input.orderId, input.email, input.token],
    queryFn: () =>
      getGuestOrder({
        orderId: input.orderId as string,
        email: input.email as string,
        token: input.token as string,
      }),
    enabled: Boolean(input.orderId && input.email && input.token),
  });
}

