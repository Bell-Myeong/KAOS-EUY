# Frontend Development Specification
# Kaos EUY! - 프론트엔드 개발 명세서

> **프로젝트**: Kaos EUY! - 반둥 프리미엄 티셔츠 커스텀 주문 플랫폼
> **작성일**: 2026-02-04
> **기술 스택**: Next.js 14, TypeScript, TailwindCSS, Zustand, Framer Motion

---

## 📋 목차

1. [개발 환경](#1-개발-환경)
2. [상품 리스트 (Store) 구현](#2-상품-리스트-store-구현)
3. [Hero 섹션 / CTA 구현](#3-hero-섹션--cta-구현)
4. [상세 페이지 UI 구현](#4-상세-페이지-ui-구현)
5. [장바구니 상태 관리](#5-장바구니-상태-관리)
6. [Cart 페이지 (수량/삭제)](#6-cart-페이지-수량삭제)
7. [UI 컴포넌트 라이브러리](#7-ui-컴포넌트-라이브러리)
8. [파일 구조](#8-파일-구조)

---

## 1. 개발 환경

### 1.1 기술 스택
```json
{
  "framework": "Next.js 14 (App Router)",
  "language": "TypeScript",
  "styling": "TailwindCSS",
  "animation": "Framer Motion",
  "state": "Zustand",
  "forms": "React Hook Form + Zod",
  "icons": "Lucide React"
}
```

### 1.2 브랜드 컬러 시스템
```typescript
// tailwind.config.ts에 정의된 컬러
{
  primary: '#FF6B35',    // Sunset Orange - 활기, 에너지
  secondary: '#2D3436',  // Charcoal - 신뢰, 세련
  accent: '#00B894',     // Mint Green - 신선함
  background: '#FFEAA7', // Warm Cream - 따뜻함

  // Neutral Colors
  gray: {
    50: '#F7F7F7',
    100: '#E1E1E1',
    200: '#CFCFCF',
    ...
  }
}
```

### 1.3 타이포그래피
- **Display**: Poppins (헤드라인, 타이틀)
- **Body**: Plus Jakarta Sans (본문, 설명)
- **Accent**: Pacifico (로고, 순다어 문구)

---

## 2. 상품 리스트 (Store) 구현

### 2.1 라우트
```
/products (또는 /store)
```

### 2.2 페이지 구성 요소

#### 2.2.1 상단 필터 섹션
```typescript
interface FilterOptions {
  category: ProductCategory[];  // 'tshirt' | 'hoodie' | 'totebag' | 'other'
  priceRange: {
    min: number;
    max: number;
  };
  colors: ProductColor[];
  sizes: Size[];
  inStock: boolean;
  customizable: boolean;
}
```

**UI 요소**:
- Category Tabs (가로 스크롤 가능)
- Price Range Slider
- Color Filter (색상 칩)
- Size Filter (체크박스)
- "재고 있음만 보기" Toggle
- "커스터마이징 가능" Toggle

#### 2.2.2 정렬 옵션
```typescript
type SortOption =
  | 'popular'      // 인기순
  | 'newest'       // 최신순
  | 'price_asc'    // 낮은 가격순
  | 'price_desc'   // 높은 가격순
  | 'name_asc';    // 이름순
```

#### 2.2.3 상품 그리드
- **레이아웃**:
  - Mobile: 1 column
  - Tablet: 2 columns
  - Desktop: 3-4 columns
- **Grid Gap**: 24px (gap-6)

#### 2.2.4 상품 카드 컴포넌트
```tsx
// src/components/products/ProductCard.tsx
interface ProductCardProps {
  product: Product;
  onQuickAdd?: (product: Product) => void;
  variant?: 'default' | 'compact';
}

// 카드 구성:
// - 이미지 (Hover시 두 번째 이미지 표시)
// - "커스터마이징 가능" 뱃지 (조건부)
// - "품절" 오버레이 (조건부)
// - 상품명
// - 가격 (IDR 표시)
// - 색상 옵션 미리보기 (최대 5개)
// - Quick Add 버튼 (hover시 표시)
```

**카드 Hover 효과**:
- 그림자 증가 (shadow-md → shadow-xl)
- 살짝 위로 이동 (translate-y-0 → -translate-y-1)
- Quick Add 버튼 fade in

#### 2.2.5 페이지네이션
```typescript
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number; // default: 12
}
```

### 2.3 파일 구조
```
src/
├── app/
│   └── products/
│       └── page.tsx                    # 상품 리스트 페이지
├── components/
│   └── products/
│       ├── ProductCard.tsx             # 상품 카드
│       ├── ProductGrid.tsx             # 그리드 레이아웃
│       ├── ProductFilters.tsx          # 필터 UI
│       ├── ProductSort.tsx             # 정렬 드롭다운
│       ├── QuickAddModal.tsx           # Quick Add 모달
│       └── Pagination.tsx              # 페이지네이션
└── lib/
    └── products.ts                     # 상품 데이터 fetch 함수
```

### 2.4 데이터 Fetching
```typescript
// src/lib/products.ts
export async function getProducts(params: {
  category?: ProductCategory;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sort?: SortOption;
  page?: number;
  limit?: number;
}): Promise<{ products: Product[]; total: number }> {
  // TODO: API 연동
  // 현재는 mock data 반환
}
```

### 2.5 반응형 디자인
- **Mobile**: 단일 컬럼, 필터는 모달로
- **Tablet**: 2컬럼, 사이드바 필터
- **Desktop**: 3-4컬럼, 사이드바 필터

---

## 3. Hero 섹션 / CTA 구현

### 3.1 Hero 섹션 (홈페이지 최상단)

#### 3.1.1 레이아웃
```tsx
// src/components/home/HeroSection.tsx
<section className="hero-section">
  <div className="hero-content">
    {/* Left: Text Content */}
    <div className="hero-text">
      <h1>Bandung's Pride, Your Style</h1>
      <h2>EUY! 🎨</h2>
      <p>반둥의 자부심을 담은 프리미엄 커스텀 티셔츠</p>
      <div className="cta-buttons">
        <PrimaryButton />
        <SecondaryButton />
      </div>
    </div>

    {/* Right: Visual */}
    <div className="hero-visual">
      <Image /> {/* 상품 이미지 또는 일러스트 */}
    </div>
  </div>
</section>
```

#### 3.1.2 애니메이션
```typescript
// Framer Motion 애니메이션
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};
```

#### 3.1.3 CTA 버튼
```tsx
// Primary CTA
<Button
  variant="primary"
  size="lg"
  href="/custom-order"
>
  Pesan Custom 👕
</Button>

// Secondary CTA
<Button
  variant="outline"
  size="lg"
  href="/products"
>
  Lihat Katalog 🛍️
</Button>
```

### 3.2 Value Propositions 섹션

```tsx
// src/components/home/ValuePropositions.tsx
interface ValueProp {
  icon: LucideIcon;
  title: string;
  description: string;
}

const valueProps: ValueProp[] = [
  {
    icon: Sparkles,
    title: "100% Custom",
    description: "Desain sesukamu, dari sketch sampai jadi"
  },
  {
    icon: Zap,
    title: "Proses Cepat",
    description: "7-10 hari dari order ke tangan kamu"
  },
  {
    icon: Heart,
    title: "Kualitas Premium",
    description: "Bahan pilihan, sablon/DTF rapi"
  },
  {
    icon: MapPin,
    title: "Local Pride",
    description: "Made in Bandung dengan cinta"
  }
];
```

**레이아웃**:
- Grid: 2x2 (mobile), 4x1 (desktop)
- 아이콘 + 제목 + 설명
- Hover 효과: 배경색 변경

### 3.3 CTA 배너 (페이지 중간)

```tsx
// src/components/common/CTABanner.tsx
<section className="cta-banner bg-gradient-to-r from-primary to-accent">
  <div className="container">
    <h2>Punya Ide Design?</h2>
    <p>Tim designer kami siap bantu wujudkan!</p>
    <Button variant="secondary">
      Mulai Custom Order
    </Button>
  </div>
</section>
```

### 3.4 파일 구조
```
src/components/
├── home/
│   ├── HeroSection.tsx
│   ├── ValuePropositions.tsx
│   ├── FeaturedProducts.tsx
│   └── CTABanner.tsx
```

---

## 4. 상세 페이지 UI 구현

### 4.1 라우트
```
/products/[slug]
```

### 4.2 페이지 레이아웃

```tsx
// src/app/products/[slug]/page.tsx
<main className="product-detail-page">
  {/* Breadcrumb */}
  <Breadcrumb />

  <div className="product-main">
    {/* Left: Image Gallery */}
    <ImageGallery />

    {/* Right: Product Info */}
    <ProductInfo />
  </div>

  {/* Below: Tabs */}
  <ProductTabs />

  {/* Related Products */}
  <RelatedProducts />
</main>
```

### 4.3 이미지 갤러리

```tsx
// src/components/products/ImageGallery.tsx
interface ImageGalleryProps {
  images: string[];
  productName: string;
}

// 기능:
// - 메인 이미지 (크게 표시)
// - 썸네일 리스트 (아래 또는 옆)
// - 클릭시 확대 (Lightbox)
// - 스와이프 가능 (모바일)
```

**레이아웃**:
- Desktop: 메인 이미지 + 세로 썸네일 (좌측)
- Mobile: 메인 이미지 + 가로 스크롤 썸네일 (하단)

### 4.4 상품 정보 섹션

```tsx
// src/components/products/ProductInfo.tsx
<div className="product-info">
  {/* 상품명 */}
  <h1>{product.name}</h1>

  {/* 가격 */}
  <div className="price">
    <span className="currency">IDR</span>
    <span className="amount">{product.price.toLocaleString('id-ID')}</span>
  </div>

  {/* 재고 상태 */}
  <StockBadge inStock={product.in_stock} />

  {/* 짧은 설명 */}
  <p className="description">{product.description}</p>

  {/* 색상 선택 */}
  <ColorSelector colors={product.colors} />

  {/* 사이즈 선택 */}
  <SizeSelector sizes={product.sizes} />

  {/* 수량 선택 */}
  <QuantitySelector />

  {/* 버튼 그룹 */}
  <div className="action-buttons">
    <Button variant="primary" size="lg">
      장바구니 담기
    </Button>
    <Button variant="outline" size="lg">
      바로 구매
    </Button>
  </div>

  {/* 커스터마이징 옵션 */}
  {product.is_customizable && (
    <CustomizeButton href={`/custom-order?base=${product.id}`}>
      이 상품 커스터마이징 →
    </CustomizeButton>
  )}
</div>
```

### 4.5 컬러 선택기

```tsx
// src/components/products/ColorSelector.tsx
interface ColorSelectorProps {
  colors: ProductColor[];
  selected?: ProductColor;
  onChange: (color: ProductColor) => void;
}

// UI:
// - 색상 칩 (원형)
// - 선택된 색상은 체크마크 + 테두리
// - Hover시 색상 이름 툴팁
```

### 4.6 사이즈 선택기

```tsx
// src/components/products/SizeSelector.tsx
interface SizeSelectorProps {
  sizes: Size[];
  selected?: Size;
  onChange: (size: Size) => void;
  disabledSizes?: Size[]; // 품절 사이즈
}

// UI:
// - 버튼 그리드 (S M L XL ...)
// - 선택된 사이즈: 배경색 변경
// - 품절 사이즈: disabled + 줄 긋기
// - "사이즈 가이드" 링크
```

### 4.7 수량 선택기

```tsx
// src/components/products/QuantitySelector.tsx
<div className="quantity-selector">
  <button onClick={decrement}>-</button>
  <input type="number" value={quantity} min={1} max={99} />
  <button onClick={increment}>+</button>
</div>
```

### 4.8 탭 컴포넌트

```tsx
// src/components/products/ProductTabs.tsx
<Tabs defaultValue="description">
  <TabsList>
    <TabsTrigger value="description">상세 설명</TabsTrigger>
    <TabsTrigger value="material">소재 정보</TabsTrigger>
    <TabsTrigger value="size-guide">사이즈 가이드</TabsTrigger>
    <TabsTrigger value="reviews">리뷰</TabsTrigger>
  </TabsList>

  <TabsContent value="description">
    {/* 상세 설명 */}
  </TabsContent>

  <TabsContent value="material">
    {/* 소재 정보 테이블 */}
  </TabsContent>

  <TabsContent value="size-guide">
    {/* 사이즈 차트 */}
  </TabsContent>

  <TabsContent value="reviews">
    {/* 리뷰 리스트 */}
  </TabsContent>
</Tabs>
```

### 4.9 파일 구조

```
src/
├── app/
│   └── products/
│       └── [slug]/
│           └── page.tsx
├── components/
│   └── products/
│       ├── ImageGallery.tsx
│       ├── ProductInfo.tsx
│       ├── ColorSelector.tsx
│       ├── SizeSelector.tsx
│       ├── QuantitySelector.tsx
│       ├── ProductTabs.tsx
│       └── RelatedProducts.tsx
```

---

## 5. 장바구니 상태 관리

### 5.1 현재 상태 (이미 구현됨)

```typescript
// src/stores/cart.ts
interface CartState {
  items: CartItem[];
  addItem: (product: Product, size: Size, color: ProductColor, quantity?: number) => void;
  removeItem: (productId: string, size: Size, color: ProductColor) => void;
  updateQuantity: (productId: string, size: Size, color: ProductColor, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}
```

**✅ 이미 구현된 기능**:
- Zustand persist middleware로 localStorage 저장
- 아이템 추가/제거/수량 변경
- 총 금액/아이템 개수 계산

### 5.2 추가 구현 필요 사항

#### 5.2.1 할인 코드 적용
```typescript
// 확장 필요
interface CartState {
  // ... 기존 필드
  discountCode?: string;
  discountAmount: number;
  applyDiscount: (code: string) => Promise<boolean>;
  removeDiscount: () => void;
  getFinalTotal: () => number; // 할인 적용된 최종 금액
}
```

#### 5.2.2 배송비 계산
```typescript
interface CartState {
  // ... 기존 필드
  shippingMethod?: 'pickup' | 'delivery';
  shippingCost: number;
  setShippingMethod: (method: 'pickup' | 'delivery') => void;
  calculateShipping: (city: string) => Promise<number>;
  getGrandTotal: () => number; // 상품 + 배송비 - 할인
}
```

#### 5.2.3 재고 확인
```typescript
interface CartState {
  // ... 기존 필드
  validateStock: () => Promise<{ valid: boolean; errors: string[] }>;
}
```

### 5.3 장바구니 UI 컴포넌트

```tsx
// src/components/cart/CartIndicator.tsx
// Header에 표시되는 장바구니 아이콘 + 뱃지
<Link href="/cart">
  <ShoppingCart />
  {itemCount > 0 && (
    <span className="cart-badge">{itemCount}</span>
  )}
</Link>
```

```tsx
// src/components/cart/MiniCart.tsx
// Hover시 표시되는 미니 장바구니 (드롭다운)
<Popover>
  <PopoverTrigger>
    <CartIndicator />
  </PopoverTrigger>
  <PopoverContent>
    <div className="mini-cart">
      {items.slice(0, 3).map(item => (
        <MiniCartItem key={item.id} item={item} />
      ))}
      <div className="mini-cart-footer">
        <p>총 {itemCount}개 상품</p>
        <p>IDR {total.toLocaleString()}</p>
        <Button href="/cart">장바구니 보기</Button>
      </div>
    </div>
  </PopoverContent>
</Popover>
```

---

## 6. Cart 페이지 (수량/삭제)

### 6.1 라우트
```
/cart
```

### 6.2 페이지 레이아웃

```tsx
// src/app/cart/page.tsx
<main className="cart-page">
  <div className="container">
    <h1>장바구니</h1>

    {items.length === 0 ? (
      <EmptyCart />
    ) : (
      <div className="cart-content">
        {/* Left: Cart Items */}
        <div className="cart-items">
          <CartItemList />
        </div>

        {/* Right: Order Summary */}
        <div className="order-summary">
          <OrderSummaryCard />
        </div>
      </div>
    )}
  </div>
</main>
```

### 6.3 장바구니 아이템 리스트

```tsx
// src/components/cart/CartItemList.tsx
<div className="cart-item-list">
  {/* 전체 선택 체크박스 */}
  <div className="select-all">
    <Checkbox
      checked={allSelected}
      onChange={toggleSelectAll}
    />
    <span>전체 선택</span>
    <button onClick={deleteSelected}>선택 삭제</button>
  </div>

  {/* 아이템 리스트 */}
  {items.map(item => (
    <CartItem key={item.id} item={item} />
  ))}
</div>
```

### 6.4 장바구니 아이템 카드

```tsx
// src/components/cart/CartItem.tsx
interface CartItemProps {
  item: CartItem;
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
}

<div className="cart-item">
  {/* 체크박스 */}
  <Checkbox
    checked={selected}
    onChange={onSelect}
  />

  {/* 상품 이미지 */}
  <Image
    src={item.product.images[0]}
    alt={item.product.name}
    width={100}
    height={100}
  />

  {/* 상품 정보 */}
  <div className="item-info">
    <h3>{item.product.name}</h3>
    <p>색상: {item.color.name}</p>
    <p>사이즈: {item.size}</p>
  </div>

  {/* 수량 조절 */}
  <QuantitySelector
    value={item.quantity}
    onChange={(qty) => updateQuantity(item.product.id, item.size, item.color, qty)}
    min={1}
    max={99}
  />

  {/* 가격 */}
  <div className="item-price">
    <p className="unit-price">
      IDR {item.product.price.toLocaleString()}
    </p>
    <p className="total-price">
      IDR {(item.product.price * item.quantity).toLocaleString()}
    </p>
  </div>

  {/* 삭제 버튼 */}
  <button
    onClick={() => removeItem(item.product.id, item.size, item.color)}
    className="delete-button"
  >
    <Trash2 />
  </button>
</div>
```

### 6.5 주문 요약 카드

```tsx
// src/components/cart/OrderSummaryCard.tsx
<div className="order-summary-card">
  <h3>주문 요약</h3>

  {/* 상품 금액 */}
  <div className="summary-row">
    <span>상품 금액</span>
    <span>IDR {subtotal.toLocaleString()}</span>
  </div>

  {/* 할인 */}
  {discountAmount > 0 && (
    <div className="summary-row discount">
      <span>할인</span>
      <span>- IDR {discountAmount.toLocaleString()}</span>
    </div>
  )}

  {/* 배송비 */}
  <div className="summary-row">
    <span>배송비</span>
    <span>
      {shippingCost === 0 ? '무료' : `IDR ${shippingCost.toLocaleString()}`}
    </span>
  </div>

  <Separator />

  {/* 총 금액 */}
  <div className="summary-row total">
    <span>총 금액</span>
    <span className="total-amount">
      IDR {grandTotal.toLocaleString()}
    </span>
  </div>

  {/* 할인 코드 입력 */}
  <DiscountCodeInput />

  {/* 결제 버튼 */}
  <Button
    variant="primary"
    size="lg"
    fullWidth
    href="/checkout"
    disabled={items.length === 0}
  >
    결제하기 (IDR {grandTotal.toLocaleString()})
  </Button>

  {/* 쇼핑 계속하기 */}
  <Button
    variant="ghost"
    size="md"
    fullWidth
    href="/products"
  >
    쇼핑 계속하기
  </Button>
</div>
```

### 6.6 할인 코드 입력

```tsx
// src/components/cart/DiscountCodeInput.tsx
<div className="discount-code-input">
  <Input
    placeholder="할인 코드 입력"
    value={code}
    onChange={setCode}
  />
  <Button
    onClick={applyDiscount}
    disabled={!code || isApplying}
  >
    적용
  </Button>
</div>

{/* 적용된 할인 코드 */}
{discountCode && (
  <div className="applied-discount">
    <Tag>{discountCode}</Tag>
    <button onClick={removeDiscount}>
      <X />
    </button>
  </div>
)}
```

### 6.7 빈 장바구니 상태

```tsx
// src/components/cart/EmptyCart.tsx
<div className="empty-cart">
  <ShoppingCart size={64} />
  <h2>장바구니가 비어있습니다</h2>
  <p>마음에 드는 상품을 담아보세요!</p>
  <Button href="/products" variant="primary">
    상품 둘러보기
  </Button>
</div>
```

### 6.8 파일 구조

```
src/
├── app/
│   └── cart/
│       └── page.tsx
├── components/
│   └── cart/
│       ├── CartIndicator.tsx         # Header 아이콘
│       ├── MiniCart.tsx               # Hover 드롭다운
│       ├── CartItemList.tsx           # 아이템 리스트
│       ├── CartItem.tsx               # 개별 아이템 카드
│       ├── OrderSummaryCard.tsx       # 주문 요약
│       ├── DiscountCodeInput.tsx      # 할인 코드
│       └── EmptyCart.tsx              # 빈 장바구니
```

---

## 7. UI 컴포넌트 라이브러리

### 7.1 공통 컴포넌트 (이미 구현됨)

```
src/components/common/
├── Button.tsx                    ✅ 구현됨
└── LanguageSwitcher.tsx          ✅ 구현됨
```

### 7.2 추가 구현 필요 컴포넌트

```tsx
// src/components/common/
├── Input.tsx                     // 텍스트 입력
├── Checkbox.tsx                  // 체크박스
├── Radio.tsx                     // 라디오 버튼
├── Select.tsx                    // 드롭다운
├── Badge.tsx                     // 뱃지 (재고, NEW 등)
├── Tag.tsx                       // 태그 (할인코드 등)
├── Separator.tsx                 // 구분선
├── Skeleton.tsx                  // 로딩 스켈레톤
├── Modal.tsx                     // 모달
├── Drawer.tsx                    // 모바일 드로어
├── Tabs.tsx                      // 탭
├── Popover.tsx                   // 팝오버
├── Toast.tsx                     // 알림 토스트
└── Breadcrumb.tsx                // 경로 표시
```

### 7.3 Button 컴포넌트 확장

```typescript
// src/components/common/Button.tsx 확장
type ButtonVariant =
  | 'primary'      // 주요 액션
  | 'secondary'    // 보조 액션
  | 'outline'      // 테두리만
  | 'ghost'        // 배경 없음
  | 'destructive'; // 삭제 등

type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  href?: string;
  onClick?: () => void;
  children: ReactNode;
}
```

### 7.4 애니메이션 유틸

```typescript
// src/lib/animations.ts
import { Variants } from 'framer-motion';

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 }
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 }
};

export const slideInRight: Variants = {
  initial: { x: '100%' },
  animate: { x: 0 },
  exit: { x: '100%' }
};

export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};
```

---

## 8. 파일 구조

### 8.1 전체 프로젝트 구조

```
kaos-euy/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                ✅ 기존
│   │   ├── page.tsx                  ✅ 기존 (업데이트 필요)
│   │   ├── globals.css               ✅ 기존
│   │   │
│   │   ├── products/                 🆕 새로 생성
│   │   │   ├── page.tsx              # 상품 리스트
│   │   │   └── [slug]/
│   │   │       └── page.tsx          # 상품 상세
│   │   │
│   │   ├── cart/                     🆕 새로 생성
│   │   │   └── page.tsx              # 장바구니
│   │   │
│   │   └── custom-order/             ✅ 기존
│   │       ├── page.tsx
│   │       ├── personal/
│   │       └── bulk/
│   │
│   ├── components/
│   │   ├── common/                   ✅ 기존 + 확장
│   │   │   ├── Button.tsx            ✅ 기존 (확장 필요)
│   │   │   ├── LanguageSwitcher.tsx  ✅ 기존
│   │   │   ├── Input.tsx             🆕
│   │   │   ├── Checkbox.tsx          🆕
│   │   │   ├── Badge.tsx             🆕
│   │   │   ├── Modal.tsx             🆕
│   │   │   └── ...                   🆕
│   │   │
│   │   ├── layout/                   ✅ 기존
│   │   │   ├── Header.tsx            ✅ (CartIndicator 추가 필요)
│   │   │   └── Footer.tsx            ✅
│   │   │
│   │   ├── home/                     🆕 새로 생성
│   │   │   ├── HeroSection.tsx
│   │   │   ├── ValuePropositions.tsx
│   │   │   ├── FeaturedProducts.tsx
│   │   │   └── CTABanner.tsx
│   │   │
│   │   ├── products/                 🆕 새로 생성
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   ├── ProductFilters.tsx
│   │   │   ├── ProductSort.tsx
│   │   │   ├── ImageGallery.tsx
│   │   │   ├── ProductInfo.tsx
│   │   │   ├── ColorSelector.tsx
│   │   │   ├── SizeSelector.tsx
│   │   │   ├── QuantitySelector.tsx
│   │   │   ├── ProductTabs.tsx
│   │   │   └── RelatedProducts.tsx
│   │   │
│   │   └── cart/                     🆕 새로 생성
│   │       ├── CartIndicator.tsx
│   │       ├── MiniCart.tsx
│   │       ├── CartItemList.tsx
│   │       ├── CartItem.tsx
│   │       ├── OrderSummaryCard.tsx
│   │       ├── DiscountCodeInput.tsx
│   │       └── EmptyCart.tsx
│   │
│   ├── stores/                       ✅ 기존 + 확장
│   │   ├── cart.ts                   ✅ (확장 필요)
│   │   └── customOrder.ts            ✅
│   │
│   ├── lib/                          🆕 새로 생성
│   │   ├── products.ts               # 상품 데이터 fetch
│   │   ├── animations.ts             # Framer Motion variants
│   │   └── utils.ts                  # 유틸 함수
│   │
│   ├── types/                        ✅ 기존
│   │   └── index.ts                  ✅ (완성됨)
│   │
│   └── contexts/                     ✅ 기존
│       └── LanguageContext.tsx       ✅
│
├── public/
│   ├── images/
│   │   ├── products/                 🆕 상품 이미지
│   │   ├── hero/                     🆕 Hero 섹션 이미지
│   │   └── logos/                    🆕 로고 파일
│   └── fonts/                        🆕 커스텀 폰트
│
└── ...config files
```

---

## 9. 개발 우선순위

### Phase 1: 기본 UI 구조 (1-2일)
1. ✅ Hero 섹션 구현
2. ✅ Value Propositions 구현
3. ✅ 공통 컴포넌트 확장 (Button, Input 등)

### Phase 2: 상품 페이지 (2-3일)
4. ✅ 상품 리스트 페이지
5. ✅ 상품 카드 컴포넌트
6. ✅ 필터/정렬 기능
7. ✅ 상품 상세 페이지
8. ✅ 이미지 갤러리
9. ✅ 색상/사이즈 선택

### Phase 3: 장바구니 (1-2일)
10. ✅ 장바구니 페이지
11. ✅ 장바구니 아이템 관리 (수량, 삭제)
12. ✅ 주문 요약 카드
13. ✅ Header에 CartIndicator 추가

### Phase 4: 통합 & 최적화 (1일)
14. ✅ 반응형 디자인 점검
15. ✅ 애니메이션 추가
16. ✅ 성능 최적화
17. ✅ 접근성 개선

---

## 10. Mock Data

### 10.1 상품 데이터 (개발용)

```typescript
// src/lib/mock-data.ts
export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Kaos Bandung Pride',
    slug: 'kaos-bandung-pride',
    description: '반둥의 자부심을 담은 클래식 티셔츠',
    price: 150000,
    images: [
      '/images/products/bandung-pride-1.jpg',
      '/images/products/bandung-pride-2.jpg'
    ],
    category: 'tshirt',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { code: '#000000', name: 'Black' },
      { code: '#FFFFFF', name: 'White' },
      { code: '#FF6B35', name: 'Sunset Orange' }
    ],
    in_stock: true,
    is_customizable: true
  },
  // ... 더 많은 상품
];
```

---

## 11. 참고 사항

### 11.1 IDR 금액 포맷팅
```typescript
// src/lib/utils.ts
export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
}

// 사용:
formatIDR(150000) // "Rp 150.000"
```

### 11.2 이미지 최적화
- Next.js Image 컴포넌트 사용
- WebP 포맷 권장
- 반응형 이미지 (srcSet)

### 11.3 SEO
```tsx
// src/app/products/[slug]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const product = await getProduct(params.slug);

  return {
    title: `${product.name} | Kaos EUY!`,
    description: product.description,
    openGraph: {
      images: [product.images[0]]
    }
  };
}
```

### 11.4 접근성
- 키보드 네비게이션 지원
- ARIA 레이블 추가
- 색상 대비 확인 (WCAG AA)
- 스크린 리더 테스트

---

## 12. API 연동 준비

### 12.1 API 엔드포인트 (예정)

```typescript
// 상품
GET    /api/products              # 상품 리스트
GET    /api/products/:slug        # 상품 상세
POST   /api/products              # 상품 생성 (관리자)

// 장바구니
GET    /api/cart                  # 장바구니 조회
POST   /api/cart                  # 아이템 추가
PUT    /api/cart/:id              # 수량 변경
DELETE /api/cart/:id              # 아이템 삭제

// 할인
POST   /api/discount/validate     # 할인 코드 검증

// 배송
POST   /api/shipping/calculate    # 배송비 계산
```

### 12.2 데이터 Fetching 패턴

```typescript
// src/lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function fetchProducts(params?: ProductParams) {
  // 개발 중에는 mock data 반환
  if (process.env.NODE_ENV === 'development') {
    return mockProducts;
  }

  // 프로덕션에서는 실제 API 호출
  const res = await fetch(`${API_BASE}/products`, {
    cache: 'no-store', // 또는 revalidate
  });

  return res.json();
}
```

---

## 13. 체크리스트

### UI 컴포넌트
- [ ] Hero 섹션
- [ ] Value Propositions
- [ ] 상품 카드
- [ ] 상품 그리드
- [ ] 상품 필터
- [ ] 상품 상세 페이지
- [ ] 이미지 갤러리
- [ ] 색상 선택기
- [ ] 사이즈 선택기
- [ ] 수량 선택기
- [ ] 장바구니 페이지
- [ ] 주문 요약 카드
- [ ] CartIndicator (Header)

### 상태 관리
- [x] 장바구니 스토어 (기본 기능)
- [ ] 할인 코드 적용
- [ ] 배송비 계산
- [ ] 재고 검증

### 페이지
- [ ] 홈페이지 (Hero + CTA)
- [ ] 상품 리스트 (/products)
- [ ] 상품 상세 (/products/[slug])
- [ ] 장바구니 (/cart)

### 공통 기능
- [ ] 반응형 디자인
- [ ] 애니메이션
- [ ] 로딩 상태
- [ ] 에러 처리
- [ ] SEO 최적화

---

**작성자**: Claude
**마지막 업데이트**: 2026-02-04
**문의**: 명세서 관련 질문이나 수정 사항이 있으면 알려주세요!
