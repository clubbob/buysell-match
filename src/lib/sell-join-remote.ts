import { collection, deleteField, doc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { getClientFirestore } from '@/lib/firebase';
import { loadLocalJoins, saveLocalJoin, saveLocalJoins } from '@/lib/sell-join-store';
import { joinListSummary, normalizeSellJoin, type JoinListSummary, type SellJoin } from '@/types/sell-join';

const COLLECTION = 'sellJoins';

function toJoin(id: string, data: Record<string, unknown>): SellJoin | null {
  if (!data.listingId || !data.buyerId || !data.quantity) return null;
  return {
    id,
    listingId: String(data.listingId),
    sellerId: String(data.sellerId ?? ''),
    buyerId: String(data.buyerId),
    buyerEmail: String(data.buyerEmail ?? ''),
    buyerName: String(data.buyerName ?? ''),
    buyerAddress: String(data.buyerAddress ?? ''),
    quantity: Number(data.quantity) || 0,
    status: data.status === 'confirmed' ? 'confirmed' : 'open',
    createdAt: String(data.createdAt ?? ''),
    confirmedAt: data.confirmedAt ? String(data.confirmedAt) : undefined,
    paymentStatus: data.paymentStatus === 'paid' ? 'paid' : data.paymentStatus === 'pending' ? 'pending' : undefined,
    paidAt: data.paidAt ? String(data.paidAt) : undefined,
    shippingStatus: data.shippingStatus === 'shipped' ? 'shipped' : data.shippingStatus === 'pending' ? 'pending' : undefined,
    shippedAt: data.shippedAt ? String(data.shippedAt) : undefined,
  };
}

function mergeJoins(remote: SellJoin[], local: SellJoin[]): SellJoin[] {
  const map = new Map<string, SellJoin>();
  for (const item of [...local, ...remote]) map.set(item.id, item);
  return [...map.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function finalizeJoins(joins: SellJoin[]): SellJoin[] {
  const next = joins.map(normalizeSellJoin);
  const backfilled = next.filter((join, index) => join !== joins[index]);
  if (backfilled.length > 0) saveLocalJoins(backfilled);
  return next;
}

export async function fetchSellJoins(listingId: string): Promise<SellJoin[]> {
  const local = loadLocalJoins(listingId);
  const db = getClientFirestore();
  if (!db) return finalizeJoins(local);

  try {
    const snapshot = await getDocs(query(collection(db, COLLECTION), where('listingId', '==', listingId)));
    const remote = snapshot.docs
      .map((entry) => toJoin(entry.id, entry.data() as Record<string, unknown>))
      .filter((item): item is SellJoin => Boolean(item));
    return finalizeJoins(mergeJoins(remote, local));
  } catch {
    return finalizeJoins(local);
  }
}

export async function fetchSellJoinsBySeller(sellerId: string): Promise<SellJoin[]> {
  const local = loadLocalJoins().filter((item) => item.sellerId === sellerId);
  const db = getClientFirestore();
  if (!db) return finalizeJoins(local);

  try {
    const snapshot = await getDocs(query(collection(db, COLLECTION), where('sellerId', '==', sellerId)));
    const remote = snapshot.docs
      .map((entry) => toJoin(entry.id, entry.data() as Record<string, unknown>))
      .filter((item): item is SellJoin => Boolean(item));
    return finalizeJoins(mergeJoins(remote, local));
  } catch {
    return finalizeJoins(local);
  }
}

export async function fetchJoinListSummaries(listingIds: string[]): Promise<Record<string, JoinListSummary>> {
  const unique = [...new Set(listingIds.filter(Boolean))];
  const entries = await Promise.all(
    unique.map(async (id) => [id, joinListSummary(await fetchSellJoins(id))] as const),
  );
  return Object.fromEntries(entries);
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
  const confirmedAt = new Date().toISOString();
  const confirmed = joins.map((item) => ({
    ...item,
    status: 'confirmed' as const,
    confirmedAt,
    paymentStatus: 'pending' as const,
  }));
  saveLocalJoins(confirmed);
  const db = getClientFirestore();
  if (db) {
    await Promise.all(
      confirmed.map(async (item) => {
        try {
          await updateDoc(doc(db, COLLECTION, item.id), {
            status: 'confirmed',
            confirmedAt,
            paymentStatus: 'pending',
          });
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

export async function markSellJoinPaid(join: SellJoin): Promise<SellJoin> {
  const paidAt = new Date().toISOString();
  const updated: SellJoin = { ...join, paymentStatus: 'paid', paidAt, shippingStatus: 'pending' };
  saveLocalJoin(updated);
  const db = getClientFirestore();
  if (db) {
    try {
      await updateDoc(doc(db, COLLECTION, join.id), { paymentStatus: 'paid', paidAt, shippingStatus: 'pending' });
    } catch {
      try {
        await setDoc(doc(db, COLLECTION, join.id), updated);
      } catch {
        // keep local
      }
    }
  }
  return updated;
}

export async function markSellJoinPending(join: SellJoin): Promise<SellJoin> {
  const updated: SellJoin = { ...join, paymentStatus: 'pending' };
  delete updated.paidAt;
  delete updated.shippedAt;
  delete updated.shippingStatus;
  saveLocalJoin(updated);
  const db = getClientFirestore();
  if (db) {
    try {
      await updateDoc(doc(db, COLLECTION, join.id), {
        paymentStatus: 'pending',
        paidAt: deleteField(),
        shippingStatus: deleteField(),
        shippedAt: deleteField(),
      });
    } catch {
      try {
        await setDoc(doc(db, COLLECTION, join.id), updated);
      } catch {
        // keep local
      }
    }
  }
  return updated;
}

export async function markSellJoinShipped(join: SellJoin): Promise<SellJoin> {
  const shippedAt = new Date().toISOString();
  const updated: SellJoin = { ...join, shippingStatus: 'shipped', shippedAt };
  saveLocalJoin(updated);
  const db = getClientFirestore();
  if (db) {
    try {
      await updateDoc(doc(db, COLLECTION, join.id), { shippingStatus: 'shipped', shippedAt });
    } catch {
      try {
        await setDoc(doc(db, COLLECTION, join.id), updated);
      } catch {
        // keep local
      }
    }
  }
  return updated;
}

export async function markSellJoinShippingPending(join: SellJoin): Promise<SellJoin> {
  const updated: SellJoin = { ...join, shippingStatus: 'pending' };
  delete updated.shippedAt;
  saveLocalJoin(updated);
  const db = getClientFirestore();
  if (db) {
    try {
      await updateDoc(doc(db, COLLECTION, join.id), { shippingStatus: 'pending', shippedAt: deleteField() });
    } catch {
      try {
        await setDoc(doc(db, COLLECTION, join.id), updated);
      } catch {
        // keep local
      }
    }
  }
  return updated;
}
