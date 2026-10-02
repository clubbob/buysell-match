import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { getClientFirestore, getClientStorage } from '@/lib/firebase';
import { SELLER_DETAIL_LABEL } from '@/lib/profile-labels';
import { isSellerProfileComplete, type SellerProfile } from '@/types/seller';

const COLLECTION = 'sellerProfiles';

function toProfile(id: string, data: Record<string, unknown>): SellerProfile {
  return {
    sellerId: id,
    sellerName: String(data.sellerName ?? ''),
    representativeName: String(data.representativeName ?? ''),
    sellerMobile: String(data.sellerMobile ?? ''),
    sellerPhone: String(data.sellerPhone ?? ''),
    sellerEmail: String(data.sellerEmail ?? ''),
    businessAddress: String(data.businessAddress ?? ''),
    businessNumber: String(data.businessNumber ?? ''),
    businessVerified: Boolean(data.businessVerified),
    businessVerifiedAt: String(data.businessVerifiedAt ?? ''),
    businessCertificateUrl: String(data.businessCertificateUrl ?? ''),
    depositBank: String(data.depositBank ?? ''),
    depositAccount: String(data.depositAccount ?? ''),
    depositHolder: String(data.depositHolder ?? ''),
  };
}

export async function uploadBusinessCertificate(sellerId: string, file: File): Promise<string> {
  const storage = getClientStorage();
  if (!storage) throw new Error('Storage가 연결되지 않았습니다.');
  const safeName = file.name.replace(/[^\w.\-가-힣]/g, '_') || 'certificate';
  const fileRef = ref(storage, `sell/${sellerId}/business-certificate/${Date.now()}-${safeName}`);
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
}

export async function fetchSellerProfiles(): Promise<SellerProfile[]> {
  const db = getClientFirestore();
  if (!db) return [];
  const snapshot = await getDocs(collection(db, COLLECTION));
  return snapshot.docs.map((entry) => toProfile(entry.id, entry.data() as Record<string, unknown>));
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
  if (!isSellerProfileComplete(profile)) throw new Error(`${SELLER_DETAIL_LABEL}을 모두 입력해 주세요.`);
  await setDoc(doc(db, COLLECTION, profile.sellerId), profile);
  return profile;
}
