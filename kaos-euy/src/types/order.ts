export interface ShippingAddress {
  address_line1: string;
  city: string;
  country: string;
}

export interface CheckoutForm {
  buyer_name: string;
  buyer_phone: string;
  buyer_email?: string;
  shipping_address: ShippingAddress;
  notes?: string;
  company_website?: string;
}

export interface CreateOrderItemInput {
  product_id: string;
  quantity: number;
  unit_price_cents: number;
  options?: Record<string, string>;
}

export interface CreateOrderRequest {
  buyer_name: string;
  buyer_phone: string;
  buyer_email?: string;
  shipping_address: ShippingAddress;
  items: CreateOrderItemInput[];
  notes?: string;
  company_website?: string;
}

export interface CreateOrderResponse {
  id: string;
  order_number: string;
  status: string;
  subtotal_cents: number;
  shipping_cents: number;
  total_cents: number;
  created_at: string;
}

export interface ApiErrorResponse {
  code: string;
  message: string;
  fieldErrors?: Record<string, string>;
}
