import { getClientAuth } from '@/lib/firebase';
import { readApiJson } from '@/lib/api-json';
import type { SellInquiry, SellInquiryDetail } from '@/types/sell-inquiry';

async function authHeaders(json = false): Promise<HeadersInit> {
  const token = await getClientAuth()?.currentUser?.getIdToken();
  if (!token) throw new Error('로그인이 필요합니다.');
  return {
    Authorization: `Bearer ${token}`,
    ...(json ? { 'Content-Type': 'application/json' } : {}),
  };
}

export async function fetchSellInquiries(listingId: string): Promise<SellInquiry[]> {
  const response = await fetch(`/api/sell-inquiries?listingId=${encodeURIComponent(listingId)}`, {
    cache: 'no-store',
  });
  const data = await readApiJson<{ ok?: boolean; items?: SellInquiry[]; message?: string }>(
    response,
    '상품 문의를 불러오지 못했습니다.',
  );
  if (!response.ok || !data.ok) {
    throw new Error(data.message ?? '상품 문의를 불러오지 못했습니다.');
  }
  return data.items ?? [];
}

export async function fetchMySellInquiry(id: string): Promise<SellInquiryDetail> {
  const response = await fetch(`/api/me/sell-inquiries/${encodeURIComponent(id)}`, {
    cache: 'no-store',
    headers: await authHeaders(),
  });
  const data = await readApiJson<{ ok?: boolean; item?: SellInquiryDetail; message?: string }>(
    response,
    '문의를 불러오지 못했습니다.',
  );
  if (!response.ok || !data.ok || !data.item) {
    throw new Error(data.message ?? '문의를 불러오지 못했습니다.');
  }
  return data.item;
}

export async function fetchSellInquiriesByBuyer(_buyerId: string): Promise<SellInquiry[]> {
  const response = await fetch('/api/me/sell-inquiries?scope=buyer', {
    cache: 'no-store',
    headers: await authHeaders(),
  });
  const data = await readApiJson<{ ok?: boolean; items?: SellInquiry[]; message?: string }>(
    response,
    '상품 문의를 불러오지 못했습니다.',
  );
  if (!response.ok || !data.ok) {
    throw new Error(data.message ?? '상품 문의를 불러오지 못했습니다.');
  }
  return data.items ?? [];
}

export async function fetchSellInquiriesBySeller(_sellerId: string): Promise<SellInquiry[]> {
  const response = await fetch('/api/me/sell-inquiries?scope=seller', {
    cache: 'no-store',
    headers: await authHeaders(),
  });
  const data = await readApiJson<{ ok?: boolean; items?: SellInquiry[]; message?: string }>(
    response,
    '상품 문의를 불러오지 못했습니다.',
  );
  if (!response.ok || !data.ok) {
    throw new Error(data.message ?? '상품 문의를 불러오지 못했습니다.');
  }
  return data.items ?? [];
}

export async function createSellInquiry(listingId: string, question: string): Promise<SellInquiry> {
  const response = await fetch('/api/me/sell-inquiries', {
    method: 'POST',
    headers: await authHeaders(true),
    body: JSON.stringify({ listingId, question }),
  });
  const data = await readApiJson<{ ok?: boolean; item?: SellInquiry; message?: string }>(
    response,
    '문의를 등록하지 못했습니다.',
  );
  if (!response.ok || !data.ok || !data.item) {
    throw new Error(data.message ?? '문의를 등록하지 못했습니다.');
  }
  return data.item;
}

export async function answerSellInquiry(inquiry: SellInquiry, answer: string): Promise<SellInquiry> {
  const response = await fetch(`/api/me/sell-inquiries/${inquiry.id}`, {
    method: 'PATCH',
    headers: await authHeaders(true),
    body: JSON.stringify({ answer }),
  });
  const data = await readApiJson<{ ok?: boolean; item?: SellInquiry; message?: string }>(
    response,
    '답변을 등록하지 못했습니다.',
  );
  if (!response.ok || !data.ok || !data.item) {
    throw new Error(data.message ?? '답변을 등록하지 못했습니다.');
  }
  return data.item;
}
