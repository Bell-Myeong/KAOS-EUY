# 배포 리허설 런북

## 배포 전 확인
- `git status`가 깨끗한지 확인
- 배포 브랜치 확인 (예: `main`)
- 태그/버전 정책을 간단히 유지 (예: `release-YYYYMMDD`)
- 변경된 환경 변수 여부 확인 (`docs/ENVIRONMENT.md` 참고)

## 스테이징 배포 절차
- 스테이징 환경 변수 최신화
- 스테이징 배포 실행
- 배포 후 검증
- `DEPLOY_BASE_URL=https://staging.example.com node scripts/verify-deploy.mjs`
- 수동 E2E 체크는 `docs/LAUNCH_CHECKLIST.md` 기준으로 진행

## 프로덕션 배포 절차
- 스테이징에서 동일 버전으로 검증 완료 확인
- 프로덕션 환경 변수 최신화
- 프로덕션 배포 실행
- 배포 후 검증
- `DEPLOY_BASE_URL=https://example.com node scripts/verify-deploy.mjs`
- 운영 E2E 체크는 `docs/LAUNCH_CHECKLIST.md` 기준으로 진행

## 환경 변수 변경 시 주의사항
- env 변경 후 반드시 재배포 필요
- `NEXT_PUBLIC_*` 변경은 클라이언트 캐시 영향이 있으므로 즉시 확인
- 서버 전용 키는 로그에 노출하지 않는다

## 롤백 방법 (Vercel 기준)
- 가장 최근 정상 배포로 되돌린다
- 롤백 후 `verify-deploy`로 기본 라우트 재검증
- 데이터 롤백은 기본적으로 수행하지 않고, 필요한 경우 마이그레이션/핫픽스로 대응

## 관련 문서
- `docs/ENVIRONMENT.md`
- `docs/LAUNCH_CHECKLIST.md`
- `docs/MONITORING.md`
- `docs/INCIDENT_RUNBOOK.md`
