# 🚀 Kaos EUY! - 빠른 시작 가이드

## 1️⃣ 의존성 설치

프로젝트 디렉토리로 이동 후 의존성을 설치합니다:

```bash
cd /Users/taehee_han/VibeCoding/kaos-euy
npm install
```

## 2️⃣ 개발 서버 실행

```bash
npm run dev
```

서버가 시작되면 브라우저에서 열어보세요:
**http://localhost:3000**

## 3️⃣ 주요 페이지 확인

| URL | 페이지 |
|-----|--------|
| http://localhost:3000 | 홈 페이지 |
| http://localhost:3000/custom-order | 커스텀 오더 타입 선택 |
| http://localhost:3000/custom-order/personal | 개인 주문 폼 |

## 4️⃣ 프로젝트 구조

```
kaos-euy/
├── src/
│   ├── app/                    # 페이지 라우트
│   │   ├── page.tsx            # 홈 페이지
│   │   ├── layout.tsx          # 레이아웃
│   │   └── custom-order/       # 커스텀 오더
│   ├── components/             # 재사용 컴포넌트
│   ├── stores/                 # Zustand 스토어
│   └── types/                  # TypeScript 타입
├── package.json
└── README.md
```

## 5️⃣ 주요 기능

✅ **완료된 기능**
- 홈 페이지 (Hero, Value Props)
- 커스텀 오더 타입 선택 페이지
- 개인 주문 폼 (React Hook Form + Zod 검증)
- 장바구니 스토어 (Zustand)
- 반응형 헤더 & 푸터
- 브랜드 컬러 & 타이포그래피

🔨 **개발 예정**
- 제품 카탈로그 페이지
- 단체 주문 폼
- 장바구니 페이지
- 결제 프로세스
- WhatsApp 연동

## 6️⃣ 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React

## 7️⃣ 개발 팁

### 새 페이지 추가
```bash
# src/app/ 아래에 폴더 생성
mkdir -p src/app/about
# page.tsx 파일 추가
touch src/app/about/page.tsx
```

### 스토어 사용
```tsx
import { useCartStore } from '@/stores/cart';

const MyComponent = () => {
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);

  return <div>...</div>;
};
```

### 타입 사용
```tsx
import type { Product, Size } from '@/types';
```

## 8️⃣ 빌드 & 배포

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 실행
npm run start
```

## 9️⃣ 문제 해결

### 포트가 이미 사용 중인 경우
```bash
# 다른 포트로 실행
PORT=3001 npm run dev
```

### 의존성 오류
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

### TypeScript 오류
```bash
# 타입 체크
npm run build
```

---

## 📞 도움이 필요하신가요?

- README.md 파일을 참고하세요
- spec.md 파일에서 전체 설계 문서를 확인하세요
- 타입 정의는 src/types/index.ts를 참고하세요

**Hatur nuhun!** 🙏
