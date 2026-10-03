import { getClientAuth } from '@/lib/firebase';
import { readApiJson } from '@/lib/api-json';
import type { SellJoin } from '@/types/sell-join';

async function authHeaders(): Promise<HeadersInit> {
  const token = await getClientAuth()?.currentUser?.getIdToken();
  if (!token) throw new Error('로그인이 필요합니다.');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

export async function submitSellJoin(listingId: string, quantity: number): Promise<SellJoin> {
  const headers = await authHeaders();
  const response = await fetch('/api/me/sell-joins', {
    method: 'POST',
    headers,
    body: JSON.stringify({ listingId, quantity }),
  });
  const data = await readApiJson<{ ok?: boolean; join?: SellJoin; message?: string }>(
    response,
    '구매 신청에 실패했습니다.',
  );
  if (!response.ok || !data.ok || !data.join) {
    throw new Error(data.message ?? '구매 신청에 실패했습니다.');
  }
  return data.join;
}

export async function submitSellJoinConfirm(
  listingId: string,
): Promise<{ joins: SellJoin[]; remainingLabel: string }> {
  const headers = await authHeaders();
  const response = await fetch('/api/me/sell-joins/confirm', {
    method: 'POST',
    headers,
    body: JSON.stringify({ listingId }),
  });
  const data = await readApiJson<{
    ok?: boolean;
    joins?: SellJoin[];
    remainingLabel?: string;
    message?: string;
  }>(response, '판매 확정에 실패했습니다.');
  if (!response.ok || !data.ok || !data.joins || !data.remainingLabel) {
    throw new Error(data.message ?? '판매 확정에 실패했습니다.');
  }
  return { joins: data.joins, remainingLabel: data.remainingLabel };
}

type JoinAction = 'markPaid' | 'markPaymentPending' | 'markShipped' | 'markShippingPending';

export async function patchSellJoin(
  joinId: string,
  action: JoinAction,
  trackingNumber?: string,
): Promise<SellJoin> {
  const headers = await authHeaders();
  const response = await fetch(`/api/me/sell-joins/${joinId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ action, trackingNumber }),
  });
  const data = await readApiJson<{ ok?: boolean; join?: SellJoin; message?: string }>(
    response,
    '구매 신청 상태를 바꾸지 못했습니다.',
  );
  if (!response.ok || !data.ok || !data.join) {
    throw new Error(data.message ?? '구매 신청 상태를 바꾸지 못했습니다.');
  }
  return data.join;
}
