'use client';

import { useEffect, useState } from 'react';
import {
  DashboardBlock,
  DashboardSection,
  SELL_INQUIRY_TONE_CLASS,
  SITE_INQUIRY_TONE_CLASS,
  StatGrid,
} from '@/features/mypage/mypage-status-board-ui';
import {
  buildSellInquiryDashboardTiles,
  buildSiteInquiryDashboardTiles,
} from '@/lib/dashboard-stats-tiles';
import {
  computeSellInquiryDashboardStats,
  computeSiteInquiryDashboardStats,
  type SellInquiryDashboardStats,
  type SiteInquiryDashboardStats,
} from '@/lib/inquiry-dashboard-stats';
import { fetchSellInquiriesByBuyer } from '@/lib/sell-inquiry-remote';
import { mypageInquiriesHref } from '@/lib/mypage-nav';
import { fetchMySiteInquiries } from '@/lib/site-inquiry-remote';

export default function MyPageInquiryStatusBoard({
  userId,
  embedded = false,
}: {
  userId: string;
  embedded?: boolean;
}) {
  const [siteStats, setSiteStats] = useState<SiteInquiryDashboardStats | null>(null);
  const [sellStats, setSellStats] = useState<SellInquiryDashboardStats | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    void Promise.all([
      fetchMySiteInquiries().catch(() => []),
      fetchSellInquiriesByBuyer(userId).catch(() => []),
    ])
      .then(([siteItems, sellItems]) => {
        if (cancelled) return;
        setSiteStats(computeSiteInquiryDashboardStats(siteItems));
        setSellStats(computeSellInquiryDashboardStats(sellItems));
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const siteTiles = buildSiteInquiryDashboardTiles(siteStats, ready);
  const sellTiles = buildSellInquiryDashboardTiles(sellStats, ready);
  const actionCount = (siteStats?.waitingCount ?? 0) + (sellStats?.waitingCount ?? 0);

  const content = (
    <div className="space-y-2.5">
      <DashboardBlock title="서비스 문의" href={mypageInquiriesHref('site')} tone="inquiry">
        <div className="space-y-2">
          <StatGrid tiles={siteTiles.summary} columns={3} toneClass={SITE_INQUIRY_TONE_CLASS} />
          <StatGrid tiles={siteTiles.detail} columns={4} toneClass={SITE_INQUIRY_TONE_CLASS} />
        </div>
      </DashboardBlock>
      <DashboardBlock title="상품 문의" href={mypageInquiriesHref('sell')} tone="inquiry">
        <div className="space-y-2">
          <StatGrid tiles={sellTiles.summary} columns={3} toneClass={SELL_INQUIRY_TONE_CLASS} />
          <StatGrid tiles={sellTiles.detail} columns={3} toneClass={SELL_INQUIRY_TONE_CLASS} />
        </div>
      </DashboardBlock>
    </div>
  );

  if (embedded) {
    return (
      <DashboardSection
        title="문의 현황"
        tone="inquiry"
        badge={actionCount > 0 ? `답변 ${actionCount}` : null}
        href={mypageInquiriesHref('all')}
      >
        {content}
      </DashboardSection>
    );
  }

  return content;
}
