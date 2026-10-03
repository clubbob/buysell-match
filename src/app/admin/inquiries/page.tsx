import type { Metadata } from 'next';
import { Suspense } from 'react';
import AdminSiteInquiries from '@/features/admin/AdminSiteInquiries';
import { requireAdminSession } from '@/lib/admin-guard';

export const metadata: Metadata = {
  title: '서비스 문의',
};

export default async function AdminInquiriesPage() {
  await requireAdminSession();
  return (
    <Suspense fallback={<p className="text-sm text-muted">불러오는 중…</p>}>
      <AdminSiteInquiries />
    </Suspense>
  );
}
