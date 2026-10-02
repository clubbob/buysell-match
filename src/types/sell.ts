import { parseSellSourceType, parseShopUrls, sourceTypeFromUrls, type SellSourceType } from '@/lib/sell-source';
import { parseSellCategory, type SellCategory } from '@/types/sell-category';

export type SellListing = {
  id: string;
  title: string;
  category: SellCategory;
  images: string[];
  sellerId: string;
  sellerName: string;
  representativeName: string;
  businessAddress: string;
  businessNumber: string;
  businessVerified: boolean;
  sellerMobile: string;
  sellerPhone: string;
  sellerEmail: string;
  sourceType: SellSourceType;
  coupangUrl: string;
  smartstoreUrl: string;
  productUrl: string;
  productUrls: string[];
  youtubeUrl: string;
  regularPrice: number;
  salePrice: number;
  minPurchaseLabel: string;
  limitLabel: string;
  quantityLabel: string;
  remainingLabel: string;
  deadline: string;
  closedAt: string;
  description: string;
  specText: string;
  tradeText: string;
  depositBank: string;
  depositAccount: string;
  depositHolder: string;
  createdAt: string;
};

export function sellCoverImage(item: Pick<SellListing, 'images'>): string | null {
  return item.images[0] ?? null;
}

export function withSellSource(
  item: Omit<SellListing, 'sourceType' | 'coupangUrl' | 'smartstoreUrl' | 'productUrl' | 'productUrls' | 'youtubeUrl'> &
    Partial<Pick<SellListing, 'sourceType' | 'coupangUrl' | 'smartstoreUrl' | 'productUrl' | 'productUrls' | 'youtubeUrl'>>,
): SellListing {
  const shops = parseShopUrls(item);
  const productUrls = [shops.coupangUrl, shops.smartstoreUrl].filter(Boolean);
  const youtubeUrl = String(item.youtubeUrl ?? '').trim();
  return {
    ...item,
    category: parseSellCategory(item.category),
    ...shops,
    productUrls,
    productUrl: productUrls[0] ?? '',
    youtubeUrl,
    sourceType:
      productUrls.length > 0 || youtubeUrl
        ? sourceTypeFromUrls(productUrls.length > 0, youtubeUrl)
        : parseSellSourceType(item.sourceType),
  };
}
