import Link from 'next/link';
import { SITE_COMPANY, SITE_NAME } from '@/lib/site';

const LEGAL_LINKS = [
  { href: '/terms', label: '이용약관' },
  { href: '/privacy', label: '개인정보처리방침', strong: true },
  { href: '/marketing', label: '마케팅 수신 동의' },
] as const;

function Sep() {
  return (
    <span className="mx-2 select-none text-line" aria-hidden>
      |
    </span>
  );
}

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-slate-50">
      <div className="mx-auto max-w-board px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-center sm:px-6">
        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-sm" aria-label="법적 고지">
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

        <div className="mt-2 space-y-0.5 text-xs leading-5 text-muted">
          <p className="break-words">
            <span className="font-semibold text-ink">{SITE_COMPANY.legalName}</span>
            <Sep />
            통신판매중개자
            <Sep />
            대표 {SITE_COMPANY.representative}
            <Sep />
            사업자등록번호 {SITE_COMPANY.businessNumber}
            <Sep />
            개인정보보호책임자 {SITE_COMPANY.privacyOfficer}
          </p>
          <p className="break-words">
            주소 {SITE_COMPANY.address}
            <Sep />
            이메일 {SITE_COMPANY.email}
            <Sep />
            전화 {SITE_COMPANY.phone}
          </p>
        </div>
        <p className="mt-1 text-xs leading-5 text-subtle">
          © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
