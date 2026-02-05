export type SelectedOptions = Record<string, string>;

export interface CartItem {
  key: string;
  productId: string;
  slug: string | null;
  name: string;
  unitPriceCents: number;
  currency: string;
  quantity: number;
  selectedOptions: SelectedOptions;
  imageUrl?: string | null;
}

export interface AddToCartInput {
  productId: string;
  slug?: string | null;
  name: string;
  unitPriceCents: number;
  currency?: string;
  quantity?: number;
  selectedOptions?: SelectedOptions;
  imageUrl?: string | null;
}
