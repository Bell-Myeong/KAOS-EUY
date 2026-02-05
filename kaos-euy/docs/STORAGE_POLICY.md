# Storage Policy (MVP)

## 버킷
- 이름: `uploads`
- 접근: private (public read 없음)

## 경로 규칙
- `custom-requests/{upload_group_id}/{timestamp}_{filename}`
- `orders/{order_id}/{timestamp}_{filename}`

## upload_group_id
- 업로드 전에 클라이언트에서 생성하는 임시 UUID
- 커스텀 요청 제출 시 `custom_requests.upload_group_id`에 저장
- Admin은 files 테이블의 path로 파일을 찾는다

## 허용 파일
- 타입: `image/png`, `image/jpeg`, `application/pdf`, `application/postscript`(ai), `image/svg+xml`
- 확장자: `png`, `jpg`, `jpeg`, `pdf`, `svg`, `ai`
- 최대 용량: 파일당 20MB
- 최대 개수: 요청당 10개

## 접근 정책
- 서버에서 `SUPABASE_SERVICE_ROLE_KEY`로 signed upload URL 생성
- public 사용자는 Storage read 권한 없음
- Admin은 signed download URL로만 접근

## 보안 고려사항
- 업로드 요청에 rate limit 적용(인메모리, 서버리스 환경에서는 인스턴스별로 동작)
- 파일 타입/용량 검증을 서버에서 수행
- 악성 파일 업로드 가능성에 대한 스캔/격리 정책 고려

