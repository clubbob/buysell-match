import type { Metadata } from 'next';
import AdminMemberDetail from '@/features/admin/AdminMemberDetail';
import { requireAdminSession } from '@/lib/admin-guard';

export const metadata: Metadata = {
  title: '회원정보',
};

export default async function AdminMemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminSession();
  const { id } = await params;
  return <AdminMemberDetail id={id} />;
}
