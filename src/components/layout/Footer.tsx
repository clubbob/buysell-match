import Link from 'next/link';
import { SITE_NAME } from '@/lib/site';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-white">
      <div className="mx-auto grid max-w-board items-center gap-3 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:grid-cols-[1fr_auto] sm:px-6">
        <div className="space-y-1">
          <p className="text-sm font-bold text-ink">{SITE_NAME}</p>
          <p className="max-w-xl text-xs leading-relaxed text-muted">
            통신판매중개자이며 결제·정산·배송의 당사자가 아닙니다. 거래 조건과 이행은 판매자와 구매자 사이에서
            이루어집니다.
          </p>
          <p className="text-xs text-subtle">© {new Date().getFullYear()} {SITE_NAME}</p>
        </div>
        <nav className="flex flex-col sm:items-end" aria-label="법적 고지">
          <Link href="/terms" className="inline-flex min-h-10 items-center text-sm font-medium text-ink hover:underline sm:min-h-0 sm:py-0.5">
            이용약관
          </Link>
          <Link href="/privacy" className="inline-flex min-h-10 items-center text-sm font-medium text-ink hover:underline sm:min-h-0 sm:py-0.5">
            개인정보처리방침
          </Link>
        </nav>
      </div>
    </footer>
  );
}
