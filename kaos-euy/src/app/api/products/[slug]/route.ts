import { NextResponse } from 'next/server';
import { fetchProductBySlug } from '@/lib/supabase/server';
import { buildErrorResponse, createRequestId } from '@/lib/api';

export async function GET(
  _request: Request,
  context: { params: { slug?: string } }
) {
  const requestId = createRequestId();
  const endpoint = 'GET /api/products/[slug]';
  const slug = context.params?.slug?.trim();

  if (!slug) {
    return buildErrorResponse({
      status: 400,
      code: 'VALIDATION_ERROR',
      message: '요청 값이 유효하지 않습니다.',
      fieldErrors: {
        slug: 'slug가 필요합니다.',
      },
      requestId,
      endpoint,
    });
  }

  try {
    const product = await fetchProductBySlug(slug);
    if (!product) {
      return buildErrorResponse({
        status: 404,
        code: 'NOT_FOUND',
        message: '상품을 찾을 수 없습니다.',
        fieldErrors: {
          slug: '존재하지 않는 상품입니다.',
        },
        requestId,
        endpoint,
      });
    }

    return NextResponse.json(product, {
      status: 200,
      headers: {
        'x-request-id': requestId,
      },
    });
  } catch (error) {
    return buildErrorResponse({
      status: 500,
      code: 'SERVER_ERROR',
      message: '상품 조회 중 오류가 발생했습니다.',
      fieldErrors: {},
      requestId,
      endpoint,
      error,
    });
  }
}
