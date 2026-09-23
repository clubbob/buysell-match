import type { Metadata } from 'next';
import { Suspense } from 'react';
import AuthForm from '@/features/auth/AuthForm';

export const metadata: Metadata = {
  title: '로그인',
};

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="py-10 text-center text-sm text-muted">불러오는 중…</p>}>
      <AuthForm mode="login" />
    </Suspense>
  );
}
