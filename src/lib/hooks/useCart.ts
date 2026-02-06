'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CartItem, ProductColor, Size } from '@/types';
import {
  getCartItems,
  removeCartItem,
  updateCartItemQuantity,
  upsertCartItem,
  type CartVariantKey,
} from '@/lib/api/cart';
import { useAuth } from '@/contexts/AuthContext';
import { queryKeys } from '@/lib/query/keys';

export function useCartItems() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  return useQuery({
    queryKey: queryKeys.cartItems(userId),
    queryFn: getCartItems,
    enabled: Boolean(userId),
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: upsertCartItem,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['cart-items'] });
    },
  });
}

export function useUpdateCartQuantity() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const cartKey = queryKeys.cartItems(user?.id ?? null);

  return useMutation({
    mutationFn: updateCartItemQuantity,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: cartKey });
      const previous = queryClient.getQueryData<CartItem[]>(cartKey);

      queryClient.setQueryData<CartItem[]>(cartKey, (current) => {
        if (!current) return current;
        return current.map((item) => {
          const matches =
            item.product.id === variables.productId &&
            item.size === variables.size &&
            item.color.code === variables.colorCode;
          return matches ? { ...item, quantity: variables.quantity } : item;
        });
      });

      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(cartKey, ctx.previous);
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['cart-items'] });
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const cartKey = queryKeys.cartItems(user?.id ?? null);

  return useMutation({
    mutationFn: removeCartItem,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: cartKey });
      const previous = queryClient.getQueryData<CartItem[]>(cartKey);

      queryClient.setQueryData<CartItem[]>(cartKey, (current) => {
        if (!current) return current;
        return current.filter(
          (item) =>
            !(
              item.product.id === variables.productId &&
              item.size === variables.size &&
              item.color.code === variables.colorCode
            )
        );
      });

      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(cartKey, ctx.previous);
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['cart-items'] });
    },
  });
}

export function cartVariantKey(input: {
  productId: string;
  size: Size;
  color: ProductColor;
}): CartVariantKey {
  return {
    productId: input.productId,
    size: input.size,
    colorCode: input.color.code,
  };
}
