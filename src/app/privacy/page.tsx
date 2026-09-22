import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/site';

export const metadata: Metadata = {
  title: '개인정보처리방침',
};

export default function PrivacyPage() {
  return (
    <article className="panel max-w-3xl px-4 py-6 text-sm leading-relaxed text-muted sm:px-6 sm:py-8">
      <h1 className="text-xl font-bold tracking-tight text-ink">개인정보처리방침</h1>
      <p className="mt-4">
        {SITE_NAME}은 회원가입 시 이메일과 비밀번호만 수집합니다. 비밀번호는 Firebase Authentication이 보관하며, 서비스
        운영자가 평문으로 조회하지 않습니다.
      </p>
      <p className="mt-3">본문은 서비스 오픈 전에 확정합니다.</p>
    </article>
  );
}
