import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getClientFirestore } from '@/lib/firebase';
import { isSellerProfileComplete, type SellerProfile } from '@/types/seller';

const COLLECTION = 'sellerProfiles';

function toProfile(id: string, data: Record<string, unknown>): SellerProfile {
  return {
    sellerId: id,
    sellerName: String(data.sellerName ?? ''),
    representativeName: String(data.representativeName ?? ''),
    sellerPhone: String(data.sellerPhone ?? ''),
    sellerEmail: String(data.sellerEmail ?? ''),
    businessAddress: String(data.businessAddress ?? ''),
    businessNumber: String(data.businessNumber ?? ''),
    businessVerified: Boolean(data.businessVerified),
    businessVerifiedAt: String(data.businessVerifiedAt ?? ''),
  };
}

export async function fetchSellerProfile(sellerId: string): Promise<SellerProfile | null> {
  const db = getClientFirestore();
  if (!db) return null;
  const snapshot = await getDoc(doc(db, COLLECTION, sellerId));
  if (!snapshot.exists()) return null;
  return toProfile(snapshot.id, snapshot.data() as Record<string, unknown>);
}

export async function saveSellerProfile(profile: SellerProfile): Promise<SellerProfile> {
  const db = getClientFirestore();
  if (!db) throw new Error('Firestore가 연결되지 않았습니다.');
  if (!isSellerProfileComplete(profile)) throw new Error('판매자 정보를 모두 입력해 주세요.');
  await setDoc(doc(db, COLLECTION, profile.sellerId), profile);
  return profile;
}
