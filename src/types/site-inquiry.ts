export type SiteInquiryCategory = 'service' | 'account' | 'trade' | 'other';

export const SITE_INQUIRY_CATEGORY_LABELS: Record<SiteInquiryCategory, string> = {
  service: '이용·기능',
  account: '계정·회원',
  trade: '거래·분쟁',
  other: '기타',
};

export type SiteInquiry = {
  id: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  category: SiteInquiryCategory;
  subject: string;
  question: string;
  answer: string;
  answeredAt: string;
  createdAt: string;
};

export function isSiteInquiryCategory(value: unknown): value is SiteInquiryCategory {
  return value === 'service' || value === 'account' || value === 'trade' || value === 'other';
}

export function toSiteInquiry(id: string, data: Record<string, unknown>): SiteInquiry | null {
  if (!data.memberId || !data.subject || !data.question) return null;
  const category = isSiteInquiryCategory(data.category) ? data.category : 'other';
  return {
    id,
    memberId: String(data.memberId),
    memberName: String(data.memberName ?? ''),
    memberEmail: String(data.memberEmail ?? ''),
    category,
    subject: String(data.subject),
    question: String(data.question),
    answer: String(data.answer ?? ''),
    answeredAt: String(data.answeredAt ?? ''),
    createdAt: String(data.createdAt ?? ''),
  };
}

export function isSiteInquiryAnswered(item: SiteInquiry) {
  return Boolean(item.answer.trim());
}
