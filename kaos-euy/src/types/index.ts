// Kaos EUY! - Type Definitions

export type OrderType = 'personal' | 'bulk';

export type PreferredContact = 'whatsapp' | 'email' | 'phone';

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  company_name?: string;
  preferred_contact: PreferredContact;
}

export type ProductCategory = 'tshirt' | 'hoodie' | 'totebag' | 'other';

export type TShirtStyle = 'crew_neck' | 'v_neck' | 'raglan';

export type SleeveType = 'short' | 'long';

export interface ProductColor {
  code: string;
  name: string;
}

export type MaterialGrade = 'standard' | 'premium' | 'organic';

export interface Material {
  grade: MaterialGrade;
  gsm: number;
}

export interface ProductBase {
  category: ProductCategory;
  tshirt_style?: TShirtStyle;
  sleeve_type?: SleeveType;
  color: ProductColor;
  material: Material;
}

export type Size = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | '3XL';

export interface PersonalSizeQuantity {
  size: Size;
  quantity: number;
}

export interface BulkSizeBreakdown {
  XS: number;
  S: number;
  M: number;
  L: number;
  XL: number;
  XXL: number;
  '3XL': number;
}

export interface BulkSizeQuantity {
  breakdown: BulkSizeBreakdown;
  total_quantity: number;
}

export interface CustomMeasurement {
  enabled: boolean;
  chest_cm?: number;
  body_length_cm?: number;
  shoulder_cm?: number;
}

export interface SizeQuantity {
  personal?: PersonalSizeQuantity;
  bulk?: BulkSizeQuantity;
  custom_measurement?: CustomMeasurement;
}

export type DesignSource = 'upload' | 'template' | 'request';

export interface DesignUpload {
  file: File;
  max_size: string;
  resolution_note: string;
}

export interface DesignTemplate {
  template_id: string;
  customizable_text?: string[];
}

export type DesignStyle = 'minimalist' | 'bold' | 'vintage' | 'sundanese' | 'modern';

export interface DesignRequest {
  description: string;
  reference_images?: File[];
  style_preference: DesignStyle;
}

export type PrintArea = 'full' | 'chest_left' | 'chest_center' | 'pocket' | 'upper' | 'lower' | 'center';

export interface PrintPosition {
  enabled: boolean;
  area?: PrintArea;
  size_cm?: {
    width: number;
    height: number;
  };
}

export interface PrintPositions {
  front?: PrintPosition;
  back?: PrintPosition;
  sleeve_left?: boolean;
  sleeve_right?: boolean;
}

export type PrintMethod = 'dtf' | 'sablon' | 'embroidery' | 'sublimation';

export interface Design {
  source: DesignSource;
  upload?: DesignUpload;
  template?: DesignTemplate;
  request?: DesignRequest;
  print_position: PrintPositions;
  print_method: PrintMethod;
}

export type TextPosition = 'front' | 'back' | 'sleeve';

export interface SundaneseText {
  phrase: string;
  position: TextPosition;
}

export interface BandungIcons {
  selected: string[];
}

export type BatikStyle = 'accent' | 'full';

export interface BatikPattern {
  enabled: boolean;
  style: BatikStyle;
}

export interface SundaneseElements {
  enabled: boolean;
  sundanese_text?: SundaneseText;
  bandung_icons?: BandungIcons;
  batik_pattern?: BatikPattern;
}

export type Flexibility = 'strict' | 'flexible';

export interface Deadline {
  date: Date;
  flexibility: Flexibility;
}

export type Urgency = 'normal' | 'express';

export type BudgetRange = 'under_50k' | '50k_100k' | '100k_150k' | 'above_150k' | 'discuss';

export interface SampleRequest {
  needed: boolean;
  quantity: number;
}

export interface OrderDetails {
  deadline: Deadline;
  urgency: Urgency;
  budget_range?: BudgetRange;
  special_request?: string;
  sample_request?: SampleRequest;
}

export type ShippingMethod = 'pickup' | 'delivery';

export interface Pickup {
  location: string;
  preferred_date: Date;
}

export type Courier = 'jne' | 'jnt' | 'sicepat' | 'gosend' | 'grab';

export interface DeliveryAddress {
  recipient_name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  postal_code: string;
  full_address: string;
  notes?: string;
}

export interface Delivery {
  courier: Courier;
  address: DeliveryAddress;
}

export interface Shipping {
  method: ShippingMethod;
  pickup?: Pickup;
  delivery?: Delivery;
}

export interface CustomOrder {
  order_type: OrderType;
  customer_info: CustomerInfo;
  product_base: ProductBase;
  size_quantity: SizeQuantity;
  design: Design;
  sundanese_elements?: SundaneseElements;
  order_details: OrderDetails;
  shipping: Shipping;
}

// Product Type
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  images: string[];
  category: ProductCategory;
  sizes: Size[];
  colors: ProductColor[];
  in_stock: boolean;
  is_customizable: boolean;
}

// Cart Types
export interface CartItem {
  product: Product;
  quantity: number;
  size: Size;
  color: ProductColor;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  created_at: Date;
}

// Order Status
export type OrderStatus = 'pending' | 'processing' | 'printing' | 'shipped' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  user_id: string;
  items: CartItem[];
  custom_order?: CustomOrder;
  status: OrderStatus;
  total: number;
  created_at: Date;
  updated_at: Date;
}
