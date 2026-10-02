import { deleteDocument, hasFirebaseAdminConfig, listDocuments, queryDocumentIds } from '@/lib/firebase-rest-admin';
import { toBuyListing, type BuyListing } from '@/types/buy';
import { parseSellCategory } from '@/types/sell-category';
import { withSellSource, type SellListing } from '@/types/sell';

function toSellListing(id: string, data: Record<string, unknown>): SellListing | null {
  if (!data.title || !Array.isArray(data.images) || !data.sellerId) return null;
  return withSellSource({
    id,
    title: String(data.title),
    category: parseSellCategory(data.category),
    images: data.images.map(String),
    sellerId: String(data.sellerId),
    sellerName: String(data.sellerName ?? ''),
    representativeName: String(data.representativeName ?? ''),
    businessAddress: String(data.businessAddress ?? ''),
    businessNumber: String(data.businessNumber ?? ''),
    businessVerified: Boolean(data.businessVerified),
    sellerMobile: String(data.sellerMobile ?? ''),
    sellerPhone: String(data.sellerPhone ?? ''),
    sellerEmail: String(data.sellerEmail ?? ''),
    sourceType: data.sourceType as SellListing['sourceType'],
    coupangUrl: String(data.coupangUrl ?? ''),
    smartstoreUrl: String(data.smartstoreUrl ?? ''),
    productUrl: String(data.productUrl ?? ''),
    productUrls: Array.isArray(data.productUrls) ? data.productUrls.map(String) : undefined,
    youtubeUrl: String(data.youtubeUrl ?? ''),
    regularPrice: Number(data.regularPrice) || 0,
    salePrice: Number(data.salePrice) || 0,
    minPurchaseLabel: String(data.minPurchaseLabel ?? data.minOrderLabel ?? ''),
    limitLabel: String(data.limitLabel ?? data.quantityLabel ?? data.remainingLabel ?? ''),
    quantityLabel: String(data.quantityLabel ?? ''),
    remainingLabel: String(data.remainingLabel ?? ''),
    deadline: String(data.deadline ?? ''),
    closedAt: String(data.closedAt ?? ''),
    description: String(data.description ?? ''),
    specText: String(data.specText ?? ''),
    tradeText: String(data.tradeText ?? ''),
    depositBank: String(data.depositBank ?? ''),
    depositAccount: String(data.depositAccount ?? ''),
    depositHolder: String(data.depositHolder ?? ''),
    createdAt: String(data.createdAt ?? ''),
  });
}

function sortByDeadlineThenTitle<T extends { deadline: string; title: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const byDeadline = b.deadline.localeCompare(a.deadline);
    if (byDeadline !== 0) return byDeadline;
    return a.title.localeCompare(b.title, 'ko');
  });
}

export async function loadAdminSellListings(): Promise<SellListing[] | null> {
  if (!hasFirebaseAdminConfig()) return null;
  const docs = await listDocuments('sellListings');
  const items = docs
    .map((entry) => toSellListing(entry.id, entry.data))
    .filter((item): item is SellListing => Boolean(item));
  return sortByDeadlineThenTitle(items);
}

export async function loadAdminBuyListings(): Promise<BuyListing[] | null> {
  if (!hasFirebaseAdminConfig()) return null;
  const docs = await listDocuments('buyListings');
  const items = docs
    .map((entry) => toBuyListing(entry.id, entry.data))
    .filter((item): item is BuyListing => Boolean(item));
  return sortByDeadlineThenTitle(items);
}

export async function deleteAdminSellListing(id: string): Promise<void> {
  const [joinIds, inquiryIds] = await Promise.all([
    queryDocumentIds('sellJoins', 'listingId', id),
    queryDocumentIds('sellInquiries', 'listingId', id),
  ]);
  await Promise.all([
    ...joinIds.map((joinId) => deleteDocument('sellJoins', joinId)),
    ...inquiryIds.map((inquiryId) => deleteDocument('sellInquiries', inquiryId)),
    deleteDocument('sellListings', id),
  ]);
}

export async function deleteAdminBuyListing(id: string): Promise<void> {
  await deleteDocument('buyListings', id);
}
