import { listingProgressStatus } from '@/lib/sell-display';
import { isJoinPaid, isJoinShipped, normalizeSellJoin, type SellJoin } from '@/types/sell-join';
import type { SellListing } from '@/types/sell';

export type SellDashboardStats = {
  listingCount: number;
  recruitingCount: number;
  closedCount: number;
  openJoinCount: number;
  openBuyerCount: number;
  confirmedJoinCount: number;
  paymentPendingCount: number;
  paymentDoneCount: number;
  shippingPendingCount: number;
  shippingDoneCount: number;
};

export function computeSellDashboardStats(listings: SellListing[], joins: SellJoin[]): SellDashboardStats {
  const normalized = joins.map(normalizeSellJoin);
  let recruitingCount = 0;
  let closedCount = 0;

  for (const item of listings) {
    const status = listingProgressStatus(item);
    if (status === 'recruiting') recruitingCount += 1;
    else closedCount += 1;
  }

  const open = normalized.filter((join) => join.status === 'open');
  const confirmed = normalized.filter((join) => join.status === 'confirmed');

  return {
    listingCount: listings.length,
    recruitingCount,
    closedCount,
    openJoinCount: open.length,
    openBuyerCount: new Set(open.map((join) => join.buyerId)).size,
    confirmedJoinCount: confirmed.length,
    paymentPendingCount: confirmed.filter((join) => !isJoinPaid(join)).length,
    paymentDoneCount: confirmed.filter((join) => isJoinPaid(join)).length,
    shippingPendingCount: confirmed.filter((join) => isJoinPaid(join) && !isJoinShipped(join)).length,
    shippingDoneCount: confirmed.filter((join) => isJoinPaid(join) && isJoinShipped(join)).length,
  };
}
