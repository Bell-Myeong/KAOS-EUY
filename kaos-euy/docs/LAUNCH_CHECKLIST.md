# 런칭 체크리스트 / 운영 가이드

## Source of Truth
- 환경 변수 목록: `docs/ENVIRONMENT.md`
- Supabase 운영 점검: `docs/SUPABASE_PROD_CHECK.md`
- Storage 정책: `docs/STORAGE_POLICY.md`
- 배포 절차: `docs/DEPLOY_RUNBOOK.md`
- 모니터링/인시던트: `docs/MONITORING.md`, `docs/INCIDENT_RUNBOOK.md`

## 배포 전 체크
- 환경 변수는 `docs/ENVIRONMENT.md` 기준으로 점검
- Supabase 테이블/버킷/정책은 `docs/SUPABASE_PROD_CHECK.md` 기준으로 점검
- Storage 경로/허용 파일은 `docs/STORAGE_POLICY.md` 기준으로 점검
- Admin 접근 확인: `/admin` 로그인 성공, httpOnly 쿠키 설정 확인
- 알림 채널 확인: Slack Webhook 응답 정상 여부
- 레이트리밋 동작 방식 확인: 인메모리 기반이며 서버리스 환경에서는 인스턴스별로 동작

## 기능 테스트 (핵심 E2E)
- 소매 주문 생성: `/products` → `/cart` → `/checkout` → `/thank-you` 흐름 확인
- 커스텀 요청 제출: `/custom-order` 폼 제출 및 요청번호 표시 확인
- 파일 업로드: presign → 업로드 → `custom_requests` 저장 연계 확인
- Admin 주문 조회: `/admin` 주문 목록/상세 확인 및 상태 변경
- Admin 커스텀 조회: `/admin` 커스텀 목록/상세 확인 및 상태 변경
- Admin 파일 열기: signed URL 발급 후 파일 열림 확인
- 알림 도착 확인: ORDER, CUSTOM 각각 Slack 알림 수신 여부

## 장애 트러블슈팅
- 업로드 실패: 버킷 private 여부, 서명 URL 만료, 파일 용량/확장자 제한 확인
- 알림 누락: `SLACK_WEBHOOK_URL` 환경 변수/네트워크 상태 확인
- 401/403 발생: admin 세션 만료 여부, `ADMIN_PASSWORD` 설정 여부 확인
- 429 발생: 레이트리밋 초과 여부 확인, 트래픽 피크 대응 고려
- 주문 저장 실패: Supabase Service Role 키 설정 및 테이블 권한 확인

## 보안 체크
- `SUPABASE_SERVICE_ROLE_KEY`가 클라이언트로 노출되지 않는지 확인
- `uploads` 버킷이 public으로 변경되지 않았는지 확인
- signed URL 만료 시간이 운영 정책과 일치하는지 확인
- 관리자 비밀번호 공유 범위 최소화 및 주기적 변경 권장

## 운영 메모
- 레이트리밋은 인메모리 구현으로 인스턴스 재시작 시 초기화됨
- 요청 오류 로그에 request id가 포함되므로 장애 대응 시 로그를 기준으로 추적
