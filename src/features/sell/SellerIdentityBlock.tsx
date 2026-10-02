'use client';

import Link from 'next/link';
import { formatSellerPhone, resolveSellerIdentity } from '@/lib/seller-identity';
import { useSellerProfile } from '@/features/seller/use-seller-profile';
import { hasSellerProfile } from '@/types/seller';
import type { SellListing } from '@/types/sell';

function IdentityField({ label, value, colSpan = 1 }: { label: string; value: string; colSpan?: 1 | 2 | 3 }) {
  const spanClass = colSpan === 3 ? ' sm:col-span-3' : colSpan === 2 ? ' sm:col-span-2' : '';

  return (
    <div className={`flex min-w-0 items-start gap-x-2 text-sm${spanClass}`}>
      <dt className="shrink-0 whitespace-nowrap text-subtle">{label}</dt>
      <dd className="min-w-0 text-ink">{value}</dd>
    </div>
  );
}

export default function SellerIdentityBlock({ item }: { item: SellListing }) {
  const { profile, ready } = useSellerProfile(item.sellerId);

  if (!ready) {
    return <p className="text-sm text-muted">판매자 정보를 불러오는 중…</p>;
  }

  if (!hasSellerProfile(profile)) {
    return <p className="text-sm text-muted">판매자 정보를 불러올 수 없습니다.</p>;
  }

  const identity = resolveSellerIdentity(profile, item);
  const phones = formatSellerPhone(identity.sellerPhone, identity.sellerMobile);

  return (
    <div className="min-w-0 w-full space-y-2">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="text-subtle">판매자</span>
        <span className="whitespace-nowrap text-ink">{identity.sellerName}</span>
        {identity.businessVerified ? (
          <Link href={`/seller/${item.sellerId}/verify?from=${item.id}`} className="btn-chip">
            사업자 인증
          </Link>
        ) : (
          <span className="whitespace-nowrap text-xs text-subtle">인증 대기</span>
        )}
      </div>
      <dl className="grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-3">
        <IdentityField label="대표자" value={identity.representativeName} />
        <IdentityField label="사업자등록번호" value={identity.businessNumber} />
        {phones.mobile ? <IdentityField label="핸드폰" value={phones.mobile} /> : null}
        {identity.sellerEmail ? <IdentityField label="이메일" value={identity.sellerEmail} /> : null}
        <IdentityField label="사업장 주소" value={identity.businessAddress} colSpan={identity.sellerEmail ? 2 : 3} />
        {phones.phone ? <IdentityField label="사업장 전화" value={phones.phone} /> : null}
      </dl>
    </div>
  );
}
