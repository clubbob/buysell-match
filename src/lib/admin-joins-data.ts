import { hasFirebaseAdminConfig, listDocuments } from '@/lib/firebase-rest-admin';
import { normalizeSellJoin, type SellJoin } from '@/types/sell-join';

function toJoin(id: string, data: Record<string, unknown>): SellJoin | null {
  if (!data.listingId || !data.buyerId || !data.quantity) return null;
  return normalizeSellJoin({
    id,
    listingId: String(data.listingId),
    sellerId: String(data.sellerId ?? ''),
    buyerId: String(data.buyerId),
    buyerEmail: String(data.buyerEmail ?? ''),
    buyerName: String(data.buyerName ?? ''),
    buyerAddress: String(data.buyerAddress ?? ''),
    quantity: Number(data.quantity) || 0,
    status: data.status === 'confirmed' ? 'confirmed' : 'open',
    createdAt: String(data.createdAt ?? ''),
    confirmedAt: data.confirmedAt ? String(data.confirmedAt) : undefined,
    paymentStatus: data.paymentStatus === 'paid' ? 'paid' : data.paymentStatus === 'pending' ? 'pending' : undefined,
    paidAt: data.paidAt ? String(data.paidAt) : undefined,
    shippingStatus: data.shippingStatus === 'shipped' ? 'shipped' : data.shippingStatus === 'pending' ? 'pending' : undefined,
    shippedAt: data.shippedAt ? String(data.shippedAt) : undefined,
    trackingNumber: data.trackingNumber ? String(data.trackingNumber) : undefined,
  });
}

export type AdminSellJoinRow = SellJoin & {
  listingTitle: string;
  sellerName: string;
};

export async function loadAdminSellJoins(): Promise<AdminSellJoinRow[] | null> {
  if (!hasFirebaseAdminConfig()) return null;
  const [joinDocs, listingDocs, sellerDocs] = await Promise.all([
    listDocuments('sellJoins'),
    listDocuments('sellListings'),
    listDocuments('sellerProfiles'),
  ]);
  const listingMeta = new Map(
    listingDocs.map((entry) => [
      entry.id,
      {
        title: String(entry.data.title ?? '').trim() || '제목 없음',
        sellerName: String(entry.data.sellerName ?? '').trim(),
      },
    ]),
  );
  const sellerNames = new Map(
    sellerDocs.map((entry) => [
      entry.id,
      String(entry.data.sellerName ?? '').trim() || String(entry.data.representativeName ?? '').trim(),
    ]),
  );
  return joinDocs
    .map((entry) => {
      const join = toJoin(entry.id, entry.data);
      if (!join) return null;
      const listing = listingMeta.get(join.listingId);
      const sellerName = listing?.sellerName || sellerNames.get(join.sellerId) || '';
      return {
        ...join,
        listingTitle: listing?.title ?? '삭제된 상품',
        sellerName,
      };
    })
    .filter((item): item is AdminSellJoinRow => Boolean(item))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
