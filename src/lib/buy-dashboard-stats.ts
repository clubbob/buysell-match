import { isJoinPaid, isJoinShipped, normalizeSellJoin, type SellJoin } from '@/types/sell-join';

export type BuyDashboardStats = {
  totalJoinCount: number;
  uniqueListingCount: number;
  totalQuantity: number;
  openJoinCount: number;
  confirmedJoinCount: number;
  paymentPendingCount: number;
  paymentDoneCount: number;
  shippingPendingCount: number;
  shippingDoneCount: number;
};

export function computeBuyDashboardStats(joins: SellJoin[]): BuyDashboardStats {
  const normalized = joins.map(normalizeSellJoin);
  const confirmed = normalized.filter((join) => join.status === 'confirmed');

  return {
    totalJoinCount: normalized.length,
    uniqueListingCount: new Set(normalized.map((join) => join.listingId)).size,
    totalQuantity: normalized.reduce((sum, join) => sum + join.quantity, 0),
    openJoinCount: normalized.filter((join) => join.status === 'open').length,
    confirmedJoinCount: confirmed.length,
    paymentPendingCount: confirmed.filter((join) => !isJoinPaid(join)).length,
    paymentDoneCount: confirmed.filter((join) => isJoinPaid(join)).length,
    shippingPendingCount: confirmed.filter((join) => isJoinPaid(join) && !isJoinShipped(join)).length,
    shippingDoneCount: confirmed.filter((join) => isJoinPaid(join) && isJoinShipped(join)).length,
  };
}
