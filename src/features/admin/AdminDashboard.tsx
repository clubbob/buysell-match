'use client';

import { useCallback, useEffect, useState } from 'react';
import PageIntro from '@/components/ui/PageIntro';
import { AdminDashboardPanel } from '@/features/admin/admin-dashboard-ui';
import { readApiJson } from '@/lib/api-json';
import type { AdminDashboardData } from '@/lib/admin-dashboard';
import {
  buildBuyDashboardTiles,
  buildMemberDashboardTiles,
  buildSellDashboardTiles,
  buildSellInquiryDashboardTiles,
  buildSiteInquiryDashboardTiles,
} from '@/lib/dashboard-stats-tiles';
import { BUYER_DETAIL_LABEL, SELLER_DETAIL_LABEL } from '@/lib/profile-labels';

export default function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [ready, setReady] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setReady(false);
    setPending(true);
    try {
      const response = await fetch('/api/admin/dashboard', { cache: 'no-store' });
      const payload = await readApiJson<{ ok?: boolean; data?: AdminDashboardData; message?: string }>(
        response,
        '대시보드를 불러오지 못했습니다.',
      );
      if (!response.ok || !payload.ok || !payload.data) {
        throw new Error(payload.message ?? '대시보드를 불러오지 못했습니다.');
      }
      setData(payload.data);
      setUpdatedAt(new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setError(null);
    } catch (loadError: unknown) {
      setError(loadError instanceof Error ? loadError.message : '대시보드를 불러오지 못했습니다.');
    } finally {
      setReady(true);
      setPending(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const memberTiles = data ? buildMemberDashboardTiles(data.members.members, data.members.buyers, data.members.sellers) : [];
  const sellTiles = data ? buildSellDashboardTiles(data.sell, true) : buildSellDashboardTiles(null, false);
  const buyTiles = data ? buildBuyDashboardTiles(data.buy, true) : buildBuyDashboardTiles(null, false);
  const siteInquiryTiles = data
    ? buildSiteInquiryDashboardTiles(data.siteInquiry, true)
    : buildSiteInquiryDashboardTiles(null, false);
  const sellInquiryTiles = data
    ? buildSellInquiryDashboardTiles(data.sellInquiry, true)
    : buildSellInquiryDashboardTiles(null, false);

  const sellActionCount =
    data == null ? 0 : data.sell.openJoinCount + data.sell.paymentPendingCount + data.sell.shippingPendingCount;
  const buyActionCount = data == null ? 0 : data.buy.paymentPendingCount + data.buy.shippingPendingCount;
  const inquiryActionCount = data == null ? 0 : data.siteInquiry.waitingCount + data.sellInquiry.waitingCount;

  return (
    <div className="space-y-5">
      <PageIntro title="대시보드" description="서비스 전체 현황입니다.">
        <div className="flex items-center gap-2">
          {updatedAt ? <p className="text-xs tabular-nums text-muted">갱신 {updatedAt}</p> : null}
          <button type="button" className="btn-secondary" disabled={pending} onClick={() => void load(true)}>
            {pending ? '새로고침 중…' : '새로고침'}
          </button>
        </div>
      </PageIntro>

      {error ? (
        <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      {!ready && !data ? (
        <p className="text-sm text-muted">불러오는 중…</p>
      ) : (
        <div className="space-y-4">
          <AdminDashboardPanel
            title="회원 · 프로필"
            tone="profile"
            href="/admin/members"
            groups={[{ title: '회원', tiles: memberTiles, columns: 3, variant: 'product' }]}
            footer={
              <p className="text-[11px] text-subtle">
                {BUYER_DETAIL_LABEL} {data?.members.buyers ?? 0}명 · {SELLER_DETAIL_LABEL} {data?.members.sellers ?? 0}명
              </p>
            }
          />

          <AdminDashboardPanel
            title="판매 현황"
            tone="sell"
            href="/admin/sell"
            badge={sellActionCount > 0 ? `처리 ${sellActionCount}` : null}
            groups={[
              { title: '상품', tiles: sellTiles.product, columns: 3, variant: 'product' },
              { title: '신청 · 확정 · 결제 · 배송', tiles: sellTiles.pipeline, columns: 6, variant: 'pipeline' },
            ]}
          />

          <AdminDashboardPanel
            title="구매 현황"
            tone="buy"
            href="/admin/joins"
            badge={buyActionCount > 0 ? `확인 ${buyActionCount}` : null}
            groups={[
              { title: '신청', tiles: buyTiles.summary, columns: 3, variant: 'product' },
              { title: '신청 · 확정 · 결제 · 배송', tiles: buyTiles.pipeline, columns: 6, variant: 'pipeline' },
            ]}
          />

          <AdminDashboardPanel
            title="문의 현황"
            tone="inquiry"
            href="/admin/inquiries"
            badge={inquiryActionCount > 0 ? `답변 ${inquiryActionCount}` : null}
            groups={[
              { title: '서비스 문의', tiles: siteInquiryTiles.summary, columns: 3, variant: 'product' },
              { title: '서비스 문의 유형', tiles: siteInquiryTiles.detail, columns: 4, variant: 'pipeline' },
              { title: '상품 문의', tiles: sellInquiryTiles.summary, columns: 3, variant: 'product' },
              { title: '상품 문의 상품', tiles: sellInquiryTiles.detail, columns: 3, variant: 'pipeline' },
            ]}
          />
        </div>
      )}
    </div>
  );
}
