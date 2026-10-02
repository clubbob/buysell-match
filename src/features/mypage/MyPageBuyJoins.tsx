'use client';

import Link from 'next/link';
import { Fragment, useEffect, useMemo, useState } from 'react';
import DepositAccountNotice from '@/components/ui/DepositAccountNotice';
import { sellDetailHref } from '@/lib/mypage-nav';
import { fetchSellJoinsByBuyer } from '@/lib/sell-join-remote';
import { formatCount } from '@/lib/sell-display';
import { cn } from '@/lib/utils';
import { formatMemberDateTime } from '@/types/member';
import { isJoinPaid, isJoinShipped, joinBuyerStatusLabel, type SellJoin } from '@/types/sell-join';
import type { SellListing } from '@/types/sell';

function sectionClass(embedded: boolean) {
  return cn('overflow-hidden', embedded ? 'border border-line bg-white' : 'panel');
}

export default function MyPageBuyJoins({
  buyerId,
  listings,
  embedded = false,
}: {
  buyerId: string;
  listings: SellListing[];
  embedded?: boolean;
}) {
  const [items, setItems] = useState<SellJoin[]>([]);
  const [ready, setReady] = useState(false);
  const listingMap = useMemo(() => new Map(listings.map((item) => [item.id, item])), [listings]);

  useEffect(() => {
    let cancelled = false;
    void fetchSellJoinsByBuyer(buyerId)
      .then((next) => {
        if (!cancelled) setItems(next);
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [buyerId]);

  if (!ready) {
    return (
      <section className={cn(sectionClass(embedded), 'px-4 py-5 sm:px-5')}>
        <h2 className="text-sm font-bold text-ink">내 공구 구매 신청</h2>
        <p className="mt-4 text-sm text-muted">불러오는 중…</p>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className={sectionClass(embedded)}>
        <div className="px-4 py-4 sm:px-5">
          <h2 className="text-sm font-bold text-ink">내 공구 구매 신청</h2>
          <p className="mt-1 text-sm text-muted">팝니다 상품에 남긴 공구 구매 신청을 확인합니다.</p>
        </div>
        <p className="border-t border-line px-4 py-8 text-center text-sm text-muted sm:px-5">
          아직 공구 구매 신청이 없습니다.
          <span className="mt-1 block text-subtle">
            <Link href="/sell" className="font-semibold text-ink underline-offset-2 hover:underline">
              팝니다
            </Link>
            에서 상품을 찾아 보세요.
          </span>
        </p>
      </section>
    );
  }

  return (
    <section className={sectionClass(embedded)}>
      <div className="border-b border-line px-4 py-3 sm:px-5">
        <h2 className="text-sm font-bold text-ink">내 공구 구매 신청</h2>
        <p className="mt-0.5 text-xs text-muted">공구 구매 신청·판매 확정·결제·배송 상태를 확인합니다.</p>
      </div>
      <div className="overflow-x-auto border-t border-line">
        <table className="min-w-[32rem] w-full table-fixed">
          <colgroup>
            <col className="w-[38%]" />
            <col className="w-[12%]" />
            <col className="w-[24%]" />
            <col className="w-[26%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-line bg-slate-50 text-left text-[11px] font-semibold tracking-wide text-subtle">
              <th className="px-4 py-2">상품</th>
              <th className="px-3 py-2">수량</th>
              <th className="px-3 py-2">신청일</th>
              <th className="px-3 py-2">상태</th>
            </tr>
          </thead>
          <tbody>
            {items.map((join) => {
              const listing = listingMap.get(join.listingId);
              const title = listing?.title || '상품';
              const showDeposit = join.status === 'confirmed' && !isJoinPaid(join) && listing;
              const showTracking = isJoinShipped(join) && join.trackingNumber?.trim();
              const showExtra = showDeposit || showTracking;

              return (
                <Fragment key={join.id}>
                  <tr className="border-t border-line align-middle">
                    <td className="px-4 py-2.5">
                      <Link
                        href={sellDetailHref(join.listingId, { from: 'mypage', mypageTab: 'buy' })}
                        className="block truncate text-sm font-semibold text-ink hover:underline"
                      >
                        {title}
                      </Link>
                    </td>
                    <td className="px-3 py-2.5 text-sm tabular-nums text-ink">{formatCount(join.quantity)}</td>
                    <td className="px-3 py-2.5 text-xs tabular-nums text-subtle">
                      {formatMemberDateTime(join.createdAt) || '—'}
                    </td>
                    <td className="px-3 py-2.5 text-xs font-medium text-muted">{joinBuyerStatusLabel(join)}</td>
                  </tr>
                  {showExtra ? (
                    <tr className="border-t border-line bg-slate-50/60">
                      <td colSpan={4} className="px-4 py-2.5 sm:px-5">
                        {showDeposit ? (
                          <DepositAccountNotice item={listing} confirmedAt={join.confirmedAt} />
                        ) : null}
                        {showTracking ? (
                          <p className={`text-[11px] text-muted ${showDeposit ? 'mt-2' : ''}`}>
                            송장 {join.trackingNumber?.trim()}
                          </p>
                        ) : null}
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
