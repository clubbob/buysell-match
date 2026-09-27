'use client';

import PageBack from '@/components/ui/PageBack';
import { useSellListings } from '@/features/sell/use-sell-listings';

export default function SellerVerifyClient({ sellerId, from }: { sellerId: string; from?: string }) {
  const { items, ready } = useSellListings();

  if (!ready) {
    return <p className="text-sm text-muted">불러오는 중…</p>;
  }

  const listing = items.find((item) => item.sellerId === sellerId);
  const fromProduct = from ? items.find((item) => item.id === from) : undefined;
  const backHref = fromProduct ? `/sell/${fromProduct.id}` : '/sell';
  const backLabel = fromProduct ? `← ${fromProduct.title}` : '← 이전 목록';

  if (!listing || !listing.businessVerified) {
    return (
      <div className="space-y-5">
        <PageBack href={backHref}>{backLabel}</PageBack>
        <p className="panel px-4 py-10 text-center text-sm text-muted">확인할 사업자 인증이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageBack href={backHref}>{backLabel}</PageBack>

      <section className="panel px-4 py-5 sm:px-6">
        <p className="text-xs font-semibold tracking-wide text-subtle">사업자 인증</p>
        <h1 className="mt-1 text-xl font-bold text-ink">{listing.sellerName}</h1>
        <p className="mt-2 text-sm font-semibold text-ink">사업자 정보를 확인한 판매자입니다.</p>
        {listing.sellerMobile ? <p className="mt-3 text-sm text-muted">핸드폰 {listing.sellerMobile}</p> : null}
        {listing.sellerPhone ? (
          <p className={`text-sm text-muted ${listing.sellerMobile ? 'mt-1' : 'mt-3'}`}>사업장 전화 {listing.sellerPhone}</p>
        ) : null}
        <p className="mt-1 text-sm text-muted">이메일 {listing.sellerEmail}</p>
      </section>

      <p className="text-xs leading-relaxed text-subtle">
        공구매칭은 판매자의 사업자 등록 여부를 확인합니다. 사업자등록번호는 공개하지 않으며, 거래는 판매자와 구매자
        사이에서 이루어집니다.
      </p>
    </div>
  );
}
