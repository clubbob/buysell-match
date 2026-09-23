import Link from 'next/link';
import SellImageGallery from '@/features/sell/SellImageGallery';
import PageBack from '@/components/ui/PageBack';
import { discountRate, formatDeadline, formatWon } from '@/lib/sell-display';
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

export default function SellDetail({ item }: { item: SellListing }) {
  const rate = discountRate(item.regularPrice, item.salePrice);
  const reviews = getSellerReviews(item.sellerId);

  return (
    <div className="space-y-5">
      <PageBack href="/sell" />

      <article className="panel overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          <div className="w-full border-b border-line lg:w-[22rem] lg:shrink-0 lg:self-stretch lg:border-b-0 lg:border-r">
            <SellImageGallery images={item.images} alt={item.title} />
          </div>

          <div className="min-w-0 flex-1 px-4 py-5 sm:px-6 sm:py-6">
            <h1 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">{item.title}</h1>

            <div className="mt-5 space-y-1">
              <p className="text-sm text-subtle line-through tabular-nums">{formatWon(item.regularPrice)}</p>
              <p className="text-lg font-bold tabular-nums text-ink">
                {formatWon(item.salePrice)}
                {rate > 0 ? <span className="ml-2 text-sm font-medium text-muted">(할인율 {rate}%)</span> : null}
              </p>
            </div>

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
              <Spec label="공동구매 최소 주문">{item.minPurchaseLabel || '—'}</Spec>
              <Spec label="수량">
                {item.quantityLabel}
                <span className="ml-2 text-muted">({item.remainingLabel})</span>
              </Spec>
              <Spec label="마감">{formatDeadline(item.deadline)}</Spec>
            </dl>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-2 border-t border-line px-4 py-4 sm:flex-row sm:px-6">
          <button type="button" className="btn-primary">
            구매 참여
          </button>
          <Link href="/sell" className="btn-secondary">
            목록으로
          </Link>
        </div>
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
