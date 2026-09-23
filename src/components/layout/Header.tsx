'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Logo from '@/components/brand/Logo';
import { useAuth } from '@/features/auth/auth-context';
import { useUserMode } from '@/features/mode/mode-context';
import { getHeaderNavItems, USER_MODE_LABELS } from '@/lib/user-mode';
import { cn } from '@/lib/utils';

function isNavActive(pathname: string, href: string, exact?: boolean): boolean {
  if (exact || href === '/') return pathname === href;
  if (href === '/sell' && (pathname.startsWith('/sell/new') || pathname.endsWith('/edit'))) return false;
  if (href === '/buy' && pathname.startsWith('/buy/new')) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <span className="relative block h-3.5 w-4" aria-hidden>
      <span
        className={cn(
          'absolute left-0 h-px w-4 bg-white transition-all',
          open ? 'top-[6px] rotate-45' : 'top-0',
        )}
      />
      <span className={cn('absolute left-0 top-[6px] h-px w-4 bg-white', open ? 'opacity-0' : 'opacity-100')} />
      <span
        className={cn(
          'absolute left-0 h-px w-4 bg-white transition-all',
          open ? 'top-[6px] -rotate-45' : 'top-[12px]',
        )}
      />
    </span>
  );
}

export default function Header() {
  const { user, logout } = useAuth();
  const { mode } = useUserMode();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const isLoggedIn = Boolean(user);
  const navItems = getHeaderNavItems(mode, isLoggedIn);

  async function handleLogout() {
    await logout();
    setMenuOpen(false);
  }

  const navLinkClass = (active: boolean) =>
    cn(
      'relative px-3 py-2 text-sm font-medium transition-colors',
      active
        ? 'text-white after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-white'
        : 'text-white/70 hover:text-white',
    );

  return (
    <header className="bg-ink text-white">
      <div className="mx-auto flex h-14 max-w-board items-center justify-between gap-3 px-4 sm:h-16 sm:gap-4 sm:px-6">
        <Link href="/" className="inline-flex min-h-11 min-w-0 shrink-0 items-center">
          <Logo inverted />
        </Link>

        <nav className="hidden h-full items-center md:flex" aria-label="주요 메뉴">
          {navItems.map((item) => {
            const active = isNavActive(pathname, item.href, item.exact);
            return (
              <Link key={`${item.href}-${item.label}`} href={item.href} className={navLinkClass(active)}>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-1 md:flex">
          {isLoggedIn ? (
            <>
              {mode ? <span className="px-3 py-2 text-sm text-white/55">{USER_MODE_LABELS[mode]}</span> : null}
              <Link href="/mypage" className="px-3 py-2 text-sm text-white/75 hover:text-white">
                마이페이지
              </Link>
              <button type="button" onClick={handleLogout} className="px-3 py-2 text-sm text-white/75 hover:text-white">
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="px-3 py-2 text-sm text-white/80 hover:text-white">
                로그인
              </Link>
              <Link
                href="/signup"
                className="ml-1 inline-flex h-9 items-center bg-white px-3.5 text-sm font-semibold text-ink hover:bg-slate-100"
              >
                회원가입
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center border border-white/25 md:hidden"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <MenuIcon open={menuOpen} />
        </button>
      </div>

      {menuOpen ? (
        <nav className="border-t border-white/15 bg-ink px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden" aria-label="모바일 메뉴">
          <div className="mx-auto flex max-w-board flex-col">
            {navItems.map((item) => (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
                className="flex min-h-11 items-center px-1 text-sm font-medium text-white"
              >
                {item.label}
              </Link>
            ))}

            {isLoggedIn ? (
              <>
                {mode ? (
                  <p className="flex min-h-11 items-center px-1 text-sm text-white/55">{USER_MODE_LABELS[mode]}</p>
                ) : null}
                <Link href="/mypage" className="flex min-h-11 items-center px-1 text-sm text-white/85">
                  마이페이지
                </Link>
                <p className="break-all px-1 pt-2 text-xs text-white/55">{user?.email}</p>
                <button type="button" onClick={handleLogout} className="flex min-h-11 items-center px-1 text-left text-sm text-white/85">
                  로그아웃
                </button>
              </>
            ) : (
              <div className="mt-3 grid grid-cols-1 gap-2">
                <Link href="/login" className="btn-secondary w-full">
                  로그인
                </Link>
                <Link href="/signup" className="inline-flex min-h-11 items-center justify-center bg-white text-sm font-semibold text-ink">
                  회원가입
                </Link>
              </div>
            )}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
