import { deleteDocument, getDocument, hasFirebaseAdminConfig, listDocuments, setDocument } from '@/lib/firebase-rest-admin';
import { isSiteInquiryAnswered, toSiteInquiry, type SiteInquiry } from '@/types/site-inquiry';

export async function loadAdminSiteInquiry(id: string): Promise<SiteInquiry | null> {
  if (!hasFirebaseAdminConfig()) return null;
  const data = await getDocument('siteInquiries', id);
  return data ? toSiteInquiry(id, data) : null;
}

export async function loadAdminSiteInquiries(): Promise<SiteInquiry[] | null> {
  if (!hasFirebaseAdminConfig()) return null;
  const docs = await listDocuments('siteInquiries');
  return docs
    .map((entry) => toSiteInquiry(entry.id, entry.data))
    .filter((item): item is SiteInquiry => Boolean(item))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function answerAdminSiteInquiry(id: string, answer: string): Promise<SiteInquiry | null> {
  const data = await getDocument('siteInquiries', id);
  const current = data ? toSiteInquiry(id, data) : null;
  if (!current) return null;

  const next: SiteInquiry = {
    ...current,
    answer: answer.trim(),
    answeredAt: new Date().toISOString(),
  };
  await setDocument('siteInquiries', id, next);
  return next;
}

export function countWaitingSiteInquiries(items: SiteInquiry[]) {
  return items.filter((item) => !isSiteInquiryAnswered(item)).length;
}

export async function deleteAdminSiteInquiry(id: string): Promise<boolean> {
  if (!hasFirebaseAdminConfig()) return false;
  const data = await getDocument('siteInquiries', id);
  if (!data) return false;
  await deleteDocument('siteInquiries', id);
  return true;
}
