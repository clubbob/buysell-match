import type { Metadata } from 'next';
import { Suspense } from 'react';
import AdminSellListings from '@/features/admin/AdminSellListings';
import { requireAdminSession } from '@/lib/admin-guard';

export const metadata: Metadata = {
  title: '판매 상품 관리',
};

export default async function AdminSellPage() {
  await requireAdminSession();
  return (
    <Suspense fallback={<p className="text-sm text-muted">불러오는 중…</p>}>
      <AdminSellListings />
    </Suspense>
  );
}
