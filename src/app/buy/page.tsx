import type { Metadata } from 'next';
import BuyIndexClient from '@/features/buy/BuyIndexClient';

export const metadata: Metadata = {
  title: '삽니다',
};

export default async function BuyPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  return <BuyIndexClient q={q} />;
}
