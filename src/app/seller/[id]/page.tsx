import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PageBack from '@/components/ui/PageBack';
import { countSellerReviews, getSellerName, getSellerReviews } from '@/lib/seller-reviews';
import { getSellListing, SAMPLE_SELL_LISTINGS } from '@/lib/sell-samples';

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
};

export function generateStaticParams() {
  const ids = Array.from(new Set(SAMPLE_SELL_LISTINGS.map((item) => item.sellerId)));
  return ids.map((id) => ({ id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const name = getSellerName(id);
  return { title: name ? `${name} 구매자 후기` : '구매자 후기' };
}

export default async function SellerReviewsPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { from } = await searchParams;
  const sellerName = getSellerName(id);
  if (!sellerName) notFound();

  const reviews = getSellerReviews(id);
  const listing = SAMPLE_SELL_LISTINGS.find((item) => item.sellerId === id);
  const fromProduct = from ? getSellListing(from) : undefined;
  const backHref = fromProduct ? `/sell/${fromProduct.id}` : '/sell';
  const backLabel = fromProduct ? `← ${fromProduct.title}` : '← 이전 목록';

  return (
    <div className="space-y-5">
      <PageBack href={backHref}>{backLabel}</PageBack>

      <section className="panel px-4 py-5 sm:px-6">
        <p className="text-xs font-semibold tracking-wide text-subtle">구매자 후기</p>
        <h1 className="mt-1 text-xl font-bold text-ink">{sellerName}</h1>
        <p className="mt-2 text-sm text-muted">
          {listing?.businessVerified ? '사업자 인증 · ' : null}
          후기 {countSellerReviews(id)}건
        </p>
        {listing ? (
          <p className="mt-2 text-sm text-muted">
            전화 {listing.sellerPhone} · 이메일 {listing.sellerEmail}
          </p>
        ) : null}
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
