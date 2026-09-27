export type SellerProfile = {
  sellerId: string;
  sellerName: string;
  representativeName: string;
  sellerMobile: string;
  sellerPhone: string;
  sellerEmail: string;
  businessAddress: string;
  businessNumber: string;
  businessVerified: boolean;
  businessVerifiedAt: string;
  businessCertificateUrl: string;
};

export function toSellerProfile(id: string, data: Record<string, unknown>): SellerProfile {
  return {
    sellerId: id,
    sellerName: String(data.sellerName ?? ''),
    representativeName: String(data.representativeName ?? ''),
    sellerMobile: String(data.sellerMobile ?? ''),
    sellerPhone: String(data.sellerPhone ?? ''),
    sellerEmail: String(data.sellerEmail ?? ''),
    businessAddress: String(data.businessAddress ?? ''),
    businessNumber: String(data.businessNumber ?? ''),
    businessVerified: Boolean(data.businessVerified),
    businessVerifiedAt: String(data.businessVerifiedAt ?? ''),
    businessCertificateUrl: String(data.businessCertificateUrl ?? ''),
  };
}

export function hasSellerProfile(profile: SellerProfile | null | undefined): profile is SellerProfile {
  return Boolean(
    profile?.sellerName.trim() &&
      profile.representativeName.trim() &&
      profile.sellerMobile.trim() &&
      profile.businessAddress.trim() &&
      profile.businessNumber.trim() &&
      profile.businessVerified,
  );
}

export function isSellerProfileComplete(profile: SellerProfile | null | undefined): profile is SellerProfile {
  return hasSellerProfile(profile) && Boolean(profile.businessCertificateUrl.trim());
}

export function formatBusinessVerifiedAt(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length < 8) return '';
  return `${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6, 8)}`;
}
