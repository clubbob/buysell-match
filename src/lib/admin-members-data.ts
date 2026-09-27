import { hasFirebaseAdminConfig, listAuthUsers, listDocuments } from '@/lib/firebase-rest-admin';
import { toBuyerProfile } from '@/types/buyer';
import { EMPTY_MEMBER_CONSENTS, parseMemberConsents, type Member, type MemberRecord } from '@/types/member';
import { toSellerProfile } from '@/types/seller';

type MemberFields = Omit<Member, 'id'>;

function emptyMemberFields(): MemberFields {
  return { name: '', email: '', createdAt: '', ...EMPTY_MEMBER_CONSENTS };
}

export async function loadMemberRecords(): Promise<MemberRecord[] | null> {
  if (!hasFirebaseAdminConfig()) return null;

  const [users, memberDocs, buyerDocs, sellerDocs] = await Promise.all([
    listAuthUsers(),
    listDocuments('members'),
    listDocuments('buyerProfiles'),
    listDocuments('sellerProfiles'),
  ]);

  const members = new Map<string, MemberFields>();
  for (const user of users) {
    members.set(user.uid, {
      ...emptyMemberFields(),
      name: user.displayName,
      email: user.email,
      createdAt: user.createdAt,
    });
  }
  for (const entry of memberDocs) {
    const current = members.get(entry.id) ?? emptyMemberFields();
    members.set(entry.id, {
      name: String(entry.data.name ?? current.name),
      email: String(entry.data.email ?? current.email),
      createdAt: String(entry.data.createdAt || current.createdAt),
      ...parseMemberConsents({ ...current, ...entry.data }),
    });
  }

  const buyers = new Map(buyerDocs.map((entry) => [entry.id, toBuyerProfile(entry.id, entry.data)]));
  const sellers = new Map(sellerDocs.map((entry) => [entry.id, toSellerProfile(entry.id, entry.data)]));
  for (const [id] of buyers) {
    if (!members.has(id)) members.set(id, emptyMemberFields());
  }
  for (const [id, seller] of sellers) {
    if (!members.has(id)) {
      members.set(id, {
        ...emptyMemberFields(),
        name: seller.representativeName || seller.sellerName,
        email: seller.sellerEmail,
      });
    }
  }

  return [...members.entries()]
    .map(([id, member]) => ({
      member: { id, ...member },
      buyer: buyers.get(id) ?? null,
      seller: sellers.get(id) ?? null,
    }))
    .sort((a, b) => b.member.createdAt.localeCompare(a.member.createdAt));
}
