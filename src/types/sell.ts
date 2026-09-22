export type SellListing = {
  id: string;
  title: string;
  images: string[];
  sellerId: string;
  sellerName: string;
  representativeName: string;
  businessVerified: boolean;
  sellerPhone: string;
  sellerEmail: string;
  regularPrice: number;
  salePrice: number;
  quantityLabel: string;
  remainingLabel: string;
  deadline: string;
  description: string;
};

export function sellCoverImage(item: Pick<SellListing, 'images'>): string | null {
  return item.images[0] ?? null;
}
