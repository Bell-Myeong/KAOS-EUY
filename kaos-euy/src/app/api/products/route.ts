import { NextResponse } from 'next/server';
import { fetchActiveProducts } from '@/lib/supabase/server';
import { buildErrorResponse, createRequestId } from '@/lib/api';

export async function GET() {
  const requestId = createRequestId();
  const endpoint = 'GET /api/products';

  try {
    const items = await fetchActiveProducts();
    return NextResponse.json(
      { items },
      {
        status: 200,
        headers: {
          'x-request-id': requestId,
        },
      }
    );
  } catch (error) {
    return buildErrorResponse({
      status: 500,
      code: 'SERVER_ERROR',
      message: '상품 목록을 불러오는 중 오류가 발생했습니다.',
      fieldErrors: {},
      requestId,
      endpoint,
      error,
    });
  }
}
