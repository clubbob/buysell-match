export type SellJoinStatus = 'open' | 'confirmed';

export type SellJoin = {
  id: string;
  listingId: string;
  sellerId: string;
  buyerId: string;
  buyerEmail: string;
  quantity: number;
  status: SellJoinStatus;
  createdAt: string;
};

export function openJoinTotal(joins: SellJoin[]): number {
  return joins.filter((item) => item.status === 'open').reduce((sum, item) => sum + item.quantity, 0);
}
