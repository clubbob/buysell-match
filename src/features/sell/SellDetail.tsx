'use client';

import Link from 'next/link';
import SellImageGallery from '@/features/sell/SellImageGallery';
import SellJoinSection from '@/features/sell/SellJoinSection';
import PageBack from '@/components/ui/PageBack';
import { useAuth } from '@/features/auth/auth-context';
import { deadlineParts, discountRate, formatQuantityNumber, formatWon, isRemainingShort } from '@/lib/sell-display';
import { countSellerReviews, getSellerReviews } from '@/lib/seller-reviews';
import type { SellListing } from '@/types/sell';

function Spec({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] items-center gap-3 border-b border-line py-3 text-sm">
      <dt className="leading-snug text-subtle">{label}</dt>
      <dd className="flex min-h-[1.75rem] items-center text-ink">{children}</dd>
    </div>
  );
}

export default function SellDetail({ item, onRemainingChange }: { item: SellListing; onRemainingChange?: () => void }) {
  const { user } = useAuth();
  const rate = discountRate(item.regularPrice, item.salePrice);
  const reviews = getSellerReviews(item.sellerId);
  const remainingShort = isRemainingShort(item.minPurchaseLabel, item.remainingLabel);
  const deadline = deadlineParts(item.deadline);
  const canEdit = Boolean(user && user.uid === item.sellerId);

  return (
    <div className="space-y-5">
      <div className="flex justify-end gap-2">
        {canEdit ? (
          <Link href={`/sell/${item.id}/edit`} className="btn-secondary">
            수정
          </Link>
        ) : null}
        <PageBack href="/sell" />
      </div>

      <article className="panel overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          <div className="w-full border-b border-line lg:w-[22rem] lg:shrink-0 lg:self-stretch lg:border-b-0 lg:border-r">
            <SellImageGallery images={item.images} alt={item.title} />
          </div>

          <div className="min-w-0 flex-1 px-4 py-5 sm:px-6 sm:py-6">
            <h1 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">{item.title}</h1>

            <dl className="mt-5">
              <Spec label="판매자">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="whitespace-nowrap font-semibold">{item.sellerName}</span>
                  {item.businessVerified ? (
                    <Link
                      href={`/seller/${item.sellerId}/verify?from=${item.id}`}
                      className="btn-chip"
                    >
                      사업자 인증
                    </Link>
                  ) : (
                    <span className="whitespace-nowrap text-xs text-subtle">인증 대기</span>
                  )}
                  <Link href={`/seller/${item.sellerId}?from=${item.id}`} className="btn-chip">
                    구매자 후기 {countSellerReviews(item.sellerId)}건
                  </Link>
                  <span className="whitespace-nowrap text-muted">전화 {item.sellerPhone}</span>
                  <span className="whitespace-nowrap text-muted">이메일 {item.sellerEmail}</span>
                </div>
              </Spec>
              <Spec label="정상 가격">
                <span className="text-subtle line-through tabular-nums">{formatWon(item.regularPrice)}</span>
              </Spec>
              <Spec label="특판 가격">
                <span>
                  <span className="font-semibold tabular-nums">{formatWon(item.salePrice)}</span>
                  {rate > 0 ? <span className="mt-0.5 block text-xs font-medium text-muted">(할인율 {rate}%)</span> : null}
                </span>
              </Spec>
              <Spec label="공동구매 최소 주문">{formatQuantityNumber(item.minPurchaseLabel)}</Spec>
              <Spec label="잔여 수량">
                <span>
                  <span className="tabular-nums">{formatQuantityNumber(item.remainingLabel)}</span>
                  {remainingShort ? <span className="mt-0.5 block text-xs font-medium text-muted">잔여 부족</span> : null}
                </span>
              </Spec>
              <Spec label="마감">
                <span>
                  <span className="tabular-nums">{deadline.date}</span>
                  <span className="mt-0.5 block text-xs font-medium text-muted">{deadline.note}</span>
                </span>
              </Spec>
            </dl>
          </div>
        </div>

        <SellJoinSection item={item} onRemainingChange={onRemainingChange} />
      </article>

      <section className="panel px-4 py-5 sm:px-6">
        <h2 className="text-sm font-bold text-ink">상품 안내</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">{item.description}</p>
      </section>

      {reviews.length > 0 ? (
        <section className="panel overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-4 sm:px-6">
            <h2 className="text-sm font-bold text-ink">구매자 후기 {reviews.length}건</h2>
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
        </section>
      ) : null}

      <p className="text-xs leading-relaxed text-subtle">
        공구매칭은 통신판매중개자이며 결제·정산·배송의 당사자가 아닙니다. 거래는 판매자와 구매자 사이에서 이루어집니다.
      </p>
    </div>
  );
}
