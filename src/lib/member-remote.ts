import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getClientFirestore } from '@/lib/firebase';
import { EMPTY_MEMBER_CONSENTS, toMember, type Member } from '@/types/member';

const COLLECTION = 'members';

export async function fetchMember(id: string): Promise<Member | null> {
  const db = getClientFirestore();
  if (!db) return null;
  const snapshot = await getDoc(doc(db, COLLECTION, id));
  if (!snapshot.exists()) return null;
  return toMember(snapshot.id, snapshot.data() as Record<string, unknown>);
}

export async function saveMember(member: Member): Promise<Member> {
  const db = getClientFirestore();
  if (!db) throw new Error('Firestore가 연결되지 않았습니다.');
  await setDoc(doc(db, COLLECTION, member.id), member, { merge: true });
  return member;
}

export async function ensureMember(input: {
  id: string;
  name?: string | null;
  email?: string | null;
}): Promise<void> {
  const existing = await fetchMember(input.id);
  const name = (input.name ?? '').trim() || existing?.name || '';
  const email = (input.email ?? '').trim() || existing?.email || '';
  if (existing?.name && existing.email) return;
  await saveMember({
    id: input.id,
    name,
    email,
    createdAt: existing?.createdAt || new Date().toISOString(),
    termsAgreedAt: existing?.termsAgreedAt ?? EMPTY_MEMBER_CONSENTS.termsAgreedAt,
    privacyAgreedAt: existing?.privacyAgreedAt ?? EMPTY_MEMBER_CONSENTS.privacyAgreedAt,
    marketingAgreed: existing?.marketingAgreed ?? EMPTY_MEMBER_CONSENTS.marketingAgreed,
    marketingAgreedAt: existing?.marketingAgreedAt ?? EMPTY_MEMBER_CONSENTS.marketingAgreedAt,
  });
}
