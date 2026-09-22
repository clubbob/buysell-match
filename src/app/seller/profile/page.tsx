import type { Metadata } from 'next';
import { Suspense } from 'react';
import PageBack from '@/components/ui/PageBack';
import PageIntro from '@/components/ui/PageIntro';
import SellerProfileForm from '@/features/seller/SellerProfileForm';

export const metadata: Metadata = {
  title: '판매자 정보',
};

export default function SellerProfilePage() {
  return (
    <div className="space-y-5">
      <PageBack href="/mypage">← 마이페이지</PageBack>
      <article className="panel px-4 py-6 sm:px-6 sm:py-8">
        <PageIntro title="판매자 정보" description="사업자등록번호를 검증한 뒤 상호와 연락처를 등록합니다. 계속사업자로 조회된 경우에만 저장할 수 있습니다." />
        <Suspense fallback={<p className="mt-6 text-sm text-muted">불러오는 중…</p>}>
          <SellerProfileForm />
        </Suspense>
      </article>
    </div>
  );
}
