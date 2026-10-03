'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useSellListings } from '@/features/sell/use-sell-listings';
import { filterSellListings } from '@/lib/sell-filters';
import { discountRate, formatWon } from '@/lib/sell-display';
import { listingSourceLabel } from '@/lib/sell-source';
import { cn } from '@/lib/utils';
import { sellCoverImage } from '@/types/sell';

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
        <ul
          className={cn(
            'grid gap-px bg-line',
            highlights.length <= 1 && 'grid-cols-1 sm:w-1/2 lg:w-1/4',
            highlights.length === 2 && 'grid-cols-2',
            highlights.length === 3 && 'grid-cols-1 sm:grid-cols-3',
            highlights.length >= 4 && 'grid-cols-2 lg:grid-cols-4',
          )}
        >
          {highlights.map((item) => {
            const cover = sellCoverImage(item);
            const sourceLabel = listingSourceLabel(item);
            const rate = discountRate(item.regularPrice, item.salePrice);
            return (
              <li key={item.id} className="bg-white">
                <Link href={`/sell/${item.id}`} className="block hover:bg-slate-50">
                  {cover ? (
                    <div className="flex h-36 items-center justify-center bg-white p-1 sm:h-40">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={cover} alt="" className="h-full w-full object-contain" />
                    </div>
                  ) : (
                    <div className="flex h-36 items-center justify-center bg-slate-50 text-xs text-subtle sm:h-40">사진 없음</div>
                  )}
                  <div className="border-t border-line px-3 py-2">
                    <p className="line-clamp-2 text-sm font-semibold leading-snug text-ink">{item.title}</p>
                    <p className="mt-1 line-clamp-1 text-xs text-muted">
                      {sourceLabel ? `${item.sellerName} · ${sourceLabel}` : item.sellerName}
                    </p>
                    <p className="mt-1.5 text-sm leading-snug">
                      <span className="text-subtle line-through tabular-nums">{formatWon(item.regularPrice)}</span>
                      <span className="ml-1.5 font-bold tabular-nums text-ink">{formatWon(item.salePrice)}</span>
                      {rate > 0 ? (
                        <span className="ml-1 text-xs font-medium text-muted">(할인율 {rate}%)</span>
                      ) : null}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="px-4 py-10 text-center text-sm text-muted sm:px-6">아직 올라온 판매 상품이 없습니다.</p>
      )}
    </section>
  );
}
