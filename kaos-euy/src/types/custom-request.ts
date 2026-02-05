export interface UploadedFileMeta {
  bucket: string;
  path: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
}

export interface CreateCustomRequestRequest {
  requester_name: string;
  whatsapp: string;
  org_name?: string;
  upload_group_id?: string;
  product_types: string[];
  quantity_estimate: number;
  deadline_date?: string;
  notes?: string;
  files?: UploadedFileMeta[];
  company_website?: string;
}

export interface CreateCustomRequestResponse {
  requestId: string;
  requestNumber: string;
}

export interface PresignUploadRequest {
  ownerType: 'custom_request';
  uploadGroupId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}

export interface PresignUploadResponse {
  bucket: string;
  path: string;
  signedUrl: string;
  expiresAt: string;
}

export interface ApiErrorResponse {
  code: string;
  message: string;
  fieldErrors?: Record<string, string>;
}
