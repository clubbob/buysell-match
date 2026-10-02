import type { Metadata } from 'next';
import ContactGuard from '@/features/contact/ContactGuard';
import SiteInquiryDetail from '@/features/contact/SiteInquiryDetail';

export const metadata: Metadata = {
  title: '문의 상세',
};

export default async function ContactDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { id } = await params;
  const { from } = await searchParams;
  const backHref = from === 'mypage' ? '/mypage?tab=inquiries' : '/contact';

  return (
    <ContactGuard>
      <SiteInquiryDetail id={id} backHref={backHref} />
    </ContactGuard>
  );
}
