import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { getClientFirestore, getClientStorage } from '@/lib/firebase';
import { fetchSellJoins } from '@/lib/sell-join-remote';
import { parseSellCategory } from '@/types/sell-category';
import { readFirestoreCreatedAt } from '@/lib/sell-listing-time';
import { normalizeSellListingImage } from '@/lib/sell-listing-image';
import { withSellSource, type SellListing } from '@/types/sell';

const COLLECTION = 'sellListings';

function toListing(id: string, data: Record<string, unknown>): SellListing | null {
  if (!data.title || !Array.isArray(data.images) || !data.sellerId) return null;
  return withSellSource({
    id,
    title: String(data.title),
    category: parseSellCategory(data.category),
    images: data.images.map(String),
    introImages: Array.isArray(data.introImages) ? data.introImages.map(String) : [],
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
    composition: String(data.composition ?? ''),
    specification: String(data.specification ?? ''),
    origin: String(data.origin ?? ''),
    certification: String(data.certification ?? ''),
    shippingFee: String(data.shippingFee ?? ''),
    shippingGuide: String(data.shippingGuide ?? ''),
    returnPolicy: String(data.returnPolicy ?? ''),
    specText: String(data.specText ?? ''),
    tradeText: String(data.tradeText ?? ''),
    depositBank: String(data.depositBank ?? ''),
    depositAccount: String(data.depositAccount ?? ''),
    depositHolder: String(data.depositHolder ?? ''),
    createdAt: readFirestoreCreatedAt(data.createdAt),
  });
}

async function uploadImages(sellerId: string, listingId: string, files: File[]) {
  const storage = getClientStorage();
  if (!storage) throw new Error('Storage가 연결되지 않았습니다.');

  const urls: string[] = [];
  for (const [index, file] of files.entries()) {
    const uploadFile = await normalizeSellListingImage(file);
    const path = `sell/${sellerId}/${listingId}/${Date.now()}-${index}-${uploadFile.name}`;
    const fileRef = ref(storage, path);
    await uploadBytes(fileRef, uploadFile);
    urls.push(await getDownloadURL(fileRef));
  }
  return urls;
}

async function resolveListingFiles(
  sellerId: string,
  listingId: string,
  items: { url: string; file: File | null }[],
  folder: 'images' | 'intro',
  requireEach: boolean,
): Promise<string[]> {
  const storage = getClientStorage();
  const urls: string[] = [];

  for (const [index, item] of items.entries()) {
    if (!item.file) {
      if (!item.url) {
        if (requireEach) throw new Error('이미지를 넣어 주세요.');
        continue;
      }
      urls.push(item.url);
      continue;
    }
    if (!storage) throw new Error('Storage가 연결되지 않았습니다.');
    const uploadFile = folder === 'images' ? await normalizeSellListingImage(item.file) : item.file;
    const path = `sell/${sellerId}/${listingId}/${folder}/${Date.now()}-${index}-${uploadFile.name}`;
    const fileRef = ref(storage, path);
    await uploadBytes(fileRef, uploadFile);
    urls.push(await getDownloadURL(fileRef));
  }

  return urls;
}

export async function resolveSellImages(
  sellerId: string,
  listingId: string,
  items: { url: string; file: File | null }[],
): Promise<string[]> {
  return resolveListingFiles(sellerId, listingId, items, 'images', true);
}

export async function resolveIntroImages(
  sellerId: string,
  listingId: string,
  items: { url: string; file: File | null }[],
): Promise<string[]> {
  return resolveListingFiles(sellerId, listingId, items, 'intro', false);
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
  const payload: SellListing = {
    ...item,
    images,
    createdAt: item.createdAt?.trim() || new Date().toISOString(),
  };
  await setDoc(doc(db, COLLECTION, item.id), payload);
  return payload;
}

export async function updateRemoteSellListing(item: SellListing): Promise<SellListing> {
  const joins = await fetchSellJoins(item.id);
  if (joins.length > 0) {
    throw new Error('구매 신청이 있는 상품은 수정할 수 없습니다.');
  }
  const db = getClientFirestore();
  if (!db) throw new Error('Firestore가 연결되지 않았습니다.');
  await setDoc(doc(db, COLLECTION, item.id), item);
  return item;
}

export async function deleteRemoteSellListing(id: string, sellerId: string): Promise<void> {
  const item = await fetchRemoteSellListing(id);
  if (!item) throw new Error('없는 상품입니다.');
  if (item.sellerId !== sellerId) throw new Error('본인 상품만 삭제할 수 있습니다.');

  const joins = await fetchSellJoins(id);
  if (joins.length > 0) {
    throw new Error('구매 신청이 있는 상품은 삭제할 수 없습니다.');
  }

  const db = getClientFirestore();
  if (!db) throw new Error('Firestore가 연결되지 않았습니다.');

  const [inquirySnapshot, reviewSnapshot] = await Promise.all([
    getDocs(query(collection(db, 'sellInquiries'), where('listingId', '==', id))),
    getDocs(query(collection(db, 'sellerReviews'), where('listingId', '==', id))),
  ]);

  await Promise.all([
    ...inquirySnapshot.docs.map((entry) => deleteDoc(entry.ref)),
    ...reviewSnapshot.docs.map((entry) => deleteDoc(entry.ref)),
    deleteDoc(doc(db, COLLECTION, id)),
  ]);
}
