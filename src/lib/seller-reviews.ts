import type { SellerReview } from '@/types/review';
import { SAMPLE_SELL_LISTINGS } from '@/lib/sell-samples';

export const SAMPLE_SELLER_REVIEWS: SellerReview[] = [
  {
    id: 'r1',
    sellerId: 'green-living',
    buyerName: '김**',
    rating: 5,
    content: '설명과 같았고, 입금 후 발송도 약속한 날짜에 왔습니다. 다음에도 이 판매자로 참여할 생각입니다.',
    createdAt: '2026-09-12',
    productTitle: '친환경 세제 1L',
  },
  {
    id: 'r2',
    sellerId: 'green-living',
    buyerName: '이**',
    rating: 4,
    content: '물건은 괜찮았습니다. 문의 답이 반나절 정도 늦었지만 수량 정리는 정확했습니다.',
    createdAt: '2026-08-29',
    productTitle: '친환경 세제 1L',
  },
  {
    id: 'r3',
    sellerId: 'han-deul',
    buyerName: '박**',
    rating: 5,
    content: '쌀 상태 좋았습니다. 마감 후 일괄 발송이라고 미리 안내해서 기다리기 수월했습니다.',
    createdAt: '2026-09-03',
    productTitle: '국산 쌀 10kg',
  },
  {
    id: 'r4',
    sellerId: 'cheongsong',
    buyerName: '최**',
    rating: 3,
    content: '사과 맛은 좋았는데 상자마다 크기 편차가 있었습니다. 미리 알려 주셨으면 좋았을 것 같습니다.',
    createdAt: '2026-09-18',
    productTitle: '사과 5kg 상자',
  },
];

export function getSellerReviews(sellerId: string): SellerReview[] {
  return SAMPLE_SELLER_REVIEWS.filter((review) => review.sellerId === sellerId);
}

export function countSellerReviews(sellerId: string): number {
  return getSellerReviews(sellerId).length;
}

export function getSellerName(sellerId: string): string | undefined {
  return SAMPLE_SELL_LISTINGS.find((item) => item.sellerId === sellerId)?.sellerName;
}
