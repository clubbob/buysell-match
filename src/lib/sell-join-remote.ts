import { collection, doc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { getClientFirestore } from '@/lib/firebase';
import { loadLocalJoins, saveLocalJoin, saveLocalJoins } from '@/lib/sell-join-store';
import type { SellJoin } from '@/types/sell-join';

const COLLECTION = 'sellJoins';

function toJoin(id: string, data: Record<string, unknown>): SellJoin | null {
  if (!data.listingId || !data.buyerId || !data.quantity) return null;
  return {
    id,
    listingId: String(data.listingId),
    sellerId: String(data.sellerId ?? ''),
    buyerId: String(data.buyerId),
    buyerEmail: String(data.buyerEmail ?? ''),
    quantity: Number(data.quantity) || 0,
    status: data.status === 'confirmed' ? 'confirmed' : 'open',
    createdAt: String(data.createdAt ?? ''),
  };
}

function mergeJoins(remote: SellJoin[], local: SellJoin[]): SellJoin[] {
  const map = new Map<string, SellJoin>();
  for (const item of [...local, ...remote]) map.set(item.id, item);
  return [...map.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function fetchSellJoins(listingId: string): Promise<SellJoin[]> {
  const local = loadLocalJoins(listingId);
  const db = getClientFirestore();
  if (!db) return local;

  try {
    const snapshot = await getDocs(query(collection(db, COLLECTION), where('listingId', '==', listingId)));
    const remote = snapshot.docs
      .map((entry) => toJoin(entry.id, entry.data() as Record<string, unknown>))
      .filter((item): item is SellJoin => Boolean(item));
    return mergeJoins(remote, local);
  } catch {
    return local;
  }
}

export async function createSellJoin(join: SellJoin): Promise<SellJoin> {
  saveLocalJoin(join);
  const db = getClientFirestore();
  if (db) {
    try {
      await setDoc(doc(db, COLLECTION, join.id), join);
    } catch {
      // local copy is enough when rules are missing
    }
  }
  return join;
}

export async function confirmSellJoins(joins: SellJoin[]): Promise<SellJoin[]> {
  const confirmed = joins.map((item) => ({ ...item, status: 'confirmed' as const }));
  saveLocalJoins(confirmed);
  const db = getClientFirestore();
  if (db) {
    await Promise.all(
      confirmed.map(async (item) => {
        try {
          await updateDoc(doc(db, COLLECTION, item.id), { status: 'confirmed' });
        } catch {
          try {
            await setDoc(doc(db, COLLECTION, item.id), item);
          } catch {
            // keep local
          }
        }
      }),
    );
  }
  return confirmed;
}
