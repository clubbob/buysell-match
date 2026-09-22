import type { SellListing } from '@/types/sell';

const PHOTOS = [
  '/samples/sell-1.jpg',
  '/samples/sell-2.jpg',
  '/samples/sell-3.jpg',
  '/samples/sell-4.jpg',
  '/samples/sell-5.jpg',
  '/samples/sell-6.jpg',
];

function photos(coverIndex: number, extraCount = 3): string[] {
  const extras = Array.from({ length: extraCount }, (_, offset) => PHOTOS[(coverIndex + offset + 1) % PHOTOS.length]);
  return [PHOTOS[coverIndex], ...extras];
}

export const SAMPLE_SELL_LISTINGS: SellListing[] = [
  {
    id: 's1',
    title: '국산 쌀 10kg',
    images: photos(0),
    sellerId: 'han-deul',
    sellerName: '한들농산',
    representativeName: '박한들',
    businessVerified: true,
    sellerPhone: '031-558-1040',
    sellerEmail: 'order@handeul.co.kr',
    regularPrice: 36000,
    salePrice: 28000,
    quantityLabel: '50포',
    remainingLabel: '32포 남음',
    deadline: '2026-09-30',
    description:
      '경기미 10kg입니다. 2026년 햅쌀이며 단위는 포입니다. 최소 참여는 1포이고, 마감 후 일괄 발송합니다. 결제와 배송은 판매자와 직접 진행합니다.',
  },
  {
    id: 's2',
    title: '니트릴 장갑 100매',
    images: photos(1),
    sellerId: 'clean-factory',
    sellerName: '클린팩토리',
    representativeName: '이청결',
    businessVerified: true,
    sellerPhone: '032-710-2288',
    sellerEmail: 'sales@cleanfactory.co.kr',
    regularPrice: 12000,
    salePrice: 8900,
    quantityLabel: '200박스',
    remainingLabel: '148박스 남음',
    deadline: '2026-09-28',
    description:
      '파우더 프리 니트릴 장갑 100매 박스입니다. 식품·청소용으로 쓸 수 있습니다. 박스 단위로 참여하며, 마감 수량에 도달하면 조기 종료됩니다.',
  },
  {
    id: 's3',
    title: '친환경 세제 1L',
    images: photos(2),
    sellerId: 'green-living',
    sellerName: '그린리빙',
    representativeName: '최초록',
    businessVerified: true,
    sellerPhone: '02-3478-0912',
    sellerEmail: 'hello@greenliving.co.kr',
    regularPrice: 9800,
    salePrice: 6400,
    quantityLabel: '120개',
    remainingLabel: '75개 남음',
    deadline: '2026-10-05',
    description:
      '식물성 계면활성제 세제 1L입니다. 주방·세탁 겸용이며 리필 용기를 권합니다. 개 단위로 참여할 수 있습니다.',
  },
  {
    id: 's4',
    title: '면 타월 10장 세트',
    images: photos(3),
    sellerId: 'sowon-textile',
    sellerName: '소원텍스타일',
    representativeName: '정소원',
    businessVerified: true,
    sellerPhone: '053-246-7710',
    sellerEmail: 'contact@sowontex.co.kr',
    regularPrice: 18000,
    salePrice: 12500,
    quantityLabel: '80세트',
    remainingLabel: '51세트 남음',
    deadline: '2026-10-02',
    description:
      '40수 면 타월 10장 세트입니다. 색상은 아이보리이며 세트 단위로만 참여합니다. 샘플 확인이 필요하면 판매자에게 문의하세요.',
  },
  {
    id: 's5',
    title: '사과 5kg 상자',
    images: photos(4),
    sellerId: 'cheongsong',
    sellerName: '청송과원',
    representativeName: '김청송',
    businessVerified: true,
    sellerPhone: '054-873-3301',
    sellerEmail: 'farm@cheongsong.kr',
    regularPrice: 27000,
    salePrice: 19800,
    quantityLabel: '40상자',
    remainingLabel: '18상자 남음',
    deadline: '2026-09-26',
    description:
      '청송 사과 5kg 상자입니다. 흠과를 제외한 중과 기준이며, 수확 직후 발송합니다. 신선 식품이라 수령 후 교환이 어렵습니다.',
  },
  {
    id: 's6',
    title: '복사용지 A4 2,500매',
    images: photos(5),
    sellerId: 'office-on',
    sellerName: '오피스온',
    representativeName: '한문서',
    businessVerified: true,
    sellerPhone: '02-6010-4455',
    sellerEmail: 'biz@officeon.co.kr',
    regularPrice: 28000,
    salePrice: 21000,
    quantityLabel: '60박스',
    remainingLabel: '44박스 남음',
    deadline: '2026-10-08',
    description:
      'A4 80g 복사용지 2,500매 박스입니다. 사무실·학원 공동 구매용이며 박스 단위입니다. 서울·경기 지역 묶음 배송이 가능합니다.',
  },
];

export function getSellListing(id: string): SellListing | undefined {
  return SAMPLE_SELL_LISTINGS.find((item) => item.id === id);
}

export function countSellerListings(sellerId: string): number {
  return SAMPLE_SELL_LISTINGS.filter((item) => item.sellerId === sellerId).length;
}
