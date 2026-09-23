import type { Metadata } from 'next';
import SellEditLoader from '@/features/sell/SellEditLoader';

type PageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: '팝니다 수정',
};

export default async function EditSellPage({ params }: PageProps) {
  const { id } = await params;
  return <SellEditLoader id={id} />;
}
