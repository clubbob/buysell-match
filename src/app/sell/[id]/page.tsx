import type { Metadata } from 'next';
import SellDetailLoader from '@/features/sell/SellDetailLoader';

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
};

export const metadata: Metadata = {
  title: '팝니다',
};

export default async function SellDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { from } = await searchParams;
  return <SellDetailLoader id={id} from={from} />;
}
