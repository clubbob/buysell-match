'use client';

import PageBack from '@/components/ui/PageBack';
import IntermediaryNotice from '@/components/legal/IntermediaryNotice';
import { formatSellerPhone, resolveSellerIdentity } from '@/lib/seller-identity';
import { useSellListings } from '@/features/sell/use-sell-listings';
import { useSellerProfile } from '@/features/seller/use-seller-profile';
import { hasSellerProfile } from '@/types/seller';

function Field({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-sm text-muted">
      <span className="text-subtle">{label}</span> {value}
    </p>
  );
}

export default function SellerVerifyClient({ sellerId, from }: { sellerId: string; from?: string }) {
  const { items, ready: listingsReady } = useSellListings();
  const { profile, ready: profileReady } = useSellerProfile(sellerId);

  const fromProduct = from ? items.find((item) => item.id === from) : undefined;
  const backHref = fromProduct ? `/sell/${fromProduct.id}` : '/sell';
  const backLabel = fromProduct ? `← ${fromProduct.title}` : '← 이전 목록';

  if (!profileReady || (from && !listingsReady)) {
    return <p className="text-sm text-muted">불러오는 중…</p>;
  }

  if (!hasSellerProfile(profile)) {
    return (
      <div className="space-y-5">
        <PageBack href={backHref}>{backLabel}</PageBack>
        <p className="panel px-4 py-10 text-center text-sm text-muted">확인할 사업자 인증이 없습니다.</p>
      </div>
    );
  }

  const listing = fromProduct ?? items.find((item) => item.sellerId === sellerId);
  const identity = resolveSellerIdentity(profile, listing);
  const phones = formatSellerPhone(identity.sellerPhone, identity.sellerMobile);

  return (
    <div className="space-y-5">
      <PageBack href={backHref}>{backLabel}</PageBack>

      <section className="panel px-4 py-5 sm:px-6">
        <p className="text-xs font-semibold tracking-wide text-subtle">판매자 신원 정보</p>
        <h1 className="mt-1 text-xl font-bold text-ink">{identity.sellerName}</h1>
        <p className="mt-2 text-sm font-semibold text-ink">사업자 정보를 확인한 판매자입니다.</p>
        <div className="mt-4 space-y-1">
          <Field label="대표자" value={identity.representativeName} />
          <Field label="사업장 주소" value={identity.businessAddress} />
          {phones.phone ? <Field label="사업장 전화" value={phones.phone} /> : null}
          {phones.mobile ? <Field label="핸드폰" value={phones.mobile} /> : null}
          <Field label="사업자등록번호" value={identity.businessNumber} />
          {identity.sellerEmail ? <Field label="이메일" value={identity.sellerEmail} /> : null}
        </div>
      </section>

      <IntermediaryNotice />
    </div>
  );
}
