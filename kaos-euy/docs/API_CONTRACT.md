# API 계약 (MVP)

## 공통
- Base: `/api`
- Content-Type: `application/json`
- 날짜/시간: ISO 8601 문자열

## 표준 에러 포맷
```json
{
  "code": "VALIDATION_ERROR",
  "message": "요청 값이 유효하지 않습니다.",
  "fieldErrors": {
    "buyer_email": "유효한 이메일이 필요합니다."
  }
}
```

## 상태 Enum
- `OrderStatus`: `PENDING_CONFIRMATION`, `PENDING_PAYMENT`, `CONFIRMED`, `IN_PRODUCTION`, `SHIPPED`, `COMPLETED`, `CANCELLED`
- `CustomRequestStatus`: `pending`, `reviewing`, `quoted`, `accepted`, `rejected`, `completed`

---

## GET /api/products
설명: 상품 목록

응답 예시
```json
{
  "items": [
    {
      "id": "8b3b4b77-2ef1-4d18-9b65-18c5f4c7d2a1",
      "slug": "bandung-classic",
      "name": "Bandung Classic Tee",
      "price_cents": 129000,
      "currency": "IDR",
      "images": ["https://.../1.jpg"],
      "is_active": true
    }
  ]
}
```

## GET /api/products/[slug]
설명: 상품 상세

응답 예시
```json
{
  "id": "8b3b4b77-2ef1-4d18-9b65-18c5f4c7d2a1",
  "slug": "bandung-classic",
  "name": "Bandung Classic Tee",
  "description": "...",
  "price_cents": 129000,
  "currency": "IDR",
  "images": ["https://.../1.jpg"],
  "options": {
    "sizes": ["S", "M", "L"],
    "colors": ["black", "white"]
  },
  "is_active": true
}
```

## POST /api/orders
설명: 주문 생성(Checkout)

- 실결제는 MVP 범위에서 제외된다.
- order_number 형식: `EUY-YYYYMMDD-XXXX` (YYYYMMDD는 날짜, XXXX는 랜덤 4자리)

요청 예시
```json
{
  "buyer_name": "홍길동",
  "buyer_phone": "+62 812-3456-7890",
  "buyer_email": "hong@example.com",
  "shipping_address": {
    "address_line1": "Jl. Asia Afrika 1",
    "city": "Bandung",
    "country": "ID"
  },
  "items": [
    {
      "product_id": "8b3b4b77-2ef1-4d18-9b65-18c5f4c7d2a1",
      "quantity": 2,
      "unit_price_cents": 129000,
      "options": {
        "size": "M",
        "color": "black"
      }
    }
  ],
  "notes": "Call before delivery"
}
```

응답 예시
```json
{
  "id": "f0d7e3a5-3c31-4b5d-9f9a-2dbe9e73c02a",
  "order_number": "EUY-20260204-5821",
  "status": "PENDING_CONFIRMATION",
  "subtotal_cents": 258000,
  "shipping_cents": 0,
  "total_cents": 258000,
  "created_at": "2026-02-04T03:10:00Z"
}
```

## POST /api/uploads/presign
설명: signed 업로드 URL 발급

요청 예시
```json
{
  "ownerType": "custom_request",
  "uploadGroupId": "7c4f98b6-2a8f-4c69-9df6-7d5e7b57f2c1",
  "fileName": "logo.png",
  "mimeType": "image/png",
  "sizeBytes": 345678
}
```

응답 예시
```json
{
  "bucket": "uploads",
  "path": "custom-requests/7c4f98b6-2a8f-4c69-9df6-7d5e7b57f2c1/1707033600_logo.png",
  "signedUrl": "https://...",
  "expiresAt": "2026-02-04T03:20:00Z"
}
```

## POST /api/custom-requests
설명: 커스텀/단체 주문 요청 생성

요청 예시
```json
{
  "requester_name": "김민수",
  "whatsapp": "+62 812-0000-0000",
  "org_name": "Bandung FC",
  "upload_group_id": "7c4f98b6-2a8f-4c69-9df6-7d5e7b57f2c1",
  "product_types": ["tshirt", "hoodie"],
  "quantity_estimate": 35,
  "deadline_date": "2026-03-01",
  "notes": "Need full set for players",
  "files": [
    {
      "bucket": "uploads",
      "path": "custom-requests/7c4f98b6-2a8f-4c69-9df6-7d5e7b57f2c1/1707033600_logo.png",
      "original_name": "logo.png",
      "mime_type": "image/png",
      "size_bytes": 345678
    }
  ]
}
```

응답 예시
```json
{
  "requestId": "8f3b1a2d-1111-4d4a-9c7f-22b7d8c5c9aa",
  "requestNumber": "EUY-CR-20260204-5821"
}
```

---

## Admin API 공통
- 인증 필요: 관리자 로그인 쿠키가 없으면 401/403 반환
- status_group: `NEW` | `IN_PROGRESS` | `DONE`
- status 필터: `ALL` | `NEW` | `IN_PROGRESS` | `DONE`

