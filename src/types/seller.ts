export type SellerProfile = {
  sellerId: string;
  sellerName: string;
  representativeName: string;
  sellerPhone: string;
  sellerEmail: string;
  businessNumber: string;
  businessVerified: boolean;
};

export function isSellerProfileComplete(profile: SellerProfile | null | undefined): profile is SellerProfile {
  return Boolean(
    profile?.sellerName.trim() &&
      profile.representativeName.trim() &&
      profile.sellerPhone.trim() &&
      profile.sellerEmail.trim() &&
      profile.businessNumber.trim() &&
      profile.businessVerified,
  );
}
