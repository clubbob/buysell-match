import type { Metadata } from 'next';
import MyPageGuard from '@/features/mypage/MyPageGuard';
import SellInquiryDetail from '@/features/mypage/SellInquiryDetail';
import { mypageInquiriesHref } from '@/lib/mypage-nav';

export const metadata: Metadata = {
  title: '상품 문의 상세',
};

export default async function SellInquiryDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { id } = await params;
  const { from } = await searchParams;
  const backHref = from === 'mypage' ? mypageInquiriesHref('sell') : mypageInquiriesHref('sell');

  return (
    <MyPageGuard loginPath={`/mypage/sell-inquiries/${id}`}>
      <SellInquiryDetail id={id} backHref={backHref} />
    </MyPageGuard>
  );
}
