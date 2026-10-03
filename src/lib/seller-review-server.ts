import { loadAdminSellListing } from '@/lib/admin-listings-data';
import { getAuthUser, hasFirebaseAdminConfig, queryDocuments, setDocument } from '@/lib/firebase-rest-admin';
import { loadJoinsForListing } from '@/lib/sell-join-server';
import { isJoinPaid, isJoinShipped } from '@/types/sell-join';
import type { SellerReview } from '@/types/review';

const COLLECTION = 'sellerReviews';

function toReview(id: string, data: Record<string, unknown>): SellerReview | null {
  if (!data.sellerId || !data.listingId || !data.buyerId || !data.content) return null;
  const rating = Number(data.rating);
  return {
    id,
    sellerId: String(data.sellerId),
    listingId: String(data.listingId),
    buyerId: String(data.buyerId),
    buyerName: String(data.buyerName ?? ''),
    rating: rating >= 1 && rating <= 5 ? rating : 5,
    content: String(data.content),
    createdAt: String(data.createdAt ?? ''),
    productTitle: String(data.productTitle ?? ''),
  };
}

async function loadReviews(whereField: string, value: string): Promise<SellerReview[]> {
  const docs = await queryDocuments(COLLECTION, whereField, value);
  return docs
    .map((entry) => toReview(entry.id, entry.data))
    .filter((item): item is SellerReview => Boolean(item))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function loadReviewsForListing(listingId: string): Promise<SellerReview[]> {
  if (!hasFirebaseAdminConfig()) return [];
  return loadReviews('listingId', listingId);
}

export async function loadReviewsForSeller(sellerId: string): Promise<SellerReview[]> {
  if (!hasFirebaseAdminConfig()) return [];
  return loadReviews('sellerId', sellerId);
}

export async function createSellerReviewForUser(
  buyerId: string,
  input: { listingId: string; rating: number; content: string },
): Promise<SellerReview> {
  if (!hasFirebaseAdminConfig()) {
    throw new Error('저장소를 연결하지 못했습니다.');
  }

  const listingId = input.listingId.trim();
  const content = input.content.trim();
  const rating = Number(input.rating);
  if (!listingId) throw new Error('상품을 확인해 주세요.');
  if (!content) throw new Error('후기 내용을 입력해 주세요.');
  if (rating < 1 || rating > 5) throw new Error('별점은 1~5 사이로 선택해 주세요.');

  const listing = await loadAdminSellListing(listingId);
  if (!listing) throw new Error('없는 상품입니다.');

  const joins = await loadJoinsForListing(listingId);
  const eligible = joins.find(
    (entry) =>
      entry.buyerId === buyerId &&
      entry.status === 'confirmed' &&
      isJoinPaid(entry) &&
      isJoinShipped(entry),
  );
  if (!eligible) throw new Error('배송 완료된 구매에만 후기를 남길 수 있습니다.');

  const existing = (await loadReviewsForListing(listingId)).find((item) => item.buyerId === buyerId);
  if (existing) throw new Error('이 상품에 대한 후기를 이미 남겼습니다.');

  const authUser = await getAuthUser(buyerId);
  const review: SellerReview = {
    id: `r-${crypto.randomUUID()}`,
    sellerId: listing.sellerId,
    listingId,
    buyerId,
    buyerName: authUser?.displayName?.trim() || '구매자',
    rating,
    content,
    createdAt: new Date().toISOString(),
    productTitle: listing.title,
  };

  await setDocument(COLLECTION, review.id, review);
  return review;
}
