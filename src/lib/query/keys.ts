export const queryKeys = {
  products: (params: { slug?: string; inStock?: boolean }) =>
    [
      'products',
      params.slug ?? null,
      typeof params.inStock === 'boolean' ? params.inStock : null,
    ] as const,
  cartItems: (userId: string | null) => ['cart-items', userId] as const,
  myOrders: (userId: string | null) => ['my-orders', userId] as const,
  orderDetail: (userId: string | null, orderId: string) =>
    ['order-detail', userId, orderId] as const,
} as const;
