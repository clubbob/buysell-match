export type SellJoinStatus = 'open' | 'confirmed';

export type SellJoin = {
  id: string;
  listingId: string;
  sellerId: string;
  buyerId: string;
  buyerEmail: string;
  buyerName?: string;
  buyerAddress: string;
  quantity: number;
  status: SellJoinStatus;
  createdAt: string;
};

export type OpenJoinSummary = {
  quantity: number;
  buyers: number;
};

export function openJoinTotal(joins: SellJoin[]): number {
  return openJoinSummary(joins).quantity;
}

export function openJoinSummary(joins: SellJoin[]): OpenJoinSummary {
  const open = joins.filter((item) => item.status === 'open');
  return {
    quantity: open.reduce((sum, item) => sum + item.quantity, 0),
    buyers: new Set(open.map((item) => item.buyerId)).size,
  };
}
