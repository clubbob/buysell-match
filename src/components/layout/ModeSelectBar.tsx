'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/features/auth/auth-context';
import { useUserMode } from '@/features/mode/mode-context';

export default function ModeSelectBar() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const { mode, ready } = useUserMode();

  const onMarketPage = pathname === '/' || pathname.startsWith('/sell') || pathname.startsWith('/buy');

  if (loading || !ready || !user || mode || !onMarketPage) return null;

  return (
    <div className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-board flex-wrap items-center gap-3 px-4 py-2.5 sm:px-6">
        <p className="inline-flex items-center gap-2 text-sm text-ink">
          구매자 또는 판매자 이용 모드를 선택하세요
          <span className="mode-select-arrow" aria-hidden>
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
              <path d="M11.3 4.3a1 1 0 0 1 1.4 0l5 5a1 1 0 0 1 0 1.4l-5 5a1 1 0 1 1-1.4-1.4L14.58 11H3a1 1 0 1 1 0-2h11.58l-3.28-3.3a1 1 0 0 1 0-1.4Z" />
            </svg>
          </span>
        </p>
        <Link
          href="/mypage"
          className="inline-flex h-9 shrink-0 items-center bg-ink px-3.5 text-sm font-semibold text-white hover:bg-ink-hover"
        >
          선택하기
        </Link>
      </div>
    </div>
  );
}