## GET /api/admin/orders
설명: 주문 목록 (Admin)

Query
- status: ALL/NEW/IN_PROGRESS/DONE
- limit: 기본 20
- offset: 기본 0

응답 예시
```json
{
  "items": [
    {
      "id": "f0d7e3a5-3c31-4b5d-9f9a-2dbe9e73c02a",
      "orderNumber": "EUY-20260204-5821",
      "buyerName": "홍길동",
      "status": "PENDING_CONFIRMATION",
      "statusGroup": "NEW",
      "totalCents": 258000,
      "createdAt": "2026-02-04T03:10:00Z"
    }
  ],
  "nextOffset": 20
}
```

## GET /api/admin/orders/[id]
설명: 주문 상세 (Admin)

응답 예시
```json
{
  "id": "f0d7e3a5-3c31-4b5d-9f9a-2dbe9e73c02a",
  "orderNumber": "EUY-20260204-5821",
  "buyerName": "홍길동",
  "buyerPhone": "+62 812-3456-7890",
  "buyerEmail": "hong@example.com",
  "shippingAddress": {
    "address_line1": "Jl. Asia Afrika 1",
    "city": "Bandung",
    "country": "ID"
  },
  "status": "PENDING_CONFIRMATION",
  "statusGroup": "NEW",
  "subtotalCents": 258000,
  "shippingCents": 0,
  "totalCents": 258000,
  "items": [
    {
      "id": "0c1a...",
      "productId": "8b3b4b77-2ef1-4d18-9b65-18c5f4c7d2a1",
      "productName": "Bandung Classic Tee",
      "quantity": 2,
      "unitPriceCents": 129000,
      "options": {
        "size": "M",
        "color": "black"
      }
    }
  ],
  "createdAt": "2026-02-04T03:10:00Z"
}
```

## PATCH /api/admin/orders/[id]/status
설명: 주문 상태 변경 (Admin)
- status는 `NEW` | `IN_PROGRESS` | `DONE` 사용을 권장 (서버에서 실제 enum으로 매핑)

요청 예시
```json
{
  "status": "IN_PROGRESS"
}
```

응답 예시
```json
{
  "id": "f0d7e3a5-3c31-4b5d-9f9a-2dbe9e73c02a",
  "status": "IN_PRODUCTION",
  "statusGroup": "IN_PROGRESS",
  "updatedAt": "2026-02-04T04:00:00Z"
}
```

## GET /api/admin/custom-requests
설명: 커스텀 요청 목록 (Admin)

Query
- status: ALL/NEW/IN_PROGRESS/DONE
- limit: 기본 20
- offset: 기본 0

응답 예시
```json
{
  "items": [
    {
      "id": "8f3b1a2d-1111-4d4a-9c7f-22b7d8c5c9aa",
      "requestNumber": "EUY-CR-20260204-5821",
      "requesterName": "김민수",
      "orgName": "Bandung FC",
      "quantityEstimate": 35,
      "status": "pending",
      "statusGroup": "NEW",
      "createdAt": "2026-02-04T03:12:00Z"
    }
  ],
  "nextOffset": 20
}
```

## GET /api/admin/custom-requests/[id]
설명: 커스텀 요청 상세 (Admin)

응답 예시
```json
{
  "id": "8f3b1a2d-1111-4d4a-9c7f-22b7d8c5c9aa",
  "requestNumber": "EUY-CR-20260204-5821",
  "requesterName": "김민수",
  "whatsapp": "+62 812-0000-0000",
  "orgName": "Bandung FC",
  "productTypes": ["tshirt", "hoodie"],
  "quantityEstimate": 35,
  "deadlineDate": "2026-03-01",
  "notes": "Need full set for players",
  "status": "pending",
  "statusGroup": "NEW",
  "files": [
    {
      "id": "f1b2...",
      "bucket": "uploads",
      "path": "custom-requests/7c4f98b6-2a8f-4c69-9df6-7d5e7b57f2c1/1707033600_logo.png",
      "originalName": "logo.png"
    }
  ],
  "createdAt": "2026-02-04T03:12:00Z"
}
```

## PATCH /api/admin/custom-requests/[id]/status
설명: 커스텀 요청 상태 변경 (Admin)
- status는 `NEW` | `IN_PROGRESS` | `DONE` 사용을 권장 (서버에서 실제 enum으로 매핑)

요청 예시
```json
{
  "status": "DONE"
}
```

응답 예시
```json
{
  "id": "8f3b1a2d-1111-4d4a-9c7f-22b7d8c5c9aa",
  "status": "completed",
  "statusGroup": "DONE",
  "updatedAt": "2026-02-04T04:05:00Z"
}
```

## GET /api/admin/files/signed-url
설명: Admin 파일 다운로드용 signed URL 발급

Query
- bucket: 기본 uploads
- path: storage path

응답 예시
```json
{
  "signedUrl": "https://...",
  "expiresAt": "2026-02-04T03:20:00Z"
}
```

