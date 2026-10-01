'use client';

import Link from 'next/link';
import { formatSellerPhone, resolveSellerIdentity } from '@/lib/seller-identity';
import { useSellerProfile } from '@/features/seller/use-seller-profile';
import { hasSellerProfile } from '@/types/seller';
import type { SellListing } from '@/types/sell';

function IdentityRow({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-sm text-muted">
      <span className="text-subtle">{label}</span> {value}
    </p>
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
    <div className="min-w-0 space-y-1">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="whitespace-nowrap font-semibold text-ink">{identity.sellerName}</span>
        {identity.businessVerified ? (
          <Link href={`/seller/${item.sellerId}/verify?from=${item.id}`} className="btn-chip">
            사업자 인증
          </Link>
        ) : (
          <span className="whitespace-nowrap text-xs text-subtle">인증 대기</span>
        )}
      </div>
      <IdentityRow label="대표자" value={identity.representativeName} />
      <IdentityRow label="사업장 주소" value={identity.businessAddress} />
      {phones.phone ? <IdentityRow label="사업장 전화" value={phones.phone} /> : null}
      {phones.mobile ? <IdentityRow label="핸드폰" value={phones.mobile} /> : null}
      <IdentityRow label="사업자등록번호" value={identity.businessNumber} />
      {identity.sellerEmail ? <IdentityRow label="이메일" value={identity.sellerEmail} /> : null}
    </div>
  );
}
