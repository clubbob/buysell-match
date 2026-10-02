'use client';

import { useMemo } from 'react';
import BuyListPanel from '@/components/ui/BuyListPanel';
import BuyListFilters from '@/components/ui/BuyListFilters';
import PageIntro from '@/components/ui/PageIntro';
import BuyCreateLink from '@/features/buy/BuyCreateLink';
import { useBuyListings } from '@/features/buy/use-buy-listings';
import { filterBuyListings } from '@/lib/buy-filters';

export default function BuyIndexClient({ q = '' }: { q?: string }) {
  const { items, ready } = useBuyListings();
  const filtered = useMemo(() => filterBuyListings(items, q), [items, q]);

  return (
    <div className="space-y-5">
      <PageIntro title="삽니다" description="구매자가 찾는 상품입니다.">
        <BuyCreateLink />
      </PageIntro>
      <BuyListFilters q={q} />
      {ready ? (
        <BuyListPanel
          title={q.trim() ? `"${q.trim()}" 검색` : '전체'}
          description={filtered.length > 0 ? `${filtered.length.toLocaleString('ko-KR')}건` : '올라온 구매 글'}
          items={filtered}
          empty="아직 올라온 글이 없습니다."
        />
      ) : (
        <p className="text-sm text-muted">불러오는 중…</p>
      )}
    </div>
  );
}
