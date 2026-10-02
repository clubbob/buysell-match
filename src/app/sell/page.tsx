import type { Metadata } from 'next';
import SellIndexClient from '@/features/sell/SellIndexClient';

export const metadata: Metadata = {
  title: '판매 상품',
};

export default async function SellPage({
  searchParams,
}: {
  searchParams: Promise<{ seller?: string; q?: string; category?: string; sort?: string }>;
}) {
  const { seller, q, category, sort } = await searchParams;
  return <SellIndexClient seller={seller} q={q} category={category} sort={sort} />;
}
