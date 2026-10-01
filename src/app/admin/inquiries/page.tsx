import type { Metadata } from 'next';
import AdminSiteInquiries from '@/features/admin/AdminSiteInquiries';
import { requireAdminSession } from '@/lib/admin-guard';

export const metadata: Metadata = {
  title: '문의하기 관리',
};

export default async function AdminInquiriesPage() {
  await requireAdminSession();
  return <AdminSiteInquiries />;
}
