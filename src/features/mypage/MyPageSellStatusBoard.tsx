'use client';

import { useEffect, useState } from 'react';
import {
  DashboardBlock,
  DashboardSection,
  SELL_TONE_CLASS,
  StatGrid,
} from '@/features/mypage/mypage-status-board-ui';
import { buildSellDashboardTiles } from '@/lib/dashboard-stats-tiles';
import { computeSellDashboardStats, type SellDashboardStats } from '@/lib/sell-dashboard-stats';
import { fetchSellJoinsBySeller } from '@/lib/sell-join-remote';
import { mypageHref } from '@/lib/mypage-nav';
import type { SellListing } from '@/types/sell';

export default function MyPageSellStatusBoard({
  sellerId,
  listings,
  listingsReady,
  embedded = false,
}: {
  sellerId: string;
  listings: SellListing[];
  listingsReady: boolean;
  embedded?: boolean;
}) {
  const [stats, setStats] = useState<SellDashboardStats | null>(null);
  const [joinsReady, setJoinsReady] = useState(false);

  const listingsKey = listings.map((item) => item.id).sort().join(',');

  useEffect(() => {
    let cancelled = false;
    setJoinsReady(false);
    void fetchSellJoinsBySeller(sellerId)
      .then((joins) => {
        if (!cancelled) setStats(computeSellDashboardStats(listings, joins));
      })
      .catch(() => {
        if (!cancelled) setStats(computeSellDashboardStats(listings, []));
      })
      .finally(() => {
        if (!cancelled) setJoinsReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [sellerId, listingsKey, listings]);

  const ready = listingsReady && joinsReady;
  const { product, pipeline } = buildSellDashboardTiles(stats, ready);
  const actionCount =
    stats == null ? 0 : stats.openJoinCount + stats.paymentPendingCount + stats.shippingPendingCount;

  const content = (
    <div className="space-y-2.5">
      <DashboardBlock title="상품" tone="sell">
        <StatGrid tiles={product} columns={3} toneClass={SELL_TONE_CLASS} />
      </DashboardBlock>
      <DashboardBlock title="신청 · 확정 · 결제 · 배송" tone="sell">
        <StatGrid tiles={pipeline} columns={6} toneClass={SELL_TONE_CLASS} />
      </DashboardBlock>
    </div>
  );

  if (embedded) {
    return (
      <DashboardSection
        title="판매 현황"
        tone="sell"
        badge={actionCount > 0 ? `처리 ${actionCount}` : null}
        href={mypageHref('sell')}
      >
        {content}
      </DashboardSection>
    );
  }

  return content;
}
