'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Logo from '@/components/brand/Logo';
import { getPublicSiteUrl } from '@/lib/site';
import { cn } from '@/lib/utils';

function HomepageLink({ className }: { className: string }) {
  const href = getPublicSiteUrl();

  async function openHomepage(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    try {
      const response = await fetch('/api/admin/open-site', { method: 'POST' });
      const data = (await response.json()) as { ok?: boolean; href?: string; openInClient?: boolean };
      if (data.openInClient) {
        window.open(data.href ?? href, '_blank', 'noopener,noreferrer');
      }
    } catch {
      window.open(href, '_blank', 'noopener,noreferrer');
    }
  }

  return (
    <a href={href} className={className} onClick={(event) => void openHomepage(event)}>
      홈페이지
    </a>
  );
}

const NAV = [
  { href: '/admin/dashboard', label: '대시보드', exact: true },
  { href: '/admin/members', label: '회원정보' },
];

function MenuIcon({ open }: { open: boolean }) {
  return (
    <span className="relative block h-3.5 w-4" aria-hidden>
      <span className={cn('absolute left-0 h-px w-4 bg-white transition-all', open ? 'top-[6px] rotate-45' : 'top-0')} />
      <span className={cn('absolute left-0 top-[6px] h-px w-4 bg-white', open ? 'opacity-0' : 'opacity-100')} />
      <span className={cn('absolute left-0 h-px w-4 bg-white transition-all', open ? 'top-[6px] -rotate-45' : 'top-[12px]')} />
    </span>
  );
}

export default function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const signedIn = pathname !== '/admin';

  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    setMenuOpen(false);
    router.replace('/admin');
    router.refresh();
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
        <Link href={signedIn ? '/admin/dashboard' : '/admin'} className="inline-flex min-h-11 min-w-0 shrink-0 items-center">
          <Logo inverted />
        </Link>

        {signedIn ? (
          <>
            <nav className="hidden h-full items-center md:flex" aria-label="관리자 메뉴">
              {NAV.map((item) => {
                const active = item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link key={item.href} href={item.href} className={navLinkClass(active)}>
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="hidden items-center md:flex">
              <HomepageLink className="px-3 py-2 text-sm text-white/75 hover:text-white" />
              <button type="button" onClick={() => void handleLogout()} className="px-3 py-2 text-sm text-white/75 hover:text-white">
                로그아웃
              </button>
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
          </>
        ) : (
          <span className="px-3 py-2 text-sm text-white/55">관리자</span>
        )}
      </div>

      {signedIn && menuOpen ? (
        <nav className="border-t border-white/15 bg-ink px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden" aria-label="관리자 모바일 메뉴">
          <div className="mx-auto flex max-w-board flex-col">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="flex min-h-11 items-center px-1 text-sm font-medium text-white">
                {item.label}
              </Link>
            ))}
            <HomepageLink className="flex min-h-11 items-center px-1 text-sm text-white/85" />
            <button type="button" onClick={() => void handleLogout()} className="flex min-h-11 items-center px-1 text-left text-sm text-white/85">
              로그아웃
            </button>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
