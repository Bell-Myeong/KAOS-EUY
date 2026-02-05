# 환경 변수 가이드

## 기본 원칙
- `NEXT_PUBLIC_*`는 클라이언트에 노출되므로 민감 키를 넣지 않는다.
- 서버 전용 키는 서버 API 라우트에서만 사용한다.
- DEV/STAGING/PROD는 서로 다른 키 세트를 사용한다.

## 필수 환경 변수
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PASSWORD`

## 선택 환경 변수
- `SUPABASE_STORAGE_BUCKET` (기본값: `uploads`)
- `SLACK_WEBHOOK_URL` (Slack 알림을 사용하는 경우)
- `DEPLOY_BASE_URL` (배포 검증 스크립트용)

## 환경별 체크리스트

### DEV
- 로컬 `.env.local` 또는 `.env`에 필수 키가 모두 있는지 확인
- `SUPABASE_STORAGE_BUCKET`가 없다면 기본값 `uploads` 사용
- Slack 알림을 테스트하려면 `SLACK_WEBHOOK_URL` 설정

### STAGING
- PROD와 분리된 Supabase 프로젝트/키 사용
- 스테이징용 `ADMIN_PASSWORD` 별도 설정
- 알림 채널이 운영 채널과 분리되어 있는지 확인

### PROD
- `NEXT_PUBLIC_*`와 서버 전용 키가 혼동되지 않도록 재확인
- `ADMIN_PASSWORD`는 운영자만 접근 가능한 경로에 보관
- Slack/Webhook 등 외부 알림 키는 최소 인원만 접근

## 절대 클라이언트에 노출되면 안 되는 키
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PASSWORD`
- `SLACK_WEBHOOK_URL`

## 로컬 실행 팁
- `.env.example`를 복사해 `.env.local`을 만들고 값을 채운다.
- 키 값은 로그에 출력하지 않는다.
