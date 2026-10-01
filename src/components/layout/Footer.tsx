import Link from 'next/link';
import CompanyInfo from '@/components/legal/CompanyInfo';
import IntermediaryNotice from '@/components/legal/IntermediaryNotice';
import { SITE_COMPANY } from '@/lib/site';

const LEGAL_LINKS: { href: string; label: string; strong?: boolean }[] = [
  { href: '/terms', label: '이용약관' },
  { href: '/privacy', label: '개인정보처리방침', strong: true },
  { href: '/dispute', label: '분쟁 해결 안내' },
  { href: '/contact', label: '문의하기' },
  { href: '/marketing', label: '마케팅 수신 동의' },
];

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-slate-50">
      <div className="mx-auto max-w-board px-4 py-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6">
        <nav
          className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-sm"
          aria-label="법적 고지"
        >
          {LEGAL_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={item.strong ? 'font-semibold text-ink hover:underline' : 'font-medium text-ink hover:underline'}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <CompanyInfo className="mt-3" />

        <IntermediaryNotice variant="footer" className="mx-auto mt-3 max-w-3xl text-center" />

        <p className="mt-2 text-center text-xs leading-5 text-subtle">
          © {new Date().getFullYear()} {SITE_COMPANY.legalName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
