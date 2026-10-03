import type { Metadata } from 'next';
import AdminSellInquiryDetail from '@/features/admin/AdminSellInquiryDetail';
import { requireAdminSession } from '@/lib/admin-guard';

export const metadata: Metadata = {
  title: '상품 문의 상세',
};

export default async function AdminSellInquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminSession();
  const { id } = await params;
  return <AdminSellInquiryDetail id={id} />;
}
