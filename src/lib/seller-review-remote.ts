import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { getClientFirestore } from '@/lib/firebase';
import { loadLocalReviews, saveLocalReview } from '@/lib/seller-review-store';
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

function mergeReviews(remote: SellerReview[], local: SellerReview[]): SellerReview[] {
  const map = new Map<string, SellerReview>();
  for (const item of [...local, ...remote]) map.set(item.id, item);
  return [...map.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

async function fetchRemoteReviews(whereField: string, value: string): Promise<SellerReview[]> {
  const db = getClientFirestore();
  if (!db) return [];
  const snapshot = await getDocs(query(collection(db, COLLECTION), where(whereField, '==', value)));
  return snapshot.docs
    .map((entry) => toReview(entry.id, entry.data() as Record<string, unknown>))
    .filter((item): item is SellerReview => Boolean(item));
}

export async function fetchSellerReviewsBySeller(sellerId: string): Promise<SellerReview[]> {
  const local = loadLocalReviews({ sellerId });
  try {
    const remote = await fetchRemoteReviews('sellerId', sellerId);
    return mergeReviews(remote, local);
  } catch {
    return local.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

export async function fetchSellerReviewsByListing(listingId: string): Promise<SellerReview[]> {
  const local = loadLocalReviews({ listingId });
  try {
    const remote = await fetchRemoteReviews('listingId', listingId);
    return mergeReviews(remote, local);
  } catch {
    return local.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

export async function fetchBuyerReviewForListing(buyerId: string, listingId: string): Promise<SellerReview | null> {
  const reviews = loadLocalReviews({ buyerId, listingId });
  if (reviews.length > 0) return reviews[0];
  try {
    const remote = await fetchRemoteReviews('listingId', listingId);
    return remote.find((item) => item.buyerId === buyerId) ?? null;
  } catch {
    return null;
  }
}

export async function createSellerReview(review: SellerReview): Promise<SellerReview> {
  if (!review.content.trim()) throw new Error('후기 내용을 입력해 주세요.');
  if (review.rating < 1 || review.rating > 5) throw new Error('별점은 1~5 사이로 선택해 주세요.');

  const existing = await fetchBuyerReviewForListing(review.buyerId, review.listingId);
  if (existing) throw new Error('이 상품에 대한 후기를 이미 남겼습니다.');

  saveLocalReview(review);
  const db = getClientFirestore();
  if (db) {
    try {
      await setDoc(doc(db, COLLECTION, review.id), review);
    } catch {
      // local copy is enough when rules are missing
    }
  }
  return review;
}
