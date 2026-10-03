import { getClientAuth } from '@/lib/firebase';
import { readApiJson } from '@/lib/api-json';
import { patchSellJoin, submitSellJoin, submitSellJoinConfirm } from '@/lib/sell-join-api';
import { joinListSummary, normalizeSellJoin, type JoinListSummary, type SellJoin } from '@/types/sell-join';

function finalizeJoins(joins: SellJoin[]): SellJoin[] {
  return joins.map(normalizeSellJoin);
}

async function authHeaders(): Promise<HeadersInit> {
  const token = await getClientAuth()?.currentUser?.getIdToken();
  if (!token) throw new Error('로그인이 필요합니다.');
  return { Authorization: `Bearer ${token}` };
}

export async function fetchSellJoins(listingId: string): Promise<SellJoin[]> {
  const response = await fetch(`/api/sell-joins?listingId=${encodeURIComponent(listingId)}`, { cache: 'no-store' });
  const data = await readApiJson<{ ok?: boolean; items?: SellJoin[]; message?: string }>(
    response,
    '구매 신청 내역을 불러오지 못했습니다.',
  );
  if (!response.ok || !data.ok) {
    throw new Error(data.message ?? '구매 신청 내역을 불러오지 못했습니다.');
  }
  return finalizeJoins(data.items ?? []);
}

export async function fetchSellJoinsByBuyer(_buyerId: string): Promise<SellJoin[]> {
  const response = await fetch('/api/me/sell-joins?scope=buyer', {
    cache: 'no-store',
    headers: await authHeaders(),
  });
  const data = await readApiJson<{ ok?: boolean; items?: SellJoin[]; message?: string }>(
    response,
    '구매 신청 내역을 불러오지 못했습니다.',
  );
  if (!response.ok || !data.ok) {
    throw new Error(data.message ?? '구매 신청 내역을 불러오지 못했습니다.');
  }
  return finalizeJoins(data.items ?? []);
}

export async function fetchSellJoinsBySeller(_sellerId: string): Promise<SellJoin[]> {
  const response = await fetch('/api/me/sell-joins?scope=seller', {
    cache: 'no-store',
    headers: await authHeaders(),
  });
  const data = await readApiJson<{ ok?: boolean; items?: SellJoin[]; message?: string }>(
    response,
    '구매 신청 내역을 불러오지 못했습니다.',
  );
  if (!response.ok || !data.ok) {
    throw new Error(data.message ?? '구매 신청 내역을 불러오지 못했습니다.');
  }
  return finalizeJoins(data.items ?? []);
}

export async function fetchSellJoinsByListings(listingIds: string[]): Promise<Record<string, SellJoin[]>> {
  const unique = [...new Set(listingIds.filter(Boolean))];
  if (unique.length === 0) return {};

  const response = await fetch(`/api/sell-joins?listingIds=${unique.map(encodeURIComponent).join(',')}`, {
    cache: 'no-store',
  });
  const data = await readApiJson<{ ok?: boolean; joinsByListing?: Record<string, SellJoin[]>; message?: string }>(
    response,
    '구매 신청 내역을 불러오지 못했습니다.',
  );
  if (!response.ok || !data.ok || !data.joinsByListing) {
    throw new Error(data.message ?? '구매 신청 내역을 불러오지 못했습니다.');
  }
  return Object.fromEntries(
    Object.entries(data.joinsByListing).map(([id, joins]) => [id, finalizeJoins(joins)]),
  );
}

export async function fetchJoinListSummaries(listingIds: string[]): Promise<Record<string, JoinListSummary>> {
  const joinsByListing = await fetchSellJoinsByListings(listingIds);
  return Object.fromEntries(
    Object.entries(joinsByListing).map(([id, joins]) => [id, joinListSummary(joins)]),
  );
}

export async function createSellJoin(listingId: string, quantity: number): Promise<SellJoin> {
  return submitSellJoin(listingId, quantity);
}

export async function confirmSellJoins(
  listingId: string,
): Promise<{ joins: SellJoin[]; remainingLabel: string }> {
  return submitSellJoinConfirm(listingId);
}

export async function markSellJoinShipped(join: SellJoin, trackingNumber?: string): Promise<SellJoin> {
  return patchSellJoin(join.id, 'markShipped', trackingNumber);
}

export async function markSellJoinPaid(join: SellJoin): Promise<SellJoin> {
  return patchSellJoin(join.id, 'markPaid');
}

export async function markSellJoinPending(join: SellJoin): Promise<SellJoin> {
  return patchSellJoin(join.id, 'markPaymentPending');
}

export async function markSellJoinShippingPending(join: SellJoin): Promise<SellJoin> {
  return patchSellJoin(join.id, 'markShippingPending');
}
