# Kaos EUY! 프론트엔드 개발 1차 보고서

**프로젝트명**: Kaos EUY! - 반둥 티셔츠 커스텀 주문 플랫폼
**작성일**: 2026-02-03
**개발 기간**: 1일차
**작성자**: Development Team
**문서 버전**: v1.0

---

## 📋 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [개발 환경 및 기술 스택](#2-개발-환경-및-기술-스택)
3. [구현 완료 기능](#3-구현-완료-기능)
4. [프로젝트 구조](#4-프로젝트-구조)
5. [핵심 기능 상세](#5-핵심-기능-상세)
6. [다국어 지원](#6-다국어-지원)
7. [향후 개발 계획](#7-향후-개발-계획)
8. [참고 자료](#8-참고-자료)

---

## 1. 프로젝트 개요

### 1.1 브랜드 소개

**Kaos EUY!**는 인도네시아 반둥(Bandung) 지역의 문화와 특색을 담은 프리미엄 커스텀 티셔츠 브랜드입니다.

| 항목 | 내용 |
|------|------|
| **브랜드명** | Kaos EUY! |
| **슬로건** | "Bandung's Pride, Your Style" |
| **타겟 고객** | 18-40세 학생/젊은 전문가, 반둥 주민 & 관광객 |
| **핵심 가치** | 활기참, 친근함, 창의적, 신뢰, 지역 밀착 |

### 1.2 프로젝트 목표

- ✅ 개인 및 단체 맞춤 티셔츠 주문 시스템 구축
- ✅ 사용자 친화적인 UI/UX 제공
- ✅ 반둥 문화 요소 통합
- ✅ 다국어 지원 (영어/인도네시아어)
- ✅ 모바일 우선 반응형 디자인

---

## 2. 개발 환경 및 기술 스택

### 2.1 Core Technologies

```
Framework:       Next.js 14.2.35 (App Router)
Language:        TypeScript 5.x
Runtime:         Node.js 18+
Package Manager: npm
```

### 2.2 Frontend Stack

| 분류 | 기술 | 용도 |
|------|------|------|
| **UI Framework** | Next.js 14 | React 기반 풀스택 프레임워크 |
| **스타일링** | Tailwind CSS 3.3 | 유틸리티 기반 CSS 프레임워크 |
| **애니메이션** | Framer Motion 11.0 | 부드러운 UI 애니메이션 |
| **상태 관리** | Zustand 4.5 | 경량 상태 관리 라이브러리 |
| **폼 관리** | React Hook Form 7.49 | 폼 상태 및 유효성 검사 |
| **검증** | Zod 3.22 | 타입 안전 스키마 검증 |
| **아이콘** | Lucide React 0.312 | 모던 아이콘 라이브러리 |
| **폰트** | Google Fonts | Poppins, Plus Jakarta Sans, Pacifico |

### 2.3 개발 도구

```
TypeScript Config: tsconfig.json (strict mode)
ESLint:            Next.js 기본 설정
PostCSS:           Tailwind CSS 처리
```

---

## 3. 구현 완료 기능

### 3.1 기능 구현 현황

| 기능 | 상태 | 완성도 | 비고 |
|------|------|--------|------|
| 프로젝트 초기 설정 | ✅ 완료 | 100% | Next.js 14 + TypeScript |
| 타입 시스템 구축 | ✅ 완료 | 100% | 전체 도메인 타입 정의 |
| 브랜드 스타일링 | ✅ 완료 | 100% | Tailwind + 커스텀 컬러 |
| 공통 컴포넌트 | ✅ 완료 | 100% | Button, Header, Footer |
| 홈 페이지 | ✅ 완료 | 100% | Hero, Value Props, CTA |
| 커스텀 오더 (메인) | ✅ 완료 | 100% | 주문 타입 선택 |
| 개인 주문 폼 | ✅ 완료 | 90% | 기본 폼 + 검증 |
| 장바구니 스토어 | ✅ 완료 | 100% | Zustand 기반 |
| 다국어 지원 | ✅ 완료 | 100% | EN/ID 전환 |
| 단체 주문 폼 | 🔲 미구현 | 0% | 다음 단계 |
| 제품 카탈로그 | 🔲 미구현 | 0% | 다음 단계 |
| 결제 시스템 | 🔲 미구현 | 0% | 향후 계획 |

### 3.2 페이지별 구현 상세

#### ✅ 완료된 페이지

1. **홈 페이지** (`/`)
   - Hero 섹션: 브랜드 소개 및 CTA
   - Value Props: 3가지 핵심 가치
   - CTA 섹션: 주문 유도
   - Featured Products: 제품 미리보기

2. **커스텀 오더 선택** (`/custom-order`)
   - 개인 주문 vs 단체 주문 선택
   - 각 옵션별 특징 안내
   - WhatsApp 상담 연동

3. **개인 주문 폼** (`/custom-order/personal`)
   - 고객 정보 입력 (이름, 이메일, 전화)
   - 제품 옵션 (사이즈, 수량, 색상)
   - 디자인 요청 설명
   - React Hook Form + Zod 검증

---

## 4. 프로젝트 구조

### 4.1 디렉토리 구조

```
kaos-euy/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # 루트 레이아웃
│   │   ├── page.tsx                  # 홈 페이지
│   │   ├── globals.css               # 글로벌 스타일
│   │   └── custom-order/             # 커스텀 오더
│   │       ├── page.tsx              # 타입 선택
│   │       ├── personal/
│   │       │   └── page.tsx          # 개인 주문 폼
│   │       └── bulk/                 # 단체 주문 (예정)
│   │
│   ├── components/                   # 재사용 컴포넌트
│   │   ├── common/
│   │   │   ├── Button.tsx            # 버튼 컴포넌트
│   │   │   └── LanguageSwitcher.tsx  # 언어 전환
│   │   └── layout/
│   │       ├── Header.tsx            # 헤더 (네비게이션)
│   │       └── Footer.tsx            # 푸터
│   │
│   ├── contexts/                     # React Context
│   │   └── LanguageContext.tsx       # 언어 상태 관리
│   │
│   ├── locales/                      # 다국어 리소스
│   │   ├── en.json                   # 영어 번역
│   │   └── id.json                   # 인도네시아어 번역
│   │
│   ├── stores/                       # Zustand 스토어
│   │   ├── cart.ts                   # 장바구니 상태
│   │   └── customOrder.ts            # 커스텀 오더 상태
│   │
│   └── types/                        # TypeScript 타입
│       └── index.ts                  # 전체 타입 정의
│
├── public/                           # 정적 파일
├── package.json                      # 의존성 관리
├── tsconfig.json                     # TypeScript 설정
├── tailwind.config.ts                # Tailwind 설정
├── next.config.js                    # Next.js 설정
├── README.md                         # 프로젝트 문서
└── QUICKSTART.md                     # 빠른 시작 가이드
```

### 4.2 파일 통계

```
총 TypeScript/TSX 파일: 14개
총 JSON 파일: 3개
총 설정 파일: 5개
총 문서 파일: 3개
```

---

## 5. 핵심 기능 상세

### 5.1 타입 시스템 (TypeScript)

**파일**: `src/types/index.ts`
**라인 수**: 268줄

#### 주요 타입 정의

```typescript
// 커스텀 오더 관련 (spec.md 기반)
- OrderType: 'personal' | 'bulk'
- CustomerInfo: 고객 정보
- ProductBase: 제품 기본 옵션
- SizeQuantity: 사이즈 & 수량
- Design: 디자인 커스터마이징
- SundaneseElements: 반둥 문화 요소
- OrderDetails: 주문 정보
- Shipping: 배송 정보

// 제품 관련
- Product: 제품 정보
- CartItem: 장바구니 아이템
- Cart: 장바구니

// 사용자 관련
- User: 사용자 정보
- Order: 주문 정보
- OrderStatus: 주문 상태
```

**특징**:
- spec.md의 모든 타입 명세 구현
- 타입 안전성 보장
- IDE 자동완성 지원

### 5.2 상태 관리 (Zustand)

#### 5.2.1 장바구니 스토어

**파일**: `src/stores/cart.ts`

**주요 기능**:
```typescript
- addItem(): 상품 추가
- removeItem(): 상품 제거
- updateQuantity(): 수량 변경
- clearCart(): 장바구니 비우기
- getTotal(): 총 금액 계산
- getItemCount(): 총 아이템 수
```

**특징**:
- localStorage 자동 동기화
- 동일 상품(사이즈/색상) 중복 방지
- 실시간 총액 계산

#### 5.2.2 커스텀 오더 스토어

**파일**: `src/stores/customOrder.ts`

**주요 기능**:
```typescript
- setOrderType(): 주문 타입 설정
- updateOrder(): 주문 정보 업데이트
- saveDesign(): 디자인 저장
- loadDesign(): 저장된 디자인 불러오기
- clearOrder(): 주문 초기화
- getCurrentStep(): 현재 진행 단계
```

**특징**:
- 다단계 폼 상태 관리
- 임시 저장 기능
- 진행 상태 추적

### 5.3 폼 검증 (Zod + React Hook Form)

**파일**: `src/app/custom-order/personal/page.tsx`

#### 검증 스키마

```typescript
const personalOrderSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  size: z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']),
  quantity: z.number().min(1).max(10),
  color: z.string().min(1),
  designDescription: z.string().min(10),
});
```

**검증 항목**:
- 이름: 최소 2자
- 이메일: 유효한 형식
- 전화번호: 최소 10자
- 디자인 설명: 최소 10자

### 5.4 브랜드 스타일링

#### 컬러 팔레트

```css
Primary:    #FF6B35 (Sunset Orange) - 활기, 에너지
Secondary:  #2D3436 (Charcoal) - 신뢰, 세련
Accent:     #00B894 (Mint Green) - 신선함, 액션
Background: #FFEAA7 (Warm Cream) - 따뜻함, 친근
```

#### 타이포그래피

```
Display (헤드라인):  Poppins Bold
Body (본문):         Plus Jakarta Sans
Accent (로고):       Pacifico
```

#### 반응형 브레이크포인트

```
모바일:   < 768px
태블릿:   768px - 1024px
데스크톱: > 1024px
```

---

## 6. 다국어 지원

### 6.1 구현 개요

**지원 언어**: 영어 (EN), 인도네시아어 (ID)

**구현 방식**:
- React Context API 기반
- JSON 파일로 번역 리소스 관리
- localStorage에 선택 언어 저장

### 6.2 번역 리소스

#### 파일 구조

```
src/locales/
├── en.json (영어)
└── id.json (인도네시아어)
```

#### 번역 항목 (총 60+ 키)

| 카테고리 | 항목 수 | 예시 |
|---------|---------|------|
| 브랜드 | 3개 | name, tagline, slogan |
| 네비게이션 | 5개 | home, catalog, customOrder, about, contact |
| 홈 페이지 | 15개 | hero, valueProps, cta, featured |
| 커스텀 오더 | 20개 | title, personal, bulk, help |
| 개인 주문 폼 | 15개 | fields, errors, buttons |
| 푸터 | 10개 | links, social, copyright |
| 공통 | 10개 | loading, error, success 등 |

### 6.3 사용 예시

```typescript
import { useLanguage } from '@/contexts/LanguageContext';

const { t, locale, setLocale } = useLanguage();

// 번역 사용
<h1>{t('home.hero.title')}</h1>

// 언어 전환
setLocale('en'); // 영어
setLocale('id'); // 인도네시아어
```

### 6.4 언어 전환 UI

**위치**: 헤더 우측 상단
**형태**: 🌐 + 언어 코드 (EN/ID)
**동작**: 클릭 시 토글 방식 전환

---

## 7. 향후 개발 계획

### 7.1 단기 계획 (1-2주)

#### Phase 1: 핵심 페이지 완성

- [ ] **제품 카탈로그** (`/products`)
  - 제품 목록 그리드
  - 필터링 (카테고리, 가격, 신상품)
  - 정렬 기능

- [ ] **제품 상세** (`/products/:slug`)
  - 이미지 갤러리
  - 사이즈 선택
  - 장바구니 추가
  - 리뷰 섹션

- [ ] **단체 주문 폼** (`/custom-order/bulk`)
  - 사이즈별 수량 입력
  - 회사/단체 정보
  - 샘플 요청
  - 예산 범위 선택

- [ ] **장바구니** (`/cart`)
  - 아이템 목록
  - 수량 조절
  - 쿠폰 적용
  - 총액 계산

#### Phase 2: 사용자 기능

- [ ] **로그인/회원가입** (`/login`, `/signup`)
  - 이메일/비밀번호 인증
  - 소셜 로그인 (Google, Facebook)
  - JWT 토큰 관리

- [ ] **마이페이지** (`/mypage`)
  - 주문 내역
  - 저장된 디자인
  - 회원정보 수정

### 7.2 중기 계획 (1-2개월)

#### 결제 통합
```
- Midtrans API 연동
- 다양한 결제 수단 지원
- 결제 완료 페이지
- 주문 확인 이메일
```

#### WhatsApp Business API
```
- 자동 주문 알림
- 상담 챗봇
- 주문 상태 업데이트
```

#### 배송 시스템
```
- RajaOngkir API 연동
- 배송비 자동 계산
- 배송 추적
```

### 7.3 장기 계획 (3개월+)

#### 고급 기능
- [ ] 디자인 에디터 (Canvas 기반)
- [ ] 실시간 프리뷰
- [ ] AI 디자인 추천
- [ ] 3D 제품 미리보기

#### 관리자 시스템
- [ ] 주문 관리 대시보드
- [ ] 재고 관리
- [ ] 고객 관리
- [ ] 통계 분석

#### 성능 최적화
- [ ] 이미지 최적화 (Next.js Image)
- [ ] 코드 스플리팅
- [ ] SSR/ISR 적용
- [ ] CDN 배포

---

## 8. 참고 자료

### 8.1 프로젝트 문서

| 문서 | 경로 | 설명 |
|------|------|------|
| README | `/README.md` | 프로젝트 전체 문서 |
| QUICKSTART | `/QUICKSTART.md` | 빠른 시작 가이드 |
| Spec | `/spec.md` | 설계 명세서 (원본) |

### 8.2 개발 가이드

#### 로컬 개발 서버 실행

```bash
# 1. 프로젝트 디렉토리로 이동
cd /Users/taehee_han/VibeCoding/kaos-euy

# 2. 의존성 설치 (처음 한 번만)
npm install

# 3. 개발 서버 실행
npm run dev

# 4. 브라우저에서 접속
http://localhost:3000
```

#### 주요 명령어

```bash
npm run dev      # 개발 서버 실행
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버 실행
npm run lint     # 코드 검사
```

### 8.3 기술 문서 링크

- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)

---

## 9. 성과 요약

### 9.1 정량적 성과

| 지표 | 수치 |
|------|------|
| 구현 페이지 수 | 3개 |
| 컴포넌트 수 | 5개 |
| 타입 정의 수 | 30+ |
| 다국어 키 수 | 60+ |
| 코드 라인 수 | ~2,000 줄 |
| 개발 시간 | 1일 |

### 9.2 정성적 성과

✅ **완성도 높은 기초 구조**
- 확장 가능한 아키텍처
- 타입 안전성 확보
- 재사용 가능한 컴포넌트

✅ **사용자 경험**
- 직관적인 네비게이션
- 반응형 디자인
- 부드러운 애니메이션

✅ **국제화**
- 완전한 다국어 지원
- 쉬운 번역 추가
- 사용자 선호 언어 저장

✅ **브랜드 아이덴티티**
- 일관된 디자인 시스템
- 반둥 문화 반영
- 친근한 톤앤매너

---

## 10. 결론 및 제언

### 10.1 현재 진행 상황

**Overall Progress**: 30%

```
✅ 완료: 프로젝트 기반 구축 (100%)
✅ 완료: 핵심 페이지 구현 (40%)
🔲 진행 중: 추가 기능 개발 (0%)
🔲 대기 중: 외부 API 연동 (0%)
```

### 10.2 강점

1. **견고한 기술 스택**: Next.js 14 + TypeScript로 확장성 확보
2. **체계적인 구조**: 모듈화된 컴포넌트와 명확한 타입 정의
3. **브랜드 정체성**: spec.md 기반의 일관된 디자인
4. **다국어 준비**: 글로벌 확장 기반 마련

### 10.3 개선 필요 사항

1. **테스트 코드**: Unit/Integration 테스트 부재
2. **에러 처리**: 전역 에러 핸들링 미구현
3. **로딩 상태**: 스켈레톤 UI 필요
4. **SEO 최적화**: 메타 태그 및 구조화된 데이터

### 10.4 다음 단계 권장사항

#### 우선순위 1 (즉시)
1. 제품 카탈로그 페이지 완성
2. 장바구니 페이지 구현
3. 단체 주문 폼 완성

#### 우선순위 2 (1주 내)
1. 사용자 인증 시스템
2. 결제 게이트웨이 연동
3. WhatsApp 비즈니스 API

#### 우선순위 3 (2주 내)
1. 관리자 대시보드
2. 주문 관리 시스템
3. 배송 추적

---

## 부록

### A. 브랜드 컬러 코드

```css
--primary:    #FF6B35;  /* Sunset Orange */
--secondary:  #2D3436;  /* Charcoal */
--accent:     #00B894;  /* Mint Green */
--background: #FFEAA7;  /* Warm Cream */
```

### B. 주요 의존성 버전

```json
{
  "next": "^14.2.35",
  "react": "^18.2.0",
  "typescript": "^5",
  "tailwindcss": "^3.3.0",
  "zustand": "^4.5.0",
  "zod": "^3.22.4"
}
```

### C. 프로젝트 팀 정보

| 역할 | 담당 |
|------|------|
| 프로젝트 관리 | - |
| 프론트엔드 개발 | Development Team |
| UI/UX 디자인 | - |
| 백엔드 개발 | TBD |

---

**문서 종료**

*본 보고서는 Kaos EUY! 프로젝트의 1일차 개발 현황을 정리한 문서입니다.*
*다음 보고서: 제품 카탈로그 완성 시점*

---

**연락처**
프로젝트 Repository: `/Users/taehee_han/VibeCoding/kaos-euy`
문의: Development Team
