import { formatBusinessNumber } from '@/lib/business-number';
import { formatPhoneNumber } from '@/lib/phone-number';
import type { SellerProfile } from '@/types/seller';
import type { SellListing } from '@/types/sell';

/** 판매자 상세 등록(DB)을 기준으로 신원 정보를 맞춥니다. 글에 복사된 값은 보조로만 씁니다. */
export function resolveSellerIdentity(profile: SellerProfile, listing?: Pick<SellListing, 'sellerEmail'>) {
  return {
    sellerName: profile.sellerName.trim(),
    representativeName: profile.representativeName.trim(),
    businessAddress: profile.businessAddress.trim(),
    businessNumber: formatBusinessNumber(profile.businessNumber),
    sellerPhone: profile.sellerPhone.trim(),
    sellerMobile: profile.sellerMobile.trim(),
    sellerEmail: (listing?.sellerEmail || profile.sellerEmail).trim(),
    businessVerified: profile.businessVerified,
  };
}

export function formatSellerPhone(sellerPhone: string, sellerMobile: string): { phone?: string; mobile?: string } {
  return {
    phone: sellerPhone ? formatPhoneNumber(sellerPhone) : undefined,
    mobile: sellerMobile ? formatPhoneNumber(sellerMobile) : undefined,
  };
}
