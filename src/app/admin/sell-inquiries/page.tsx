import type { Metadata } from 'next';
import { Suspense } from 'react';
import AdminSellInquiries from '@/features/admin/AdminSellInquiries';
import { requireAdminSession } from '@/lib/admin-guard';

export const metadata: Metadata = {
  title: '상품 문의',
};

export default async function AdminSellInquiriesPage() {
  await requireAdminSession();
  return (
    <Suspense fallback={<p className="text-sm text-muted">불러오는 중…</p>}>
      <AdminSellInquiries />
    </Suspense>
  );
}
