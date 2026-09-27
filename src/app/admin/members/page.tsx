import type { Metadata } from 'next';
import AdminMembers from '@/features/admin/AdminMembers';
import { requireAdminSession } from '@/lib/admin-guard';

export const metadata: Metadata = {
  title: '회원정보',
};

export default async function AdminMembersPage() {
  await requireAdminSession();
  return <AdminMembers />;
}
