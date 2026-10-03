import type { Metadata } from 'next';
import { Suspense } from 'react';
import AdminSellJoins from '@/features/admin/AdminSellJoins';
import { requireAdminSession } from '@/lib/admin-guard';

export const metadata: Metadata = {
  title: '구매 신청 현황',
};

export default async function AdminJoinsPage() {
  await requireAdminSession();
  return (
    <Suspense fallback={<p className="text-sm text-muted">불러오는 중…</p>}>
      <AdminSellJoins />
    </Suspense>
  );
}
