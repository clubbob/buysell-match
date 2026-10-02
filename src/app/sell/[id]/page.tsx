import type { Metadata } from 'next';
import { Suspense } from 'react';
import SellDetailLoader from '@/features/sell/SellDetailLoader';
import { loadAdminSellListingTitle } from '@/lib/admin-listings-data';

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string; tab?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const title = await loadAdminSellListingTitle(id);
  return { title: title ?? '판매 상품' };
}

export default async function SellDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { from, tab } = await searchParams;
  return (
    <Suspense fallback={<p className="text-sm text-muted">불러오는 중…</p>}>
      <SellDetailLoader id={id} from={from} tab={tab} />
    </Suspense>
  );
}
