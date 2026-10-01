import { Fragment, type ReactNode } from 'react';
import { SITE_COMPANY } from '@/lib/site';
import { cn } from '@/lib/utils';

function FooterSep() {
  return <span className="shrink-0 text-line" aria-hidden>·</span>;
}

function FooterLine({ items }: { items: ReactNode[] }) {
  return (
    <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
      {items.map((item, index) => (
        <Fragment key={index}>
          {index > 0 ? <FooterSep /> : null}
          <span>{item}</span>
        </Fragment>
      ))}
    </p>
  );
}

export default function CompanyInfo({
  className,
  variant = 'footer',
}: {
  className?: string;
  variant?: 'footer' | 'legal';
}) {
  if (variant === 'legal') {
    return (
      <div className={cn('space-y-1 text-sm text-muted', className)}>
        <p>상호: {SITE_COMPANY.legalName}</p>
        <p>대표자: {SITE_COMPANY.representative}</p>
        <p>주소: {SITE_COMPANY.address}</p>
        <p>사업자등록번호: {SITE_COMPANY.businessNumber}</p>
        <p>통신판매업 신고번호: {SITE_COMPANY.mailOrderRegistration}</p>
        <p>
          이메일:{' '}
          <a href={`mailto:${SITE_COMPANY.email}`} className="text-ink underline-offset-2 hover:underline">
            {SITE_COMPANY.email}
          </a>
        </p>
        <p>전화: {SITE_COMPANY.phone}</p>
        <p>개인정보보호책임자: {SITE_COMPANY.privacyOfficer}</p>
        <p className="pt-1 text-ink">통신판매중개자</p>
      </div>
    );
  }

  return (
    <address className={cn('space-y-1 not-italic text-center text-xs leading-5 text-muted', className)}>
      <FooterLine
        items={[
          <span key="legalName" className="font-semibold text-ink">{SITE_COMPANY.legalName}</span>,
          '통신판매중개자',
          `대표 ${SITE_COMPANY.representative}`,
          `사업자등록번호 ${SITE_COMPANY.businessNumber}`,
          `통신판매업 신고번호 ${SITE_COMPANY.mailOrderRegistration}`,
        ]}
      />
      <FooterLine
        items={[
          `주소 ${SITE_COMPANY.address}`,
          <Fragment key="email">
            이메일{' '}
            <a href={`mailto:${SITE_COMPANY.email}`} className="text-ink hover:underline">
              {SITE_COMPANY.email}
            </a>
          </Fragment>,
          `전화 ${SITE_COMPANY.phone}`,
          <span key="privacyOfficer" className="text-subtle">개인정보보호책임자 {SITE_COMPANY.privacyOfficer}</span>,
        ]}
      />
    </address>
  );
}
