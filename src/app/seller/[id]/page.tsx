import type { Metadata } from 'next';
import SellerReviewsClient from '@/features/seller/SellerReviewsClient';

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
};

export const metadata: Metadata = {
  title: '구매자 후기',
};

export default async function SellerReviewsPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { from } = await searchParams;
  return <SellerReviewsClient sellerId={id} from={from} />;
}
