import type { Metadata } from 'next';
import PageBack from '@/components/ui/PageBack';
import PageIntro from '@/components/ui/PageIntro';
import ChangePasswordForm from '@/features/auth/ChangePasswordForm';

export const metadata: Metadata = {
  title: '비밀번호 변경',
};

export default function ChangePasswordPage() {
  return (
    <div className="space-y-5">
      <PageBack href="/mypage">← 마이페이지</PageBack>
      <article className="panel px-4 py-6 sm:px-6 sm:py-8">
        <PageIntro title="비밀번호 변경" description="현재 비밀번호를 확인한 뒤 새 비밀번호로 바꿉니다." />
        <ChangePasswordForm />
      </article>
    </div>
  );
}
