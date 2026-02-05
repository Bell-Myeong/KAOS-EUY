export interface Product {
  id: string;
  slug: string | null;
  name: string;
  description: string | null;
  price_cents: number;
  currency: string;
  images: string[];
  options: Record<string, unknown>;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}
