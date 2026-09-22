import type { Metadata } from 'next';
import SellIndexClient from '@/features/sell/SellIndexClient';

export const metadata: Metadata = {
  title: '팝니다',
};

export default async function SellPage({
  searchParams,
}: {
  searchParams: Promise<{ seller?: string }>;
}) {
  const { seller } = await searchParams;
  return <SellIndexClient seller={seller} />;
}
