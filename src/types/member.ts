import type { BuyerProfile } from '@/types/buyer';
import type { SellerProfile } from '@/types/seller';

export type MemberConsents = {
  termsAgreedAt: string;
  privacyAgreedAt: string;
  marketingAgreed: boolean;
  marketingAgreedAt: string;
};

export type Member = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
} & MemberConsents;

export type SignupConsents = {
  marketingAgreed: boolean;
};

export const EMPTY_MEMBER_CONSENTS: MemberConsents = {
  termsAgreedAt: '',
  privacyAgreedAt: '',
  marketingAgreed: false,
  marketingAgreedAt: '',
};

export function parseMemberConsents(data?: Record<string, unknown> | null): MemberConsents {
  if (!data) return { ...EMPTY_MEMBER_CONSENTS };
  return {
    termsAgreedAt: String(data.termsAgreedAt ?? ''),
    privacyAgreedAt: String(data.privacyAgreedAt ?? ''),
    marketingAgreed: Boolean(data.marketingAgreed),
    marketingAgreedAt: String(data.marketingAgreedAt ?? ''),
  };
}

export function toMember(
  id: string,
  data?: Record<string, unknown> | null,
  fallback: { name?: string; email?: string; createdAt?: string } = {},
): Member {
  return {
    id,
    name: String(data?.name ?? fallback.name ?? ''),
    email: String(data?.email ?? fallback.email ?? ''),
    createdAt: String(data?.createdAt || fallback.createdAt || ''),
    ...parseMemberConsents(data),
  };
}

export function formatMemberJoinedAt(value?: string | null): string {
  if (!value?.trim()) return '';
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  }
  const digits = value.replace(/\D/g, '');
  if (digits.length < 8) return '';
  return `${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6, 8)}`;
}

export function formatMemberDateTime(value?: string | null): string {
  if (!value?.trim()) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  const hour = String(parsed.getHours()).padStart(2, '0');
  const minute = String(parsed.getMinutes()).padStart(2, '0');
  return `${year}.${month}.${day} ${hour}:${minute}`;
}

export function formatConsentStatus(agreedAt?: string | null, agreed = Boolean(agreedAt?.trim())): string {
  if (!agreed) return '미동의';
  const date = formatMemberJoinedAt(agreedAt);
  return date ? `동의 (${date})` : '동의';
}

export type { BuyerProfile };

export type MemberRecord = {
  member: Member;
  buyer: BuyerProfile | null;
  seller: SellerProfile | null;
};
