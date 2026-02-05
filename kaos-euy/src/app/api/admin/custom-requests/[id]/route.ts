import { NextResponse } from 'next/server';
import { supabaseAdminFetch } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/admin/guard';
import { mapCustomStatusToGroup } from '@/lib/admin/status';
import { buildErrorResponse, createRequestId, getClientIp } from '@/lib/api';
import { checkRateLimit } from '@/lib/rate-limit';
import type { AdminCustomRequestDetail, AdminCustomRequestFile } from '@/types/admin';

interface CustomRequestRow {
  id: string;
  request_number: string;
  requester_name: string;
  whatsapp: string | null;
  org_name: string | null;
  product_types: string[] | null;
  quantity_estimate: number | null;
  deadline_date: string | null;
  notes: string | null;
  status: string;
  created_at: string;
}

interface FileRow {
  id: string;
  bucket: string;
  path: string;
  original_name: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string;
}

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 60;

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const requestId = createRequestId();
  const endpoint = 'GET /api/admin/custom-requests/[id]';
  const ip = getClientIp(request);
  const rate = checkRateLimit(`admin-custom-requests-detail:${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
  if (!rate.allowed) {
    return buildErrorResponse({
      status: 429,
      code: 'RATE_LIMITED',
      message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
      fieldErrors: {},
      requestId,
      endpoint,
      headers: {
        'Retry-After': String(rate.retryAfter),
      },
    });
  }

  const auth = requireAdmin(request);
  if (!auth.ok) {
    return buildErrorResponse({
      status: 401,
      code: auth.code,
      message: auth.message,
      fieldErrors: {},
      requestId,
      endpoint,
    });
  }

  const requestIdParam = params.id;
  if (!requestIdParam) {
    return buildErrorResponse({
      status: 400,
      code: 'INVALID_ID',
      message: 'request id가 필요합니다.',
      fieldErrors: {
        id: 'request id가 필요합니다.',
      },
      requestId,
      endpoint,
    });
  }

  const rows = await supabaseAdminFetch<CustomRequestRow[]>(
    `custom_requests?id=eq.${requestIdParam}&select=id,request_number,requester_name,whatsapp,org_name,product_types,quantity_estimate,deadline_date,notes,status,created_at&limit=1`
  );

  if (!rows || rows.length === 0) {
    return buildErrorResponse({
      status: 404,
      code: 'NOT_FOUND',
      message: '요청을 찾을 수 없습니다.',
      fieldErrors: {},
      requestId,
      endpoint,
    });
  }

  const requestRow = rows[0];

  const fileQuery = new URLSearchParams({
    select: 'id,bucket,path,original_name,mime_type,size_bytes,created_at',
    owner_type: 'eq.custom_request',
    owner_id: `eq.${requestIdParam}`,
    order: 'created_at.asc',
  });

  const fileRows = await supabaseAdminFetch<FileRow[]>(`files?${fileQuery.toString()}`);
  const files: AdminCustomRequestFile[] = fileRows.map((file) => ({
    id: file.id,
    bucket: file.bucket,
    path: file.path,
    originalName: file.original_name,
    mimeType: file.mime_type,
    sizeBytes: file.size_bytes,
    createdAt: file.created_at,
  }));

  const response: AdminCustomRequestDetail = {
    id: requestRow.id,
    requestNumber: requestRow.request_number,
    requesterName: requestRow.requester_name,
    whatsapp: requestRow.whatsapp,
    orgName: requestRow.org_name,
    productTypes: requestRow.product_types ?? [],
    quantityEstimate: requestRow.quantity_estimate,
    deadlineDate: requestRow.deadline_date,
    notes: requestRow.notes,
    status: requestRow.status,
    statusGroup: mapCustomStatusToGroup(requestRow.status),
    createdAt: requestRow.created_at,
    files,
  };

  return NextResponse.json(response, { status: 200 });
}