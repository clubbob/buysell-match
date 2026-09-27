import type { BuyerProfile } from '@/types/buyer';
import type { SellerProfile } from '@/types/seller';

export type Member = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

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

export type { BuyerProfile };

export type MemberRecord = {
  member: Member;
  buyer: BuyerProfile | null;
  seller: SellerProfile | null;
};
