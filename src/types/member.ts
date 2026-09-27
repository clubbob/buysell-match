import type { BuyerProfile } from '@/types/buyer';
import type { SellerProfile } from '@/types/seller';

export type Member = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export type { BuyerProfile };

export type MemberRecord = {
  member: Member;
  buyer: BuyerProfile | null;
  seller: SellerProfile | null;
};
