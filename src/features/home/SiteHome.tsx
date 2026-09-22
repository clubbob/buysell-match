'use client';

import Link from 'next/link';
import PageIntro from '@/components/ui/PageIntro';
import { formatWon } from '@/lib/sell-display';
import { SAMPLE_SELL_LISTINGS } from '@/lib/sell-samples';
import { SITE_NAME, SITE_TAGLINE } from '@/lib/site';
import { sellCoverImage } from '@/types/sell';

export default function SiteHome() {
  const highlights = SAMPLE_SELL_LISTINGS.slice(0, 3);

  return (
    <div className="space-y-6">
      <PageIntro title="메인" description={`${SITE_NAME}은 ${SITE_TAGLINE}.`} />

      <section className="grid gap-4 sm:grid-cols-2">
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
      </section>

      <section className="panel overflow-hidden">
        <header className="flex items-end justify-between gap-3 border-b border-line px-4 py-3.5 sm:px-6">
          <div>
            <h2 className="text-[15px] font-bold text-ink">지금 올라온 팝니다</h2>
            <p className="mt-0.5 text-sm text-muted">목록 전체가 아니라 일부만 보여 줍니다.</p>
          </div>
          <Link href="/sell" className="shrink-0 text-sm font-semibold text-ink underline-offset-2 hover:underline">
            팝니다 목록
          </Link>
        </header>
        <ul className="grid sm:grid-cols-3">
          {highlights.map((item) => {
            const cover = sellCoverImage(item);
            return (
              <li key={item.id} className="border-t border-line sm:border-t-0 sm:border-r sm:last:border-r-0">
                <Link href={`/sell/${item.id}`} className="block hover:bg-slate-50">
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cover} alt="" className="aspect-[4/3] w-full object-cover" />
                  ) : (
                    <div className="flex aspect-[4/3] items-center justify-center bg-slate-50 text-xs text-subtle">사진 없음</div>
                  )}
                  <div className="px-4 py-3">
                    <p className="text-sm font-semibold text-ink">{item.title}</p>
                    <p className="mt-1 text-sm text-muted">{item.sellerName}</p>
                    <p className="mt-1 text-sm font-bold tabular-nums text-ink">{formatWon(item.salePrice)}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="panel px-4 py-5 sm:px-6">
        <h2 className="text-sm font-bold text-ink">이용 순서</h2>
        <ol className="mt-3 grid gap-3 text-sm text-muted sm:grid-cols-3">
          <li>
            <span className="font-semibold text-ink">1. 가입</span>
            <p className="mt-1">이메일과 비밀번호로 등록합니다.</p>
          </li>
          <li>
            <span className="font-semibold text-ink">2. 역할</span>
            <p className="mt-1">로그인 후 구매자 또는 판매자 역할을 선택 후 이용합니다.</p>
          </li>
          <li>
            <span className="font-semibold text-ink">3. 거래</span>
            <p className="mt-1">팝니다 또는 삽니다를 이용하고, 결제·정산은 당사자끼리 합니다.</p>
          </li>
        </ol>
      </section>
    </div>
  );
}
