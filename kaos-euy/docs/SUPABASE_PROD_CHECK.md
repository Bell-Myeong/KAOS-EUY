# Supabase 프로덕션 점검

## 1) 테이블 존재 확인
- `products`
- `orders`
- `order_items`
- `custom_requests`
- `files`

## 2) RLS/정책 개요
- 모든 테이블에 RLS 활성화
- 공개 사용자(anon/authenticated)는 직접 SELECT/INSERT/UPDATE/DELETE 금지
- 서버 API 라우트에서 Service Role로만 접근
- Admin은 `ADMIN_PASSWORD` 기반 세션으로 보호

## 3) Storage 버킷
- 버킷 이름: `uploads`
- 접근: private 유지 (public read 금지)
- 경로 규칙과 허용 파일은 `docs/STORAGE_POLICY.md`를 Source of Truth로 사용

## 4) Signed Upload/Download 체크
- `/api/uploads/presign` 호출이 200으로 응답하는지 확인
- 발급된 signed upload URL로 PUT 업로드가 성공하는지 확인
- admin에서 signed download URL로 파일이 열리는지 확인

## 5) Admin 인증 확인
- `/admin` 로그인 성공 여부
- httpOnly 쿠키 발급 여부
- 세션 만료 시 401/403 처리 여부

## 체크 메모
- 운영 콘솔에서 세부 UI 설명보다 “무엇을 확인해야 하는지”에 집중한다.
- 정책이 변경되면 `docs/DB_SCHEMA.sql`과 본 문서를 함께 갱신한다.
