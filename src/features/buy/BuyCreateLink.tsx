'use client';

import Link from 'next/link';
import { useAuth } from '@/features/auth/auth-context';
import { useUserMode } from '@/features/mode/mode-context';
import { loginHref } from '@/lib/auth-redirect';

export default function BuyCreateLink() {
  const { user } = useAuth();
  const { mode, ready } = useUserMode();
  const showBuyCreate = ready && (!user || mode === 'buyer');

  if (!showBuyCreate) return null;

  return (
    <Link href={user ? '/buy/new' : loginHref('buyer')} className="btn-primary">
      삽니다 등록
    </Link>
  );
}
