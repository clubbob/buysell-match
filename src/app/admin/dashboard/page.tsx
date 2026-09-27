import type { Metadata } from 'next';
import AdminDashboard from '@/features/admin/AdminDashboard';
import { requireAdminSession } from '@/lib/admin-guard';

export const metadata: Metadata = {
  title: '대시보드',
};

export default async function AdminDashboardPage() {
  await requireAdminSession();
  return <AdminDashboard />;
}
