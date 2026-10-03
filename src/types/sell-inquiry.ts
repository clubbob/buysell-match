export type SellInquiry = {
  id: string;
  listingId: string;
  sellerId: string;
  buyerId: string;
  buyerName: string;
  question: string;
  answer: string;
  answeredAt: string;
  createdAt: string;
};

export type SellInquiryDetail = SellInquiry & {
  listingTitle: string;
};

export function isInquiryAnswered(item: SellInquiry) {
  return Boolean(item.answer.trim());
}
