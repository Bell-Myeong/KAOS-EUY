# 모니터링/로그/알람 운영 가이드

## 확인할 핵심 지표 (수동 기준)
- 주문 생성 실패율(체크아웃)
- 커스텀 업로드 실패율(presign 실패 vs 업로드 PUT 실패)
- admin 접근 실패(401/403 비정상 증가)
- 알림 누락(Slack/Email)
- 429(rate limit) 발생량

## 로그에서 봐야 할 키
- `request id`
- `endpoint`
- `error code`

## 장애 유형별 1차 대응
- 업로드 실패: 버킷 private 여부, signed URL 만료, 파일 용량/확장자 제한 확인
- 알림 실패: `SLACK_WEBHOOK_URL` 또는 이메일 환경 변수 확인
- 429 폭증: rate limit 설정 확인, 트래픽 급증 여부 확인
- 500 증가: DB 연결, Supabase 상태, 네트워크 오류 확인

## 관련 문서
- 장애 대응은 `docs/INCIDENT_RUNBOOK.md` 기준으로 진행
- 배포 이슈는 `docs/DEPLOY_RUNBOOK.md` 기준으로 진행

## 운영 메모
- 로그 메시지는 사용자 노출 메시지와 분리되어 있음
- 민감정보(전화/주소)는 로그에 남기지 않도록 유지
