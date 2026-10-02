import type { SellerReview } from '@/types/review';

const STORAGE_KEY = 'buysell.sellerReviews';

function isReview(value: unknown): value is SellerReview {
  if (!value || typeof value !== 'object') return false;
  const item = value as SellerReview;
  return Boolean(item.id && item.sellerId && item.listingId && item.buyerId && item.content);
}

export function loadLocalReviews(filter?: { sellerId?: string; listingId?: string; buyerId?: string }): SellerReview[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    const list = Array.isArray(parsed) ? parsed.filter(isReview) : [];
    return list.filter((item) => {
      if (filter?.sellerId && item.sellerId !== filter.sellerId) return false;
      if (filter?.listingId && item.listingId !== filter.listingId) return false;
      if (filter?.buyerId && item.buyerId !== filter.buyerId) return false;
      return true;
    });
  } catch {
    return [];
  }
}

export function saveLocalReview(review: SellerReview) {
  const next = [review, ...loadLocalReviews().filter((item) => item.id !== review.id)];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}
