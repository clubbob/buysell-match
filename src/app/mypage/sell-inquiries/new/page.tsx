import type { Metadata } from 'next';
import MyPageGuard from '@/features/mypage/MyPageGuard';
import SellInquiryWrite from '@/features/mypage/SellInquiryWrite';

export const metadata: Metadata = {
  title: '상품 문의',
};

export default async function SellInquiryNewPage({
  searchParams,
}: {
  searchParams: Promise<{ listingId?: string }>;
}) {
  const { listingId = '' } = await searchParams;
  const id = listingId.trim();
  const loginPath = id
    ? `/mypage/sell-inquiries/new?listingId=${encodeURIComponent(id)}`
    : '/mypage?tab=buy';

  return (
    <MyPageGuard loginPath={loginPath}>
      <SellInquiryWrite listingId={id} />
    </MyPageGuard>
  );
}
