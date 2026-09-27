import { getClientAuth } from '@/lib/firebase';
import { hasBuyerProfile, type BuyerProfile } from '@/types/buyer';

async function authHeaders(): Promise<HeadersInit> {
  const token = await getClientAuth()?.currentUser?.getIdToken();
  if (!token) throw new Error('로그인 후 등록할 수 있습니다.');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

export async function fetchBuyerProfile(buyerId: string): Promise<BuyerProfile | null> {
  const headers = await authHeaders();
  const response = await fetch('/api/me/buyer', { headers });
  const data = (await response.json()) as { ok?: boolean; profile?: BuyerProfile | null; message?: string };
  if (!response.ok || !data.ok) {
    throw new Error(data.message ?? '구매자 정보를 불러오지 못했습니다.');
  }
  const profile = data.profile ?? null;
  if (profile && profile.buyerId !== buyerId) return null;
  return profile;
}

export async function saveBuyerProfile(profile: BuyerProfile): Promise<BuyerProfile> {
  if (!hasBuyerProfile(profile)) throw new Error('구매자 정보를 모두 입력해 주세요.');
  const headers = await authHeaders();
  const response = await fetch('/api/me/buyer', {
    method: 'PUT',
    headers,
    body: JSON.stringify(profile),
  });
  const data = (await response.json()) as { ok?: boolean; profile?: BuyerProfile; message?: string };
  if (!response.ok || !data.ok || !data.profile) {
    throw new Error(data.message ?? '구매자 정보를 저장하지 못했습니다.');
  }
  return data.profile;
}
