export const OPEN_JOIN_STATUS_LABEL = '공구 구매 신청';

export type SellJoinStatus = 'open' | 'confirmed';
export type SellJoinPaymentStatus = 'pending' | 'paid';
export type SellJoinShippingStatus = 'pending' | 'shipped';

/** confirmedAt 없는 기존 확정 건에 쓰는 기본 일시 (2026-09-30 19:00 KST) */
export const LEGACY_CONFIRMED_AT = '2026-09-30T19:00:00+09:00';

export function ensureConfirmedAt(join: SellJoin): SellJoin {
  if (join.status === 'confirmed' && !join.confirmedAt?.trim()) {
    return { ...join, confirmedAt: LEGACY_CONFIRMED_AT };
  }
  return join;
}

export function isJoinPaid(join: SellJoin): boolean {
  return join.paymentStatus === 'paid';
}

export function joinPaymentLabel(join: SellJoin): string {
  if (join.status !== 'confirmed') return '';
  return isJoinPaid(join) ? '결제 완료' : '입금 대기';
}

export function isJoinShipped(join: SellJoin): boolean {
  return join.shippingStatus === 'shipped';
}

export function joinShippingLabel(join: SellJoin): string {
  if (join.status !== 'confirmed' || !isJoinPaid(join)) return '';
  return isJoinShipped(join) ? '배송 완료' : '배송 대기';
}

export function joinBuyerStatusLabel(join: SellJoin): string {
  if (join.status === 'open') return OPEN_JOIN_STATUS_LABEL;
  const parts = ['판매 확정', joinPaymentLabel(join), joinShippingLabel(join)].filter(Boolean);
  return parts.join(' · ');
}

export function normalizeSellJoin(join: SellJoin): SellJoin {
  let next = ensureConfirmedAt(join);
  if (next.status === 'confirmed' && !next.paymentStatus) {
    next = { ...next, paymentStatus: 'pending' };
  }
  if (next.status === 'confirmed' && isJoinPaid(next) && !next.shippingStatus) {
    next = { ...next, shippingStatus: 'pending' };
  }
  return next;
}

export type SellJoin = {
  id: string;
  listingId: string;
  sellerId: string;
  buyerId: string;
  buyerEmail: string;
  buyerName?: string;
  buyerAddress: string;
  quantity: number;
  status: SellJoinStatus;
  createdAt: string;
  confirmedAt?: string;
  paymentStatus?: SellJoinPaymentStatus;
  paidAt?: string;
  shippingStatus?: SellJoinShippingStatus;
  shippedAt?: string;
  trackingNumber?: string;
};

export type OpenJoinSummary = {
  quantity: number;
  buyers: number;
};

export type JoinListSummary = {
  open: OpenJoinSummary;
  confirmed: OpenJoinSummary;
};

function statusJoinSummary(joins: SellJoin[], status: SellJoinStatus): OpenJoinSummary {
  const filtered = joins.filter((item) => item.status === status);
  return {
    quantity: filtered.reduce((sum, item) => sum + item.quantity, 0),
    buyers: new Set(filtered.map((item) => item.buyerId)).size,
  };
}

export function openJoinTotal(joins: SellJoin[]): number {
  return openJoinSummary(joins).quantity;
}

export function openJoinSummary(joins: SellJoin[]): OpenJoinSummary {
  return statusJoinSummary(joins, 'open');
}

export function confirmedJoinSummary(joins: SellJoin[]): OpenJoinSummary {
  return statusJoinSummary(joins, 'confirmed');
}

export function joinListSummary(joins: SellJoin[]): JoinListSummary {
  return {
    open: openJoinSummary(joins),
    confirmed: confirmedJoinSummary(joins),
  };
}

export function confirmedBatchAt(joins: SellJoin[]): string | undefined {
  const times = [
    ...new Set(
      joins
        .map((join) => join.confirmedAt?.trim())
        .filter((value): value is string => Boolean(value)),
    ),
  ];
  if (times.length === 0) return undefined;
  return times.sort((a, b) => b.localeCompare(a))[0];
}

export function splitJoinsByStatus(joins: SellJoin[]): { open: SellJoin[]; confirmed: SellJoin[] } {
  const open: SellJoin[] = [];
  const confirmed: SellJoin[] = [];
  for (const join of joins) {
    if (join.status === 'confirmed') confirmed.push(join);
    else open.push(join);
  }
  return { open, confirmed };
}
