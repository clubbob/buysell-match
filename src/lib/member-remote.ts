import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getClientAuth, getClientFirestore } from '@/lib/firebase';
import { EMPTY_MEMBER_CONSENTS, toMember, type Member } from '@/types/member';

const COLLECTION = 'members';

export async function fetchMember(id: string): Promise<Member | null> {
  const db = getClientFirestore();
  if (!db) return null;
  try {
    const snapshot = await getDoc(doc(db, COLLECTION, id));
    if (!snapshot.exists()) return null;
    return toMember(snapshot.id, snapshot.data() as Record<string, unknown>);
  } catch {
    return null;
  }
}

export async function fetchMemberNames(ids: string[]): Promise<Record<string, string>> {
  const unique = [...new Set(ids.filter(Boolean))].slice(0, 40);
  if (unique.length === 0) return {};
  try {
    const token = await getClientAuth()?.currentUser?.getIdToken();
    if (!token) return {};
    const response = await fetch(`/api/members/names?ids=${unique.map(encodeURIComponent).join(',')}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = (await response.json()) as { ok?: boolean; names?: Record<string, string> };
    return data.ok && data.names ? data.names : {};
  } catch {
    return {};
  }
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
