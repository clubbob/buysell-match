'use client';

import BuyListPanel from '@/components/ui/BuyListPanel';
import { useBuyListings } from '@/features/buy/use-buy-listings';

export default function HomeRecentBuy() {
  const { items, ready } = useBuyListings();
  const highlights = items.slice(0, 5);

  if (!ready) {
    return (
      <section className="panel overflow-hidden">
        <header className="border-b border-line px-4 py-3.5 sm:px-6">
          <h2 className="text-[15px] font-bold text-ink">최근 삽니다</h2>
          <p className="mt-0.5 text-sm text-muted">새로 올라온 구매 요청을 먼저 보여 드립니다.</p>
        </header>
        <p className="px-4 py-10 text-center text-sm text-muted sm:px-6">불러오는 중…</p>
      </section>
    );
  }

  return (
    <BuyListPanel
      title="최근 삽니다"
      description="새로 올라온 구매 요청을 먼저 보여 드립니다."
      href="/buy"
      actionLabel="전체 목록"
      items={highlights}
      empty="아직 올라온 삽니다가 없습니다."
    />
  );
}
