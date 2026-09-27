import type { SellerReview } from '@/types/review';

export const SAMPLE_SELLER_REVIEWS: SellerReview[] = [];

export function getSellerReviews(sellerId: string): SellerReview[] {
  return SAMPLE_SELLER_REVIEWS.filter((review) => review.sellerId === sellerId);
}

export function countSellerReviews(sellerId: string): number {
  return getSellerReviews(sellerId).length;
}
