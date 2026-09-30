'use client';

import Link from 'next/link';
import PageIntro from '@/components/ui/PageIntro';
import { useUserMode } from '@/features/mode/mode-context';
import { useSellListings } from '@/features/sell/use-sell-listings';
import { discountRate, formatWon } from '@/lib/sell-display';
import { listingSourceLabel } from '@/lib/sell-source';
import { SITE_NAME, SITE_TAGLINE } from '@/lib/site';
import { sellCoverImage } from '@/types/sell';

export default function SiteHome() {
  const { mode } = useUserMode();
  const { items, ready: listingsReady } = useSellListings();
  const highlights = items.slice(0, 3);

  return (
    <div className="space-y-6">
      <PageIntro title={SITE_NAME} description={`${SITE_NAME}은 ${SITE_TAGLINE}.`} />

      <section className="grid gap-4 sm:grid-cols-2">
        {mode === 'seller' ? (
          <>
            <Link href="/buy" className="panel block px-5 py-6 hover:bg-slate-50">
              <p className="text-xs font-semibold tracking-wide text-subtle">장터</p>
              <h2 className="mt-1 text-xl font-bold text-ink">삽니다</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">구매자가 찾는 상품을 보고 판매에 참여합니다.</p>
            </Link>
            <Link href="/sell" className="panel block px-5 py-6 hover:bg-slate-50">
              <p className="text-xs font-semibold tracking-wide text-subtle">장터</p>
              <h2 className="mt-1 text-xl font-bold text-ink">팝니다</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">판매 상품을 올리거나, 올라온 글을 확인합니다.</p>
            </Link>
          </>
        ) : (
          <>
            <Link href="/sell" className="panel block px-5 py-6 hover:bg-slate-50">
              <p className="text-xs font-semibold tracking-wide text-subtle">장터</p>
              <h2 className="mt-1 text-xl font-bold text-ink">팝니다</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">판매자가 올린 상품을 보고 구매에 참여합니다.</p>
            </Link>
            <Link href="/buy" className="panel block px-5 py-6 hover:bg-slate-50">
              <p className="text-xs font-semibold tracking-wide text-subtle">장터</p>
              <h2 className="mt-1 text-xl font-bold text-ink">삽니다</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">찾는 상품을 올리거나, 올라온 요청을 확인합니다.</p>
            </Link>
          </>
        )}
      </section>

      <section className="panel overflow-hidden">
        <header className="flex items-end justify-between gap-3 border-b border-line px-4 py-3.5 sm:px-6">
          <div>
            <h2 className="text-[15px] font-bold text-ink">최근 등록 팝니다</h2>
            <p className="mt-0.5 text-sm text-muted">새로 올라온 상품을 먼저 보여 드립니다.</p>
          </div>
          <Link href="/sell" className="shrink-0 text-sm font-semibold text-ink underline-offset-2 hover:underline">
            전체 목록
          </Link>
        </header>
        {!listingsReady ? (
          <p className="px-4 py-10 text-center text-sm text-muted sm:px-6">불러오는 중…</p>
        ) : highlights.length > 0 ? (
          <ul className="grid grid-cols-2 gap-px border-t border-line bg-line sm:grid-cols-3 lg:grid-cols-4">
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
          <p className="px-4 py-10 text-center text-sm text-muted sm:px-6">아직 올라온 팝니다가 없습니다.</p>
        )}
      </section>

      <section className="panel px-4 py-5 sm:px-6">
        <h2 className="text-[15px] font-bold text-ink">이용 안내</h2>
        <ol className="mt-3 grid gap-4 text-sm text-muted sm:grid-cols-3">
          <li>
            <span className="font-semibold text-ink">1. 가입·역할</span>
            <p className="mt-1">이메일로 가입합니다. 로그인 후 구매자·판매자 모드를 선택합니다.</p>
          </li>
          <li>
            <span className="font-semibold text-ink">2. 구매 참여</span>
            <p className="mt-1">
              팝니다에서 수량을 접수합니다. 판매 확정 후 입금 기한 안에 입금하면, 판매자가 결제·배송을 확인합니다.
            </p>
          </li>
          <li>
            <span className="font-semibold text-ink">3. 판매 관리</span>
            <p className="mt-1">
              마이페이지에서 판매 확정과 건별 결제·배송을 관리합니다. 결제·정산은 판매자와 구매자가 직접 합니다.
            </p>
          </li>
        </ol>
      </section>
    </div>
  );
}
