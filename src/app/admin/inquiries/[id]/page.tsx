import type { Metadata } from 'next';
import AdminSiteInquiryDetail from '@/features/admin/AdminSiteInquiryDetail';
import { requireAdminSession } from '@/lib/admin-guard';

export const metadata: Metadata = {
  title: '문의 상세',
};

export default async function AdminInquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminSession();
  const { id } = await params;
  return <AdminSiteInquiryDetail id={id} />;
}
