import type { Metadata } from 'next';
import { Suspense } from 'react';
import AdminMembers from '@/features/admin/AdminMembers';
import { requireAdminSession } from '@/lib/admin-guard';

export const metadata: Metadata = {
  title: '회원정보',
};

export default async function AdminMembersPage() {
  await requireAdminSession();
  return (
    <Suspense fallback={<p className="text-sm text-muted">불러오는 중…</p>}>
      <AdminMembers />
    </Suspense>
  );
}
