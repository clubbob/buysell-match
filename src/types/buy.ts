export type BuyListing = {
  id: string;
  title: string;
  buyerId: string;
  buyerName: string;
  price: number;
  quantityLabel: string;
  deadline: string;
  description: string;
};

export function toBuyListing(id: string, data: Record<string, unknown>): BuyListing | null {
  if (!data.title || !data.buyerId) return null;
  return {
    id,
    title: String(data.title),
    buyerId: String(data.buyerId),
    buyerName: String(data.buyerName ?? ''),
    price: Number(data.price ?? 0),
    quantityLabel: String(data.quantityLabel ?? ''),
    deadline: String(data.deadline ?? ''),
    description: String(data.description ?? ''),
  };
}
