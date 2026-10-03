import { deleteAdminSellListing } from '@/lib/admin-listings-data';
import {
  deleteDocument,
  hasFirebaseAdminConfig,
  listAuthUsers,
  listDocuments,
  queryDocumentIds,
} from '@/lib/firebase-rest-admin';
import { toBuyerProfile } from '@/types/buyer';
import { EMPTY_MEMBER_CONSENTS, parseMemberConsents, type Member, type MemberRecord } from '@/types/member';
import { toSellerProfile } from '@/types/seller';

type MemberFields = Omit<Member, 'id'>;

function emptyMemberFields(): MemberFields {
  return { name: '', email: '', createdAt: '', ...EMPTY_MEMBER_CONSENTS };
}

export type AdminMemberActivity = {
  listings: number;
  joinAsBuyer: number;
  sellInquiriesAsBuyer: number;
  siteInquiries: number;
};

export async function loadAdminMemberActivity(memberId: string): Promise<AdminMemberActivity> {
  const [listingIds, buyerJoinIds, buyerInquiryIds, siteInquiryIds] = await Promise.all([
    queryDocumentIds('sellListings', 'sellerId', memberId),
    queryDocumentIds('sellJoins', 'buyerId', memberId),
    queryDocumentIds('sellInquiries', 'buyerId', memberId),
    queryDocumentIds('siteInquiries', 'memberId', memberId),
  ]);
  return {
    listings: listingIds.length,
    joinAsBuyer: buyerJoinIds.length,
    sellInquiriesAsBuyer: buyerInquiryIds.length,
    siteInquiries: siteInquiryIds.length,
  };
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

async function deleteMany(collection: string, ids: string[]) {
  const unique = [...new Set(ids.filter(Boolean))];
  await Promise.all(unique.map((id) => deleteDocument(collection, id)));
}

export async function deleteAdminMember(memberId: string): Promise<void> {
  const listingIds = await queryDocumentIds('sellListings', 'sellerId', memberId);
  for (const listingId of listingIds) {
    await deleteAdminSellListing(listingId);
  }

  const [buyerJoinIds, sellerJoinIds, buyerInquiryIds, sellerInquiryIds, buyerReviewIds, siteInquiryIds] =
    await Promise.all([
      queryDocumentIds('sellJoins', 'buyerId', memberId),
      queryDocumentIds('sellJoins', 'sellerId', memberId),
      queryDocumentIds('sellInquiries', 'buyerId', memberId),
      queryDocumentIds('sellInquiries', 'sellerId', memberId),
      queryDocumentIds('sellerReviews', 'buyerId', memberId),
      queryDocumentIds('siteInquiries', 'memberId', memberId),
    ]);

  await Promise.all([
    deleteMany('sellJoins', [...buyerJoinIds, ...sellerJoinIds]),
    deleteMany('sellInquiries', [...buyerInquiryIds, ...sellerInquiryIds]),
    deleteMany('sellerReviews', buyerReviewIds),
    deleteMany('siteInquiries', siteInquiryIds),
    deleteDocument('members', memberId),
    deleteDocument('buyerProfiles', memberId),
    deleteDocument('sellerProfiles', memberId),
  ]);
}
