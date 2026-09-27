import { collection, doc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { getClientFirestore } from '@/lib/firebase';
import { loadLocalInquiries, saveLocalInquiry } from '@/lib/sell-inquiry-store';
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

function mergeInquiries(remote: SellInquiry[], local: SellInquiry[]): SellInquiry[] {
  const map = new Map<string, SellInquiry>();
  for (const item of [...local, ...remote]) map.set(item.id, item);
  return [...map.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function fetchSellInquiries(listingId: string): Promise<SellInquiry[]> {
  const local = loadLocalInquiries(listingId);
  const db = getClientFirestore();
  if (!db) return local;

  try {
    const snapshot = await getDocs(query(collection(db, COLLECTION), where('listingId', '==', listingId)));
    const remote = snapshot.docs
      .map((entry) => toInquiry(entry.id, entry.data() as Record<string, unknown>))
      .filter((item): item is SellInquiry => Boolean(item));
    return mergeInquiries(remote, local);
  } catch {
    return local;
  }
}

export async function fetchSellInquiriesBySeller(sellerId: string): Promise<SellInquiry[]> {
  const local = loadLocalInquiries().filter((item) => item.sellerId === sellerId);
  const db = getClientFirestore();
  if (!db) return local.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  try {
    const snapshot = await getDocs(query(collection(db, COLLECTION), where('sellerId', '==', sellerId)));
    const remote = snapshot.docs
      .map((entry) => toInquiry(entry.id, entry.data() as Record<string, unknown>))
      .filter((item): item is SellInquiry => Boolean(item));
    return mergeInquiries(remote, local);
  } catch {
    return local.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

export async function createSellInquiry(inquiry: SellInquiry): Promise<SellInquiry> {
  saveLocalInquiry(inquiry);
  const db = getClientFirestore();
  if (db) {
    try {
      await setDoc(doc(db, COLLECTION, inquiry.id), inquiry);
    } catch {
      // local copy is enough when rules are missing
    }
  }
  return inquiry;
}

export async function answerSellInquiry(inquiry: SellInquiry, answer: string): Promise<SellInquiry> {
  const next: SellInquiry = {
    ...inquiry,
    answer: answer.trim(),
    answeredAt: new Date().toISOString(),
  };
  saveLocalInquiry(next);
  const db = getClientFirestore();
  if (db) {
    try {
      await updateDoc(doc(db, COLLECTION, next.id), { answer: next.answer, answeredAt: next.answeredAt });
    } catch {
      try {
        await setDoc(doc(db, COLLECTION, next.id), next);
      } catch {
        // keep local
      }
    }
  }
  return next;
}
