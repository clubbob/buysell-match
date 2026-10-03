'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import SellProductCardGrid from '@/components/sell/SellProductCardGrid';
import { useSellListings } from '@/features/sell/use-sell-listings';
import { filterSellListings } from '@/lib/sell-filters';

export default function HomeRecentSell() {
  const { items, ready } = useSellListings();
  const highlights = useMemo(() => filterSellListings(items, { sort: 'newest' }).slice(0, 4), [items]);

  return (
    <section className="panel overflow-hidden">
      <header className="flex items-end justify-between gap-3 border-b border-line px-4 py-3.5 sm:px-6">
        <div>
          <h2 className="text-[15px] font-bold text-ink">새로운 판매 상품</h2>
          <p className="mt-0.5 text-sm text-muted">방금 올라온 판매 상품입니다.</p>
        </div>
        <Link href="/sell" className="shrink-0 text-sm font-semibold text-ink underline-offset-2 hover:underline">
          전체 보기
        </Link>
      </header>
      {!ready ? (
        <p className="px-4 py-10 text-center text-sm text-muted sm:px-6">불러오는 중…</p>
      ) : highlights.length > 0 ? (
        <SellProductCardGrid items={highlights} />
      ) : (
        <p className="px-4 py-10 text-center text-sm text-muted sm:px-6">아직 올라온 판매 상품이 없습니다.</p>
      )}
    </section>
  );
}
