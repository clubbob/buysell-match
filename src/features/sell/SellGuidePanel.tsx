'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import SellInquiryTab from '@/features/sell/SellInquiryTab';
import { guideHasContent, listingGuide } from '@/lib/sell-guide';
import { fetchSellerReviewsByListing } from '@/lib/seller-review-remote';
import { cn } from '@/lib/utils';
import type { SellerReview } from '@/types/review';
import type { SellListing } from '@/types/sell';

type DetailTab = 'guide' | 'reviews' | 'inquiries';

function GuideBlock({ title, text }: { title: string; text: string }) {
  if (!text) return null;
  return (
    <div className="border-t border-line pt-5 first:border-t-0 first:pt-0">
      <h3 className="text-sm font-bold text-ink">{title}</h3>
      <p className="mt-2 whitespace-pre-line text-[15px] leading-7 text-ink">{text}</p>
    </div>
  );
}

export default function SellGuidePanel({
  item,
  readQueryTab = true,
  reviewsKey = 0,
  className,
}: {
  item: SellListing;
  readQueryTab?: boolean;
  reviewsKey?: number;
  className?: string;
}) {
  const [reviews, setReviews] = useState<SellerReview[]>([]);
  const showReviews = reviews.length > 0;

  useEffect(() => {
    let cancelled = false;
    void fetchSellerReviewsByListing(item.id)
      .then((next) => {
        if (!cancelled) setReviews(next);
      })
      .catch(() => {
        if (!cancelled) setReviews([]);
      });
    return () => {
      cancelled = true;
    };
  }, [item.id, reviewsKey]);
  const [tab, setTab] = useState<DetailTab>(() => {
    if (readQueryTab && typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('tab') === 'inquiries') {
      return 'inquiries';
    }
    return 'guide';
  });
  const [inquiryCount, setInquiryCount] = useState(0);
  const guide = listingGuide(item);

  return (
    <section className={cn('overflow-hidden', className ?? 'panel')}>
      <div className="flex border-b border-line">
        <button
          type="button"
          onClick={() => setTab('guide')}
          className={cn(
            'relative min-h-12 flex-1 whitespace-nowrap px-2 text-sm font-semibold sm:px-4',
            tab === 'guide' ? 'text-ink after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:bg-ink sm:after:inset-x-4' : 'text-muted',
          )}
        >
          상품 안내
        </button>
        {showReviews ? (
          <button
            type="button"
            onClick={() => setTab('reviews')}
            className={cn(
              'relative min-h-12 flex-1 whitespace-nowrap px-2 text-sm font-semibold sm:px-4',
              tab === 'reviews' ? 'text-ink after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:bg-ink sm:after:inset-x-4' : 'text-muted',
            )}
          >
            구매자 후기 {reviews.length}
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => setTab('inquiries')}
          className={cn(
            'relative min-h-12 flex-1 whitespace-nowrap px-2 text-sm font-semibold sm:px-4',
            tab === 'inquiries' ? 'text-ink after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:bg-ink sm:after:inset-x-4' : 'text-muted',
          )}
        >
          상품 문의 {inquiryCount}
        </button>
      </div>

      <div hidden={tab !== 'guide'}>
        <div className="px-4 py-6 sm:px-6 sm:py-7">
          {guideHasContent(guide) ? (
            <>
              <div className="space-y-5">
                <GuideBlock title="소개" text={guide.intro} />
                <GuideBlock title="구성·규격" text={guide.spec} />
                <GuideBlock title="결제·배송·교환" text={guide.trade} />
              </div>
              <p className="mt-6 border-t border-line pt-3 text-xs leading-relaxed text-subtle">
                이 안내는 판매자가 작성했습니다. 결제·배송·교환은 판매자 조건을 따릅니다.
              </p>
            </>
          ) : (
            <p className="py-8 text-center text-sm text-muted">아직 상품 안내가 없습니다.</p>
          )}
        </div>
      </div>

      <div hidden={tab !== 'reviews'}>
        {reviews.length > 0 ? (
          <>
            <div className="flex justify-end border-b border-line px-4 py-3 sm:px-6">
              <Link href={`/seller/${item.sellerId}?from=${item.id}`} className="btn-chip">
                전체 보기
              </Link>
            </div>
            <ul className="divide-y divide-line">
              {reviews.map((review) => (
                <li key={review.id} className="px-4 py-4 sm:px-6">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span className="text-sm font-semibold text-ink">{review.buyerName}</span>
                    <span className="text-sm text-ink">별점 {review.rating}/5</span>
                    <span className="text-xs text-subtle">{review.createdAt.replaceAll('-', '/')}</span>
                  </div>
                  <p className="mt-1 text-xs text-subtle">{review.productTitle}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{review.content}</p>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="px-4 py-10 text-center text-sm text-muted sm:px-6">아직 구매자 후기가 없습니다.</p>
        )}
      </div>

      <div hidden={tab !== 'inquiries'}>
        <SellInquiryTab item={item} onCountChange={setInquiryCount} />
      </div>
    </section>
  );
}
