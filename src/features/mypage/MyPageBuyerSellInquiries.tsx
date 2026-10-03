'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import MyPageInquirySectionHeader from '@/components/mypage/MyPageInquirySectionHeader';
import { fetchSellInquiriesByBuyer } from '@/lib/sell-inquiry-remote';
import { mypageHref, mypageSellInquiryHref } from '@/lib/mypage-nav';
import { cn } from '@/lib/utils';
import { formatMemberJoinedAt } from '@/types/member';
import { isInquiryAnswered, type SellInquiry } from '@/types/sell-inquiry';
import type { SellListing } from '@/types/sell';

export default function MyPageBuyerSellInquiries({
  buyerId,
  listings,
  embedded = false,
}: {
  buyerId: string;
  listings: SellListing[];
  embedded?: boolean;
}) {
  const [items, setItems] = useState<SellInquiry[]>([]);
  const [ready, setReady] = useState(false);
  const titles = useMemo(() => new Map(listings.map((item) => [item.id, item.title])), [listings]);
  const waiting = items.filter((item) => !isInquiryAnswered(item));

  useEffect(() => {
    let cancelled = false;
    void fetchSellInquiriesByBuyer(buyerId)
      .then((next) => {
        if (!cancelled) setItems(next);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [buyerId]);

  return (
    <section
      className={cn(
        'overflow-hidden border-l-4 border-l-teal-600',
        embedded ? 'border border-line border-l-teal-600 bg-teal-50/40' : 'panel bg-teal-50/40',
      )}
    >
      <MyPageInquirySectionHeader
        title="상품 문의"
        tone="site"
        status={waiting.length > 0 ? `답변 대기 ${waiting.length}건` : null}
        description="구매 신청한 상품에 남긴 문의입니다. 판매자·운영 답변을 확인합니다."
      >
        <Link href={mypageHref('buy')} className="btn-secondary shrink-0">
          문의하기
        </Link>
      </MyPageInquirySectionHeader>

      {!ready ? (
        <p className="px-4 py-6 text-sm text-muted sm:px-5">불러오는 중…</p>
      ) : items.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-muted sm:px-5">
          아직 남긴 문의가 없습니다.
          <span className="mt-1 block text-subtle">
            <Link href={mypageHref('buy')} className="font-semibold text-ink underline-offset-2 hover:underline">
              나의 구매 현황
            </Link>
            에서 문의할 수 있습니다.
          </span>
        </p>
      ) : (
        <ul>
          {items.map((inquiry) => {
            const title = titles.get(inquiry.listingId) || '상품';

            return (
              <li key={inquiry.id} className="border-t border-line">
                <Link
                  href={`${mypageSellInquiryHref(inquiry.id)}?from=mypage`}
                  className="block px-4 py-3 hover:bg-slate-50 sm:px-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="min-w-0 truncate text-sm font-semibold text-ink">{title}</p>
                    <span className="shrink-0 text-xs font-medium text-muted">
                      {isInquiryAnswered(inquiry) ? '답변 완료' : '답변 대기'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-subtle">{formatMemberJoinedAt(inquiry.createdAt) || '—'}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

    </section>
  );
}
