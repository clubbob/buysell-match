import { getClientAuth } from '@/lib/firebase';
import { readApiJson } from '@/lib/api-json';
import type { SellerReview } from '@/types/review';

async function authHeaders(json = false): Promise<HeadersInit> {
  const token = await getClientAuth()?.currentUser?.getIdToken();
  if (!token) throw new Error('로그인이 필요합니다.');
  return {
    Authorization: `Bearer ${token}`,
    ...(json ? { 'Content-Type': 'application/json' } : {}),
  };
}

export async function fetchSellerReviewsBySeller(sellerId: string): Promise<SellerReview[]> {
  const response = await fetch(`/api/seller-reviews?sellerId=${encodeURIComponent(sellerId)}`, {
    cache: 'no-store',
  });
  const data = await readApiJson<{ ok?: boolean; items?: SellerReview[]; message?: string }>(
    response,
    '후기를 불러오지 못했습니다.',
  );
  if (!response.ok || !data.ok) {
    throw new Error(data.message ?? '후기를 불러오지 못했습니다.');
  }
  return data.items ?? [];
}

export async function fetchSellerReviewsByListing(listingId: string): Promise<SellerReview[]> {
  const response = await fetch(`/api/seller-reviews?listingId=${encodeURIComponent(listingId)}`, {
    cache: 'no-store',
  });
  const data = await readApiJson<{ ok?: boolean; items?: SellerReview[]; message?: string }>(
    response,
    '후기를 불러오지 못했습니다.',
  );
  if (!response.ok || !data.ok) {
    throw new Error(data.message ?? '후기를 불러오지 못했습니다.');
  }
  return data.items ?? [];
}

export async function fetchBuyerReviewForListing(buyerId: string, listingId: string): Promise<SellerReview | null> {
  const reviews = await fetchSellerReviewsByListing(listingId);
  return reviews.find((item) => item.buyerId === buyerId) ?? null;
}

export async function createSellerReview(input: {
  listingId: string;
  rating: number;
  content: string;
}): Promise<SellerReview> {
  const response = await fetch('/api/me/seller-reviews', {
    method: 'POST',
    headers: await authHeaders(true),
    body: JSON.stringify(input),
  });
  const data = await readApiJson<{ ok?: boolean; item?: SellerReview; message?: string }>(
    response,
    '후기를 등록하지 못했습니다.',
  );
  if (!response.ok || !data.ok || !data.item) {
    throw new Error(data.message ?? '후기를 등록하지 못했습니다.');
  }
  return data.item;
}
