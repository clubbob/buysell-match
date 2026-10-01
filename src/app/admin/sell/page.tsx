import type { Metadata } from 'next';
import AdminSellListings from '@/features/admin/AdminSellListings';
import { requireAdminSession } from '@/lib/admin-guard';

export const metadata: Metadata = {
  title: '팝니다 관리',
};

export default async function AdminSellPage() {
  await requireAdminSession();
  return <AdminSellListings />;
}
