import { loadAdminSellListing } from '@/lib/admin-listings-data';
import {
  getAuthUser,
  getDocument,
  hasFirebaseAdminConfig,
  queryDocumentIds,
  queryDocuments,
  setDocument,
  updateDocument,
} from '@/lib/firebase-rest-admin';
import { loadJoinsForBuyer } from '@/lib/sell-join-server';
import type { SellInquiry, SellInquiryDetail } from '@/types/sell-inquiry';

const COLLECTION = 'sellInquiries';

function mergeInquiries(items: SellInquiry[]): SellInquiry[] {
  const map = new Map(items.map((item) => [item.id, item]));
  return [...map.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

async function inquirySellerId(inquiry: SellInquiry): Promise<string> {
  if (inquiry.sellerId) return inquiry.sellerId;
  const listing = await loadAdminSellListing(inquiry.listingId);
  return listing?.sellerId ?? '';
}

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

export async function loadInquiriesForBuyer(buyerId: string): Promise<SellInquiry[]> {
  if (!hasFirebaseAdminConfig()) return [];
  return loadInquiries('buyerId', buyerId);
}

export async function loadInquiriesForSeller(sellerId: string): Promise<SellInquiry[]> {
  if (!hasFirebaseAdminConfig()) return [];
  const bySeller = await loadInquiries('sellerId', sellerId);
  const listingIds = await queryDocumentIds('sellListings', 'sellerId', sellerId);
  const byListing = (
    await Promise.all(listingIds.map((listingId) => loadInquiries('listingId', listingId)))
  ).flat();
  return mergeInquiries([...bySeller, ...byListing]);
}

export async function loadSellInquiry(inquiryId: string): Promise<SellInquiry | null> {
  const data = await getDocument(COLLECTION, inquiryId);
  if (!data) return null;
  return toInquiry(inquiryId, data);
}

export async function loadSellInquiryForBuyer(
  buyerId: string,
  inquiryId: string,
): Promise<SellInquiryDetail | null> {
  const inquiry = await loadSellInquiry(inquiryId);
  if (!inquiry || inquiry.buyerId !== buyerId) return null;
  const listing = await loadAdminSellListing(inquiry.listingId);
  return {
    ...inquiry,
    listingTitle: listing?.title?.trim() || '상품',
  };
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
  if (listing.sellerId === buyerId) throw new Error('본인 상품에는 문의할 수 없습니다.');

  const joins = await loadJoinsForBuyer(buyerId);
  if (!joins.some((join) => join.listingId === listingId)) {
    throw new Error('구매 신청한 상품만 문의할 수 있습니다.');
  }

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
  const ownerId = await inquirySellerId(inquiry);
  if (!ownerId || ownerId !== sellerId) throw new Error('본인 상품 문의만 답할 수 있습니다.');
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
