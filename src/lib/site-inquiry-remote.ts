import { readApiJson } from '@/lib/api-json';
import { getClientAuth } from '@/lib/firebase';
import type { SiteInquiry, SiteInquiryCategory } from '@/types/site-inquiry';

async function authHeaders(): Promise<HeadersInit> {
  const token = await getClientAuth()?.currentUser?.getIdToken();
  if (!token) throw new Error('로그인 후 이용할 수 있습니다.');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

export async function fetchMySiteInquiries(): Promise<SiteInquiry[]> {
  const headers = await authHeaders();
  const response = await fetch('/api/me/site-inquiries', { headers });
  const data = await readApiJson<{ ok?: boolean; items?: SiteInquiry[]; message?: string }>(
    response,
    '문의 내역을 불러오지 못했습니다.',
  );
  if (!response.ok || !data.ok) {
    throw new Error(data.message ?? '문의 내역을 불러오지 못했습니다.');
  }
  return data.items ?? [];
}

export async function createMySiteInquiry(input: {
  category: SiteInquiryCategory;
  subject: string;
  question: string;
}): Promise<SiteInquiry> {
  const headers = await authHeaders();
  const response = await fetch('/api/me/site-inquiries', {
    method: 'POST',
    headers,
    body: JSON.stringify(input),
  });
  const data = await readApiJson<{ ok?: boolean; item?: SiteInquiry; message?: string }>(
    response,
    '문의를 등록하지 못했습니다.',
  );
  if (!response.ok || !data.ok || !data.item) {
    throw new Error(data.message ?? '문의를 등록하지 못했습니다.');
  }
  return data.item;
}
