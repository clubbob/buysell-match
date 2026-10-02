import type { Metadata } from 'next';
import { Suspense } from 'react';
import SellDetailLoader from '@/features/sell/SellDetailLoader';

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string; tab?: string }>;
};

export const metadata: Metadata = {
  title: '팝니다',
};

export default async function SellDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { from, tab } = await searchParams;
  return (
    <Suspense fallback={<p className="text-sm text-muted">불러오는 중…</p>}>
      <SellDetailLoader id={id} from={from} tab={tab} />
    </Suspense>
  );
}
