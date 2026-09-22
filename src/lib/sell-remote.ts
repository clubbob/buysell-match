import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { getClientFirestore, getClientStorage } from '@/lib/firebase';
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
