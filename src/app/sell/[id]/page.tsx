import type { Metadata } from 'next';
import SellDetailLoader from '@/features/sell/SellDetailLoader';
import { getSellListing, SAMPLE_SELL_LISTINGS } from '@/lib/sell-samples';

type PageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return SAMPLE_SELL_LISTINGS.map((item) => ({ id: item.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const item = getSellListing(id);
  return {
    title: item?.title ?? '팝니다',
  };
}

export default async function SellDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <SellDetailLoader id={id} />;
}
