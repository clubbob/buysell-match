'use client';

import { useEffect, useState } from 'react';
import {
  BUY_TONE_CLASS,
  DashboardBlock,
  DashboardSection,
  StatGrid,
} from '@/features/mypage/mypage-status-board-ui';
import { buildBuyDashboardTiles } from '@/lib/dashboard-stats-tiles';
import { computeBuyDashboardStats, type BuyDashboardStats } from '@/lib/buy-dashboard-stats';
import { fetchSellJoinsByBuyer } from '@/lib/sell-join-remote';
import { mypageHref } from '@/lib/mypage-nav';

export default function MyPageBuyStatusBoard({
  buyerId,
  embedded = false,
}: {
  buyerId: string;
  embedded?: boolean;
}) {
  const [stats, setStats] = useState<BuyDashboardStats | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    void fetchSellJoinsByBuyer(buyerId)
      .then((joins) => {
        if (!cancelled) setStats(computeBuyDashboardStats(joins));
      })
      .catch(() => {
        if (!cancelled) setStats(computeBuyDashboardStats([]));
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [buyerId]);

  const { summary, pipeline } = buildBuyDashboardTiles(stats, ready);
  const actionCount = stats == null ? 0 : stats.paymentPendingCount + stats.shippingPendingCount;

  const content = (
    <div className="space-y-2.5">
      <DashboardBlock title="신청" tone="buy">
        <StatGrid tiles={summary} columns={3} toneClass={BUY_TONE_CLASS} />
      </DashboardBlock>
      <DashboardBlock title="신청 · 확정 · 결제 · 배송" tone="buy">
        <StatGrid tiles={pipeline} columns={6} toneClass={BUY_TONE_CLASS} />
      </DashboardBlock>
    </div>
  );

  if (embedded) {
    return (
      <DashboardSection
        title="구매 현황"
        tone="buy"
        badge={actionCount > 0 ? `확인 ${actionCount}` : null}
        href={mypageHref('buy')}
      >
        {content}
      </DashboardSection>
    );
  }

  return content;
}
