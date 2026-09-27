import type { Metadata } from 'next';
import SellDetailLoader from '@/features/sell/SellDetailLoader';

type PageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: '팝니다',
};

export default async function SellDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <SellDetailLoader id={id} />;
}
