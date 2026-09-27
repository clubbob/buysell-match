import type { Metadata } from 'next';
import PageIntro from '@/components/ui/PageIntro';
import { requireAdminSession } from '@/lib/admin-guard';

export const metadata: Metadata = {
  title: '대시보드',
};

export default async function AdminDashboardPage() {
  await requireAdminSession();

  return (
    <div className="space-y-5">
      <PageIntro title="대시보드" description="관리자 현황을 확인합니다." />
      <section className="panel px-4 py-6 sm:px-6">
        <p className="text-sm text-muted">대시보드 항목은 이후에 이어서 넣습니다.</p>
      </section>
    </div>
  );
}
