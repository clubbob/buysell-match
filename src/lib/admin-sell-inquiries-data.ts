import { loadAdminSellListingTitle } from '@/lib/admin-listings-data';
import { deleteDocument, getDocument, hasFirebaseAdminConfig, listDocuments } from '@/lib/firebase-rest-admin';
import { answerSellInquiryAsAdmin } from '@/lib/sell-inquiry-server';
import { isInquiryAnswered, type SellInquiry } from '@/types/sell-inquiry';

function toInquiry(id: string, data: Record<string, unknown>): SellInquiry | null {
  if (!data.listingId || !data.buyerId || !data.question) return null;
  return {
    id,
    listingId: String(data.listingId),
    sellerId: String(data.sellerId ?? ''),
    buyerId: String(data.buyerId),
    buyerName: String(data.buyerName ?? ''),
    question: String(data.question ?? ''),
    answer: String(data.answer ?? ''),
    answeredAt: String(data.answeredAt ?? ''),
    createdAt: String(data.createdAt ?? ''),
  };
}

export type AdminSellInquiryRow = SellInquiry & {
  listingTitle: string;
};

export async function loadAdminSellInquiries(): Promise<AdminSellInquiryRow[] | null> {
  if (!hasFirebaseAdminConfig()) return null;
  const [inquiryDocs, listingDocs] = await Promise.all([
    listDocuments('sellInquiries'),
    listDocuments('sellListings'),
  ]);
  const titles = new Map(
    listingDocs.map((entry) => [entry.id, String(entry.data.title ?? '').trim() || '제목 없음']),
  );
  return inquiryDocs
    .map((entry) => {
      const inquiry = toInquiry(entry.id, entry.data);
      if (!inquiry) return null;
      return {
        ...inquiry,
        listingTitle: titles.get(inquiry.listingId) ?? '삭제된 상품',
      };
    })
    .filter((item): item is AdminSellInquiryRow => Boolean(item))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function countWaitingSellInquiries(items: SellInquiry[]) {
  return items.filter((item) => !isInquiryAnswered(item)).length;
}

export async function loadAdminSellInquiry(id: string): Promise<AdminSellInquiryRow | null> {
  if (!hasFirebaseAdminConfig()) return null;
  const data = await getDocument('sellInquiries', id);
  const inquiry = data ? toInquiry(id, data) : null;
  if (!inquiry) return null;
  const listingTitle = (await loadAdminSellListingTitle(inquiry.listingId)) ?? '삭제된 상품';
  return { ...inquiry, listingTitle };
}

export async function answerAdminSellInquiry(id: string, answer: string): Promise<AdminSellInquiryRow | null> {
  const updated = await answerSellInquiryAsAdmin(id, answer);
  const listingTitle = (await loadAdminSellListingTitle(updated.listingId)) ?? '삭제된 상품';
  return { ...updated, listingTitle };
}

export async function deleteAdminSellInquiry(id: string): Promise<boolean> {
  if (!hasFirebaseAdminConfig()) return false;
  const data = await getDocument('sellInquiries', id);
  if (!data) return false;
  await deleteDocument('sellInquiries', id);
  return true;
}
