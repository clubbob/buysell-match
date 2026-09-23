import { collection, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { getClientFirestore, getClientStorage } from '@/lib/firebase';
import { saveRemainingOverride } from '@/lib/sell-store';
import type { SellListing } from '@/types/sell';

const COLLECTION = 'sellListings';

function toListing(id: string, data: Record<string, unknown>): SellListing | null {
  if (!data.title || !Array.isArray(data.images) || !data.sellerId) return null;
  return {
    id,
    title: String(data.title),
    images: data.images.map(String),
    sellerId: String(data.sellerId),
    sellerName: String(data.sellerName ?? ''),
    representativeName: String(data.representativeName ?? ''),
    businessVerified: Boolean(data.businessVerified),
    sellerPhone: String(data.sellerPhone ?? ''),
    sellerEmail: String(data.sellerEmail ?? ''),
    regularPrice: Number(data.regularPrice) || 0,
    salePrice: Number(data.salePrice) || 0,
    minPurchaseLabel: String(data.minPurchaseLabel ?? data.minOrderLabel ?? ''),
    limitLabel: String(data.limitLabel ?? data.quantityLabel ?? data.remainingLabel ?? ''),
    quantityLabel: String(data.quantityLabel ?? ''),
    remainingLabel: String(data.remainingLabel ?? ''),
    deadline: String(data.deadline ?? ''),
    description: String(data.description ?? ''),
  };
}

async function uploadImages(sellerId: string, listingId: string, files: File[]) {
  const storage = getClientStorage();
  if (!storage) throw new Error('Storage가 연결되지 않았습니다.');

  const urls: string[] = [];
  for (const [index, file] of files.entries()) {
    const path = `sell/${sellerId}/${listingId}/${index}-${file.name}`;
    const fileRef = ref(storage, path);
    await uploadBytes(fileRef, file);
    urls.push(await getDownloadURL(fileRef));
  }
  return urls;
}

export async function resolveSellImages(
  sellerId: string,
  listingId: string,
  items: { url: string; file: File | null }[],
): Promise<string[]> {
  const storage = getClientStorage();
  const urls: string[] = [];

  for (const [index, item] of items.entries()) {
    if (!item.file) {
      if (!item.url) throw new Error('이미지를 넣어 주세요.');
      urls.push(item.url);
      continue;
    }
    if (!storage) throw new Error('Storage가 연결되지 않았습니다.');
    const path = `sell/${sellerId}/${listingId}/${Date.now()}-${index}-${item.file.name}`;
    const fileRef = ref(storage, path);
    await uploadBytes(fileRef, item.file);
    urls.push(await getDownloadURL(fileRef));
  }

  return urls;
}

export async function fetchRemoteSellListings(): Promise<SellListing[]> {
  const db = getClientFirestore();
  if (!db) return [];
  const snapshot = await getDocs(collection(db, COLLECTION));
  return snapshot.docs
    .map((entry) => toListing(entry.id, entry.data() as Record<string, unknown>))
    .filter((item): item is SellListing => Boolean(item));
}

export async function fetchRemoteSellListing(id: string): Promise<SellListing | null> {
  const db = getClientFirestore();
  if (!db) return null;
  const snapshot = await getDoc(doc(db, COLLECTION, id));
  if (!snapshot.exists()) return null;
  return toListing(snapshot.id, snapshot.data() as Record<string, unknown>);
}

export async function createRemoteSellListing(item: Omit<SellListing, 'images'>, files: File[]): Promise<SellListing> {
  const db = getClientFirestore();
  if (!db) throw new Error('Firestore가 연결되지 않았습니다.');
  const images = await uploadImages(item.sellerId, item.id, files);
  const payload: SellListing = { ...item, images };
  await setDoc(doc(db, COLLECTION, item.id), payload);
  return payload;
}

export async function updateRemoteSellListing(item: SellListing): Promise<SellListing> {
  const db = getClientFirestore();
  if (!db) throw new Error('Firestore가 연결되지 않았습니다.');
  await setDoc(doc(db, COLLECTION, item.id), item);
  saveRemainingOverride(item.id, item.remainingLabel);
  return item;
}

export async function updateSellRemaining(id: string, remainingLabel: string): Promise<void> {
  saveRemainingOverride(id, remainingLabel);
  const db = getClientFirestore();
  if (!db) return;
  try {
    await updateDoc(doc(db, COLLECTION, id), { remainingLabel });
  } catch {
    // sample listings are local-only
  }
}
