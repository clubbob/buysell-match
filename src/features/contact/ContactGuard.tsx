'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/features/auth/auth-context';
import { loginHref } from '@/lib/auth-redirect';

export default function ContactGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) router.replace(loginHref('/contact'));
  }, [loading, user, router]);

  if (loading || !user) {
    return <p className="text-sm text-muted">불러오는 중…</p>;
  }

  return children;
}
