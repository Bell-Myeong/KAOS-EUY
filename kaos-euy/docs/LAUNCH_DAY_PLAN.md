# 런칭 당일 운영 플랜

## T-24h (전날) 체크
- 스테이징 최종 테스트 완료 기준 충족 확인
- 환경 변수/시크릿 재확인 (`docs/ENVIRONMENT.md` 기준)
- admin 계정/접근/권한 확인
- Slack/이메일 알림 테스트
- 주요 운영 문서 링크 점검 (`docs/LAUNCH_CHECKLIST.md`, `docs/DEPLOY_RUNBOOK.md`)

## T-2h (런칭 직전) 체크
- 배포 리허설 결과 확인 (`docs/DEPLOY_RUNBOOK.md`)
- `scripts/verify-deploy.mjs` 실행
- Supabase 정책/버킷(private)/signed URL 동작 점검 (`docs/SUPABASE_PROD_CHECK.md`)

## T0 (런칭) 실행 단계
- 프로덕션 배포 실행 순서 확인 (`docs/DEPLOY_RUNBOOK.md` 참조)
- 배포 직후 Smoke Test 10개 수행
- 테스트 데이터 표시 규칙 적용

## 필수 Smoke Test 10개
1. `/` 로드 + 상품 리스트 표시
2. `/products/[slug]` 진입 (대표 상품 1개)
3. 카트 담기/수량 변경/새로고침 유지
4. `/checkout` 주문 생성 성공(테스트 주문 1건) → `/thank-you` 주문번호 표시
5. `/custom-order` 파일 없이 제출 1건 성공
6. `/custom-order` 파일 1개 업로드 + 제출 1건 성공
7. admin 로그인 성공
8. admin에서 주문 상세 조회 + 상태 변경
9. admin에서 커스텀 상세 조회 + 파일 signed download 열림
10. 알림(ORDER/CUSTOM) 도착 확인

## 테스트 표시 규칙
- 테스트 주문/요청은 `buyer_name` 또는 `requester_name`에 `[TEST]` 접두어 사용
- `notes`에 테스트 목적과 시간 기록

## T+1h 운영 루틴
- 주문/커스텀 성공률 및 429 발생량 확인 (`docs/MONITORING.md`)
- 오류 로그에서 request id 기반 빠른 샘플링 확인
- 알림 누락 여부 확인

## T+6h 운영 루틴
- 업로드 실패율과 admin 401/403 증가 여부 점검
- 사용자 문의/리포트 집계
- 필요 시 임시 완화 또는 롤백 판단 (`docs/INCIDENT_RUNBOOK.md`)

## T+24h 운영 루틴
- 24시간 리포트 정리 (성공률, 실패율, 주요 이슈)
- 핫픽스 필요 여부 검토 (`docs/HOTFIX_PROTOCOL.md`)
- 다음 24시간 운영 계획 업데이트
