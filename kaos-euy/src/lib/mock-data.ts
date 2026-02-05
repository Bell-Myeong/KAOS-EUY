import type { Product } from '@/types';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Kaos Bandung Pride',
    slug: 'kaos-bandung-pride',
    description:
      '반둥의 자부심을 담은 클래식 티셔츠. 프리미엄 코튼 소재로 편안한 착용감을 제공합니다.',
    price: 150000,
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800',
    ],
    category: 'tshirt',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { code: '#000000', name: 'Black' },
      { code: '#FFFFFF', name: 'White' },
      { code: '#FF6B35', name: 'Sunset Orange' },
    ],
    in_stock: true,
    is_customizable: true,
  },
  {
    id: '2',
    name: 'Sundanese Heritage Tee',
    slug: 'sundanese-heritage-tee',
    description:
      '순다어 문구가 새겨진 헤리티지 티셔츠. 전통과 현대의 만남을 경험하세요.',
    price: 175000,
    images: [
      'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800',
      'https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=800',
    ],
    category: 'tshirt',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { code: '#2D3436', name: 'Charcoal' },
      { code: '#00B894', name: 'Mint Green' },
      { code: '#FFEAA7', name: 'Warm Cream' },
    ],
    in_stock: true,
    is_customizable: true,
  },
  {
    id: '3',
    name: 'Premium Hoodie EUY',
    slug: 'premium-hoodie-euy',
    description:
      '프리미엄 후디. 반둥의 밤 날씨에 완벽한 두께와 보온성을 제공합니다.',
    price: 350000,
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800',
    ],
    category: 'hoodie',
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: [
      { code: '#000000', name: 'Black' },
      { code: '#2D3436', name: 'Charcoal' },
      { code: '#FF6B35', name: 'Sunset Orange' },
    ],
    in_stock: true,
    is_customizable: true,
  },
  {
    id: '4',
    name: 'Minimalist Tote Bag',
    slug: 'minimalist-tote-bag',
    description:
      '심플한 디자인의 토트백. 일상 속 편리함과 스타일을 동시에 갖춘 아이템.',
    price: 120000,
    images: [
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800',
      'https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?w=800',
    ],
    category: 'totebag',
    sizes: ['M', 'L'],
    colors: [
      { code: '#FFFFFF', name: 'White' },
      { code: '#000000', name: 'Black' },
      { code: '#FFEAA7', name: 'Warm Cream' },
    ],
    in_stock: true,
    is_customizable: true,
  },
  {
    id: '5',
    name: 'Batik Pattern Tee',
    slug: 'batik-pattern-tee',
    description:
      '바틱 패턴이 어우러진 모던 티셔츠. 인도네시아 전통을 현대적으로 재해석했습니다.',
    price: 185000,
    images: [
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800',
      'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=800',
    ],
    category: 'tshirt',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { code: '#2D3436', name: 'Charcoal' },
      { code: '#00B894', name: 'Mint Green' },
    ],
    in_stock: true,
    is_customizable: false,
  },
  {
    id: '6',
    name: 'Classic V-Neck Tee',
    slug: 'classic-v-neck-tee',
    description: 'V넥 디자인의 클래식 티셔츠. 어떤 스타일에도 잘 어울립니다.',
    price: 145000,
    images: [
      'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800',
      'https://images.unsplash.com/photo-1598032895397-b9372eea3a9b?w=800',
    ],
    category: 'tshirt',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { code: '#FFFFFF', name: 'White' },
      { code: '#000000', name: 'Black' },
      { code: '#2D3436', name: 'Charcoal' },
    ],
    in_stock: false,
    is_customizable: true,
  },
  {
    id: '7',
    name: 'Oversized Crew Neck',
    slug: 'oversized-crew-neck',
    description: '오버사이즈 핏의 크루넥 티셔츠. 트렌디하고 편안한 착용감.',
    price: 165000,
    images: [
      'https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?w=800',
      'https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9d?w=800',
    ],
    category: 'tshirt',
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: [
      { code: '#000000', name: 'Black' },
      { code: '#FFEAA7', name: 'Warm Cream' },
      { code: '#FF6B35', name: 'Sunset Orange' },
    ],
    in_stock: true,
    is_customizable: true,
  },
  {
    id: '8',
    name: 'Zip-Up Hoodie Premium',
    slug: 'zip-up-hoodie-premium',
    description: '집업 디자인의 프리미엄 후디. 레이어링에 완벽한 아이템.',
    price: 380000,
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
      'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800',
    ],
    category: 'hoodie',
    sizes: ['M', 'L', 'XL'],
    colors: [
      { code: '#000000', name: 'Black' },
      { code: '#2D3436', name: 'Charcoal' },
    ],
    in_stock: true,
    is_customizable: false,
  },
];

export function getProducts() {
  return mockProducts;
}

export function getProductBySlug(slug: string) {
  return mockProducts.find((p) => p.slug === slug);
}

export function getProductById(id: string) {
  return mockProducts.find((p) => p.id === id);
}
