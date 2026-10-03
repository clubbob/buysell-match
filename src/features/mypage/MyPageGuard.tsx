'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/features/auth/auth-context';
import { loginHref } from '@/lib/auth-redirect';

export default function MyPageGuard({ children, loginPath = '/mypage' }: { children: React.ReactNode; loginPath?: string }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) router.replace(loginHref(loginPath));
  }, [loading, user, router, loginPath]);

  if (loading || !user) {
    return <p className="text-sm text-muted">불러오는 중…</p>;
  }

  return children;
}
