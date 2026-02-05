import type { StatusGroup } from '@/lib/admin/status';

export interface AdminListResponse<T> {
  items: T[];
  nextOffset: number | null;
}

export interface AdminOrderListItem {
  id: string;
  orderNumber: string;
  buyerName: string;
  status: string;
  statusGroup: StatusGroup;
  totalCents: number;
  createdAt: string;
}

export interface AdminOrderItem {
  id: string;
  productId: string | null;
  productName?: string | null;
  productSlug?: string | null;
  quantity: number;
  unitPriceCents: number;
  options: Record<string, string>;
}

export interface AdminOrderDetail {
  id: string;
  orderNumber: string;
  buyerName: string;
  buyerPhone?: string | null;
  buyerEmail?: string | null;
  shippingAddress?: Record<string, string> | null;
  notes?: string | null;
  status: string;
  statusGroup: StatusGroup;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  createdAt: string;
  items: AdminOrderItem[];
}

export interface AdminCustomRequestListItem {
  id: string;
  requestNumber: string;
  orgName?: string | null;
  requesterName: string;
  quantityEstimate?: number | null;
  status: string;
  statusGroup: StatusGroup;
  createdAt: string;
}

export interface AdminCustomRequestFile {
  id: string;
  bucket: string;
  path: string;
  originalName?: string | null;
  mimeType?: string | null;
  sizeBytes?: number | null;
  createdAt: string;
}

export interface AdminCustomRequestDetail {
  id: string;
  requestNumber: string;
  requesterName: string;
  whatsapp?: string | null;
  orgName?: string | null;
  productTypes: string[];
  quantityEstimate?: number | null;
  deadlineDate?: string | null;
  notes?: string | null;
  status: string;
  statusGroup: StatusGroup;
  createdAt: string;
  files: AdminCustomRequestFile[];
}

