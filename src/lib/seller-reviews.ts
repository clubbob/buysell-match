import { fetchSellerReviewsBySeller } from '@/lib/seller-review-remote';
import type { SellerReview } from '@/types/review';

export async function getSellerReviews(sellerId: string): Promise<SellerReview[]> {
  return fetchSellerReviewsBySeller(sellerId);
}

export async function countSellerReviews(sellerId: string): Promise<number> {
  const reviews = await getSellerReviews(sellerId);
  return reviews.length;
}
