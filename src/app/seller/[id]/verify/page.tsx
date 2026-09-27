import type { Metadata } from 'next';
import SellerVerifyClient from '@/features/seller/SellerVerifyClient';

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
};

export const metadata: Metadata = {
  title: '사업자 인증',
};

export default async function SellerVerifyPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { from } = await searchParams;
  return <SellerVerifyClient sellerId={id} from={from} />;
}
