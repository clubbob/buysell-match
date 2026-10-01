'use client';

import BuyListPanel from '@/components/ui/BuyListPanel';
import PageIntro from '@/components/ui/PageIntro';
import BuyCreateLink from '@/features/buy/BuyCreateLink';
import { useBuyListings } from '@/features/buy/use-buy-listings';

export default function BuyIndexClient() {
  const { items, ready } = useBuyListings();

  return (
    <div className="space-y-5">
      <PageIntro title="삽니다" description="구매자가 찾는 상품입니다.">
        <BuyCreateLink />
      </PageIntro>
      {ready ? (
        <BuyListPanel
          title="전체"
          description="올라온 구매 글"
          items={items}
          empty="아직 올라온 글이 없습니다."
        />
      ) : (
        <p className="text-sm text-muted">불러오는 중…</p>
      )}
    </div>
  );
}
