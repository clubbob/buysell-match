import { collection, getDocs } from 'firebase/firestore';
import { getClientFirestore } from '@/lib/firebase';
import { toBuyListing, type BuyListing } from '@/types/buy';

const COLLECTION = 'buyListings';

export async function fetchRemoteBuyListings(): Promise<BuyListing[]> {
  const db = getClientFirestore();
  if (!db) return [];

  try {
    const snapshot = await getDocs(collection(db, COLLECTION));
    const items = snapshot.docs
      .map((doc) => toBuyListing(doc.id, doc.data() as Record<string, unknown>))
      .filter((item): item is BuyListing => item !== null);
    return items.sort((a, b) => b.id.localeCompare(a.id));
  } catch {
    return [];
  }
}
