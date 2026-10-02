'use client';

import { useEffect, useState } from 'react';
import PageBack from '@/components/ui/PageBack';
import { useSellListings } from '@/features/sell/use-sell-listings';
import { getSellerReviews } from '@/lib/seller-reviews';
import type { SellerReview } from '@/types/review';

export default function SellerReviewsClient({ sellerId, from }: { sellerId: string; from?: string }) {
  const { items, ready } = useSellListings();
  const [reviews, setReviews] = useState<SellerReview[]>([]);
  const [reviewsReady, setReviewsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void getSellerReviews(sellerId)
      .then((next) => {
        if (!cancelled) setReviews(next);
      })
      .finally(() => {
        if (!cancelled) setReviewsReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [sellerId]);

  if (!ready || !reviewsReady) {
    return <p className="text-sm text-muted">불러오는 중…</p>;
  }

  const listing = items.find((item) => item.sellerId === sellerId);
  const fromProduct = from ? items.find((item) => item.id === from) : undefined;
  const backHref = fromProduct ? `/sell/${fromProduct.id}` : '/sell';
  const backLabel = fromProduct ? `← ${fromProduct.title}` : '← 이전 목록';

  if (!listing) {
    return (
      <div className="space-y-5">
        <PageBack href="/sell" />
        <p className="panel px-4 py-10 text-center text-sm text-muted">없는 판매자입니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageBack href={backHref}>{backLabel}</PageBack>

      <section className="panel px-4 py-5 sm:px-6">
        <p className="text-xs font-semibold tracking-wide text-subtle">구매자 후기</p>
        <h1 className="mt-1 text-xl font-bold text-ink">{listing.sellerName}</h1>
        <p className="mt-2 text-sm text-muted">
          {listing.businessVerified ? '사업자 인증 · ' : null}
          후기 {reviews.length}건
        </p>
        <p className="mt-2 text-sm text-muted">
          {listing.sellerMobile ? `핸드폰 ${listing.sellerMobile} · ` : null}
          {listing.sellerPhone ? `사업장 전화 ${listing.sellerPhone} · ` : null}
          이메일 {listing.sellerEmail}
        </p>
      </section>

      {reviews.length > 0 ? (
        <ul className="panel divide-y divide-line overflow-hidden">
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
      ) : (
        <p className="panel px-4 py-10 text-center text-sm text-muted">아직 구매자 후기가 없습니다.</p>
      )}
    </div>
  );
}
