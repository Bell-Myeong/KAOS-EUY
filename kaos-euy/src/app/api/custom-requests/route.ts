import { NextResponse } from 'next/server';
import { supabaseAdminFetch } from '@/lib/supabase/server';
import { formatNumber } from '@/lib/utils';
import { sendSlackNotification } from '@/lib/notifications/slack';
import { MAX_FILE_COUNT } from '@/lib/uploads';
import { buildErrorResponse, createRequestId, getClientIp } from '@/lib/api';
import { checkRateLimit } from '@/lib/rate-limit';
import type {
  CreateCustomRequestRequest,
  CreateCustomRequestResponse,
  UploadedFileMeta,
} from '@/types/custom-request';

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 5;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function generateRequestNumber() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const suffix = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');

  // 사람이 읽기 쉬운 규칙: EUY-CR-YYYYMMDD-XXXX (XXXX는 랜덤 4자리)
  return `EUY-CR-${yyyy}${mm}${dd}-${suffix}`;
}

export async function POST(request: Request) {
  const requestId = createRequestId();
  const endpoint = 'POST /api/custom-requests';
  const ip = getClientIp(request);
  const rate = checkRateLimit(`custom-requests:${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
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

  let body: CreateCustomRequestRequest;

  try {
    body = (await request.json()) as CreateCustomRequestRequest;
  } catch {
    return buildErrorResponse({
      status: 400,
      code: 'INVALID_JSON',
      message: '요청 본문이 올바른 JSON이 아닙니다.',
      fieldErrors: {},
      requestId,
      endpoint,
    });
  }

  if (isNonEmptyString(body.company_website)) {
    return buildErrorResponse({
      status: 400,
      code: 'SPAM_DETECTED',
      message: '요청이 정상적으로 처리되지 않았습니다.',
      fieldErrors: {
        company_website: '스팸 방지 필드가 입력되었습니다.',
      },
      requestId,
      endpoint,
    });
  }

  const fieldErrors: Record<string, string> = {};

  if (!isNonEmptyString(body.requester_name)) {
    fieldErrors.requester_name = '담당자 이름은 필수입니다.';
  }
  if (!isNonEmptyString(body.whatsapp)) {
    fieldErrors.whatsapp = 'WhatsApp 연락처는 필수입니다.';
  }

  const productTypes = Array.isArray(body.product_types)
    ? body.product_types.filter(isNonEmptyString)
    : [];
  if (productTypes.length === 0) {
    fieldErrors.product_types = '제품 종류를 최소 1개 선택해주세요.';
  }
  if (!Number.isFinite(body.quantity_estimate) || body.quantity_estimate < 1) {
    fieldErrors.quantity_estimate = '수량은 1 이상이어야 합니다.';
  }

  if (body.upload_group_id && !isNonEmptyString(body.upload_group_id)) {
    fieldErrors.upload_group_id = 'upload_group_id가 올바르지 않습니다.';
  }

  if (body.files && Array.isArray(body.files) && body.files.length > MAX_FILE_COUNT) {
    fieldErrors.files = `파일은 최대 ${MAX_FILE_COUNT}개까지 가능합니다.`;
  }

  const files: UploadedFileMeta[] = [];
  if (body.files && Array.isArray(body.files)) {
    body.files.forEach((file, index) => {
      if (!isNonEmptyString(file.bucket)) {
        fieldErrors[`files.${index}.bucket`] = 'bucket이 필요합니다.';
      }
      if (!isNonEmptyString(file.path)) {
        fieldErrors[`files.${index}.path`] = 'path가 필요합니다.';
      }
      if (!isNonEmptyString(file.original_name)) {
        fieldErrors[`files.${index}.original_name`] = 'original_name이 필요합니다.';
      }
      if (!isNonEmptyString(file.mime_type)) {
        fieldErrors[`files.${index}.mime_type`] = 'mime_type이 필요합니다.';
      }
      if (!Number.isFinite(file.size_bytes) || file.size_bytes <= 0) {
        fieldErrors[`files.${index}.size_bytes`] = 'size_bytes가 올바르지 않습니다.';
      }

      files.push(file);
    });
  }

  if (Object.keys(fieldErrors).length > 0) {
    return buildErrorResponse({
      status: 400,
      code: 'VALIDATION_ERROR',
      message: '요청 값이 유효하지 않습니다.',
      fieldErrors,
      requestId,
      endpoint,
    });
  }

  try {
    const requestNumber = generateRequestNumber();

    const requestPayload = {
      request_number: requestNumber,
      requester_name: body.requester_name.trim(),
      whatsapp: body.whatsapp.trim(),
      org_name: body.org_name?.trim() || null,
      upload_group_id: body.upload_group_id || null,
      product_types: productTypes,
      quantity_estimate: body.quantity_estimate,
      deadline_date: body.deadline_date || null,
      notes: body.notes?.trim() || null,
      status: 'pending',
    };

    const requestRows = await supabaseAdminFetch<{ id: string; request_number: string }[]>(
      'custom_requests',
      {
        method: 'POST',
        headers: {
          Prefer: 'return=representation',
        },
        body: JSON.stringify(requestPayload),
      }
    );

    if (!requestRows || requestRows.length === 0) {
      throw new Error('custom_requests insert failed');
    }

    const requestRow = requestRows[0];

    if (files.length > 0) {
      const filePayload = files.map((file) => ({
        owner_type: 'custom_request',
        owner_id: requestRow.id,
        bucket: file.bucket,
        path: file.path,
        original_name: file.original_name,
        mime_type: file.mime_type,
        size_bytes: file.size_bytes,
      }));

      try {
        await supabaseAdminFetch('files', {
          method: 'POST',
          headers: {
            Prefer: 'return=representation',
          },
          body: JSON.stringify(filePayload),
        });
      } catch (error) {
        await supabaseAdminFetch(`custom_requests?id=eq.${requestRow.id}`, {
          method: 'DELETE',
        });
        throw error;
      }
    }

    const quantityLabel = formatNumber(body.quantity_estimate);
    await sendSlackNotification(
      [
        `NEW CUSTOM REQUEST - ${requestRow.request_number}`,
        `Requester: ${body.requester_name}`,
        `Org: ${body.org_name?.trim() || '-'}`,
        `Quantity: ${quantityLabel}`,
        `Admin: /admin/custom-requests/${requestRow.id}`,
      ].join('\n')
    );

    const response: CreateCustomRequestResponse = {
      requestId: requestRow.id,
      requestNumber: requestRow.request_number,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    return buildErrorResponse({
      status: 500,
      code: 'SERVER_ERROR',
      message: '커스텀 요청 저장 중 오류가 발생했습니다.',
      fieldErrors: {},
      requestId,
      endpoint,
      error,
    });
  }
}
