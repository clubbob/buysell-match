import { doc, getDoc, setDoc } from 'firebase/firestore';
import { readApiJson } from '@/lib/api-json';
import { getClientAuth, getClientFirestore } from '@/lib/firebase';
import { EMPTY_MEMBER_CONSENTS, toMember, type Member } from '@/types/member';

async function authHeaders(): Promise<HeadersInit> {
  const token = await getClientAuth()?.currentUser?.getIdToken();
  if (!token) throw new Error('로그인 후 이용할 수 있습니다.');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

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

export async function fetchMyMember(): Promise<Member> {
  const headers = await authHeaders();
  const response = await fetch('/api/me/member', { headers });
  const data = await readApiJson<{ ok?: boolean; member?: Member; message?: string }>(
    response,
    '회원 정보를 불러오지 못했습니다.',
  );
  if (!response.ok || !data.ok || !data.member) {
    throw new Error(data.message ?? '회원 정보를 불러오지 못했습니다.');
  }
  return data.member;
}

export async function saveMyMarketingConsent(marketingAgreed: boolean): Promise<Member> {
  const headers = await authHeaders();
  const response = await fetch('/api/me/member', {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ marketingAgreed }),
  });
  const data = await readApiJson<{ ok?: boolean; member?: Member; message?: string }>(
    response,
    '마케팅 수신 동의를 저장하지 못했습니다.',
  );
  if (!response.ok || !data.ok || !data.member) {
    throw new Error(data.message ?? '마케팅 수신 동의를 저장하지 못했습니다.');
  }
  return data.member;
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
