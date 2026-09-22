import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/site';

export const metadata: Metadata = {
  title: '이용약관',
};

export default function TermsPage() {
  return (
    <article className="panel max-w-3xl px-4 py-6 text-sm leading-relaxed text-muted sm:px-6 sm:py-8">
      <h1 className="text-xl font-bold tracking-tight text-ink">이용약관</h1>
      <p className="mt-4">
        {SITE_NAME}은 통신판매중개 서비스입니다. 결제·정산·배송은 플랫폼이 처리하지 않으며, 거래의 당사자는 판매자와
        구매자입니다.
      </p>
      <p className="mt-3">본문은 서비스 오픈 전에 법률 검토를 거쳐 확정합니다.</p>
    </article>
  );
}
