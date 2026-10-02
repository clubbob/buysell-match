import type { Metadata } from 'next';
import AdminSellListings from '@/features/admin/AdminSellListings';
import { requireAdminSession } from '@/lib/admin-guard';

export const metadata: Metadata = {
  title: '판매 상품 관리',
};

export default async function AdminSellPage() {
  await requireAdminSession();
  return <AdminSellListings />;
}
