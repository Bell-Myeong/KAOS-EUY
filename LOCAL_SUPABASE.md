# Local Supabase로 개발하기 (권장)

Supabase 조작이 익숙하지 않아도, **로컬 Supabase(도커)**로 DB/Auth/Studio를 띄워서 개발할 수 있어.

## 준비물
- Docker Desktop 설치 및 실행
- Supabase CLI 설치 (Windows)
  - `scoop install supabase` 또는 `choco install supabase`

## 실행 순서 (처음 1회)
1) 로컬 Supabase 시작
```bash
npm run supabase:start
```

2) DB 초기화 + migrations/seed 적용 (테이블 생성)
```bash
npm run supabase:reset
```
이 명령은 DB를 새로 만들기 때문에 기존 유저가 삭제되지만, **기본 관리자 계정은 자동으로 다시 생성**돼:
- `admin@local.test` / `Admin1234!`

3) 로컬 API URL/anon key 확인
```bash
npm run supabase:status
```
- 출력에서 **API URL**(보통 `http://localhost:54321`)과 **anon key**를 확인

4) `.env.local` 설정
```bash
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase status에 나온 anon key>
```

5) 프론트 실행
```bash
npm run dev
```

## DB가 자꾸 초기화(유저 삭제)되는 이유
- `npm run supabase:reset`은 **DB를 새로 만들기 때문에** `auth.users` / `public.users`가 전부 초기화돼.
- 스키마만 업데이트하고 싶을 때는 리셋 대신 아래를 사용해:
```bash
npm run supabase:migrate
```

## Studio에서 관리자 계정 만들기
- Studio: `http://localhost:54323`
- Authentication → Users에서 email/password 유저 생성
- SQL Editor에서 관리자 승격:
```sql
update public.users
set is_admin = true
where email = 'admin@example.com';
```

이제 `/admin/login`으로 로그인하면 `/admin/products`에서 상품 추가 가능.

## 종료
```bash
npm run supabase:stop
```
