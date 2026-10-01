import type { Metadata } from 'next';
import AdminBuyListings from '@/features/admin/AdminBuyListings';
import { requireAdminSession } from '@/lib/admin-guard';

export const metadata: Metadata = {
  title: '삽니다 관리',
};

export default async function AdminBuyPage() {
  await requireAdminSession();
  return <AdminBuyListings />;
}
