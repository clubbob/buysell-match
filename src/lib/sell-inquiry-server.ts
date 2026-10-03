import { loadAdminSellListing } from '@/lib/admin-listings-data';
import { getAuthUser, getDocument, hasFirebaseAdminConfig, queryDocuments, setDocument, updateDocument } from '@/lib/firebase-rest-admin';
import type { SellInquiry } from '@/types/sell-inquiry';

const COLLECTION = 'sellInquiries';

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

async function loadInquiries(whereField: string, value: string): Promise<SellInquiry[]> {
  const docs = await queryDocuments(COLLECTION, whereField, value);
  return docs
    .map((entry) => toInquiry(entry.id, entry.data))
    .filter((item): item is SellInquiry => Boolean(item))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function loadInquiriesForListing(listingId: string): Promise<SellInquiry[]> {
  if (!hasFirebaseAdminConfig()) return [];
  return loadInquiries('listingId', listingId);
}

export async function loadInquiriesForSeller(sellerId: string): Promise<SellInquiry[]> {
  if (!hasFirebaseAdminConfig()) return [];
  return loadInquiries('sellerId', sellerId);
}

export async function loadSellInquiry(inquiryId: string): Promise<SellInquiry | null> {
  const data = await getDocument(COLLECTION, inquiryId);
  if (!data) return null;
  return toInquiry(inquiryId, data);
}

export async function createSellInquiryForUser(
  buyerId: string,
  listingId: string,
  question: string,
): Promise<SellInquiry> {
  if (!hasFirebaseAdminConfig()) {
    throw new Error('저장소를 연결하지 못했습니다.');
  }

  const listing = await loadAdminSellListing(listingId);
  if (!listing) throw new Error('없는 상품입니다.');

  const text = question.trim();
  if (text.length < 5) throw new Error('문의는 5자 이상 입력해 주세요.');

  const authUser = await getAuthUser(buyerId);
  const inquiry: SellInquiry = {
    id: `q-${crypto.randomUUID()}`,
    listingId,
    sellerId: listing.sellerId,
    buyerId,
    buyerName: authUser?.displayName?.trim() || '구매자',
    question: text,
    answer: '',
    answeredAt: '',
    createdAt: new Date().toISOString(),
  };

  await setDocument(COLLECTION, inquiry.id, inquiry);
  return inquiry;
}

export async function answerSellInquiryForSeller(
  sellerId: string,
  inquiryId: string,
  answer: string,
): Promise<SellInquiry> {
  if (!hasFirebaseAdminConfig()) {
    throw new Error('저장소를 연결하지 못했습니다.');
  }

  const inquiry = await loadSellInquiry(inquiryId);
  if (!inquiry) throw new Error('없는 문의입니다.');
  if (inquiry.sellerId !== sellerId) throw new Error('본인 상품 문의만 답할 수 있습니다.');
  if (inquiry.buyerId === sellerId) throw new Error('본인이 남긴 문의에는 답할 수 없습니다.');

  const text = answer.trim();
  if (text.length < 2) throw new Error('답변은 2자 이상 입력해 주세요.');

  const answeredAt = new Date().toISOString();
  await updateDocument(COLLECTION, inquiryId, { answer: text, answeredAt });
  return { ...inquiry, answer: text, answeredAt };
}

export async function answerSellInquiryAsAdmin(inquiryId: string, answer: string): Promise<SellInquiry> {
  if (!hasFirebaseAdminConfig()) {
    throw new Error('저장소를 연결하지 못했습니다.');
  }

  const inquiry = await loadSellInquiry(inquiryId);
  if (!inquiry) throw new Error('없는 문의입니다.');

  const text = answer.trim();
  if (text.length < 2) throw new Error('답변은 2자 이상 입력해 주세요.');

  const answeredAt = new Date().toISOString();
  await updateDocument(COLLECTION, inquiryId, { answer: text, answeredAt });
  return { ...inquiry, answer: text, answeredAt };
}
