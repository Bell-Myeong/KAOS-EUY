# MVP SPEC

## 범위
- 온라인샵(소매) 플로우: Store Front → Product Detail → Add to Cart → Checkout → Thank You
- 커스텀/단체 주문 플로우: Custom Order Form + 파일 업로드(로고/디자인) + Admin 확인/처리
- Admin 대시보드: 주문/커스텀 요청 목록, 상세, 상태 변경

## 페이지 / IA 맵
- `/` : Store Front (히어로, 가치 제안, 주요 상품 진입)
- `/products` : Product Catalog (목록)
- `/products/[slug]` : Product Detail (옵션 선택, 장바구니 담기)
- `/cart` : Cart (수량/옵션 변경, 합계)
- `/checkout` : Checkout (주문 생성, 결제 안내)
- `/thank-you` : Thank You (주문 완료 확인)
- `/custom-order` : 커스텀/단체 견적 요청 폼
- `/admin` : Admin 대시보드

## Non-goals
- 실결제 연동(결제 게이트웨이, PG 연동)
- 고객 로그인/주문 추적 포털
- 정교한 할인/쿠폰/프로모션 엔진
- 실시간 배송 추적

## 핵심 유저 플로우
- Shop: `/` → `/products` → `/products/[slug]` → `/cart` → `/checkout` → `/thank-you`
- Custom: `/custom-order` → 폼 작성 → 파일 업로드(signed) → 요청 생성 → 접수 완료 화면
- Admin: `/admin` 인증 → 주문/요청 목록 → 상세 확인 → 상태 변경 → 파일 다운로드(signed)

## 업로드 플로우 개요 (Signed Upload)
- 클라이언트에서 `upload_group_id`(임시 UUID)를 생성한다.
- 파일 선택 시 `/api/uploads/presign` 호출하여 업로드 URL과 저장 경로를 발급받는다.
- 클라이언트가 Supabase Storage에 직접 업로드한다.
- 업로드 완료 후 `/api/custom-requests`에 `upload_group_id` + 파일 메타데이터를 함께 전달한다.
- 서버는 DB에 `custom_requests` 레코드를 생성하고, `files`에 메타데이터를 연결한다.
- Admin은 signed download URL로만 접근한다.
- Admin 상세 파일 링크는 Pack 6에서 구현한다.

## Store Front 데이터 로드
- `/` 페이지는 서버 컴포넌트에서 Supabase `products` 테이블을 직접 조회한다.
- Pack 2에서는 API 라우트(`/api/products`)를 사용하지 않는다.

## Cart 저장 방식
- Cart는 브라우저 localStorage에 저장한다.
- 서버 저장/동기화는 Pack 3 범위 밖으로 둔다.

## 옵션 처리 방식
- `products.options`에서 `sizes`/`size`, `colors`/`color` 키만 처리한다.
- 그 외 키는 무시한다.

## 로컬 제품 시드(최소)
- Supabase SQL Editor에서 아래 예시를 실행한 뒤 `/`에서 목록 렌더링을 확인한다.
```sql
insert into products (slug, name, description, price_cents, currency, images, options, is_active)
values
  ('bandung-classic', 'Bandung Classic Tee', 'Soft cotton, daily essential', 129000, 'IDR',
   '["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab"]'::jsonb,
   '{"sizes":["S","M","L"],"colors":["black","white"]}'::jsonb, true);
```

## 환경 구분
- DEV / STAGING / PROD

## 필요한 환경 변수 (이름만)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET`
- `ADMIN_PASSWORD`
- `SLACK_WEBHOOK_URL`

## RLS / Auth 접근
- MVP에서는 모든 DB 쓰기/읽기를 서버 API 라우트에서 Service Role로 처리한다.
- 클라이언트는 직접 DB 접근을 하지 않으며, 공개 사용자(비로그인)는 INSERT/SELECT 권한을 갖지 않는다.
- Admin은 Pack 6에서는 admin password 방식으로 가드하고, 운영 단계에서 Supabase Auth + 이메일 allowlist로 전환을 권장한다.

## Admin 접근 방식
- Pack 6에서는 가장 단순한 admin password 방식(`ADMIN_PASSWORD`)을 사용한다.
- 로그인 성공 시 httpOnly 쿠키로 세션을 유지한다.
- 트레이드오프: 구현이 단순하지만 비밀번호 공유 리스크가 있으므로, 운영 단계에서는 Supabase Auth + 이메일 화이트리스트로 전환을 권장한다.

## 운영 알림
- Slack Webhook을 사용해 주문/커스텀요청 생성 시 운영자에게 알림을 보낸다.
- 알림은 best-effort이며 실패해도 주문/요청 저장은 성공해야 한다.
- 환경 변수: `SLACK_WEBHOOK_URL`



