import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PageBack from '@/components/ui/PageBack';
import { getSellerName } from '@/lib/seller-reviews';
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
  return { title: name ? `${name} 사업자 인증` : '사업자 인증' };
}

export default async function SellerVerifyPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { from } = await searchParams;
  const sellerName = getSellerName(id);
  const listing = SAMPLE_SELL_LISTINGS.find((item) => item.sellerId === id);
  if (!sellerName || !listing) notFound();
  if (!listing.businessVerified) notFound();

  const fromProduct = from ? getSellListing(from) : undefined;
  const backHref = fromProduct ? `/sell/${fromProduct.id}` : '/sell';
  const backLabel = fromProduct ? `← ${fromProduct.title}` : '← 이전 목록';

  return (
    <div className="space-y-5">
      <PageBack href={backHref}>{backLabel}</PageBack>

      <section className="panel px-4 py-5 sm:px-6">
        <p className="text-xs font-semibold tracking-wide text-subtle">사업자 인증</p>
        <h1 className="mt-1 text-xl font-bold text-ink">{sellerName}</h1>
        <p className="mt-2 text-sm font-semibold text-ink">사업자 정보를 확인한 판매자입니다.</p>
        <p className="mt-3 text-sm text-muted">전화 {listing.sellerPhone}</p>
        <p className="mt-1 text-sm text-muted">이메일 {listing.sellerEmail}</p>
      </section>

      <p className="text-xs leading-relaxed text-subtle">
        공구매칭은 판매자의 사업자 등록 여부를 확인합니다. 사업자등록번호는 공개하지 않으며, 거래는 판매자와 구매자
        사이에서 이루어집니다.
      </p>
    </div>
  );
}
