export const SITE_NAME = '공구매칭';
export const SITE_TAGLINE = '구매자와 판매자를 연결합니다';

function companyEnv(key: string, fallback: string): string {
  const value = process.env[key]?.trim();
  return value || fallback;
}

/** 사이트 하단·약관에 표시하는 운영 사업자 정보. `.env.local`의 NEXT_PUBLIC_COMPANY_* 로 바꿀 수 있습니다. */
export const SITE_COMPANY = {
  legalName: companyEnv('NEXT_PUBLIC_COMPANY_LEGAL_NAME', '새봄인터내셔널'),
  representative: companyEnv('NEXT_PUBLIC_COMPANY_REPRESENTATIVE', '박진희'),
  address: companyEnv(
    'NEXT_PUBLIC_COMPANY_ADDRESS',
    '서울특별시 서초구 신반포로 20, 110동 201호',
  ),
  email: companyEnv('NEXT_PUBLIC_COMPANY_EMAIL', 'clubbob@naver.com'),
  phone: companyEnv('NEXT_PUBLIC_COMPANY_PHONE', '010-6391-4520'),
  businessNumber: companyEnv('NEXT_PUBLIC_COMPANY_BUSINESS_NUMBER', '129-09-53285'),
  /** 통신판매중개자는 통신판매업 신고 면제 */
  mailOrderRegistration: companyEnv('NEXT_PUBLIC_COMPANY_MAIL_ORDER_REGISTRATION', '신고 면제'),
  privacyOfficer: companyEnv('NEXT_PUBLIC_COMPANY_PRIVACY_OFFICER', '고형석'),
};

export function getPublicSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (envUrl) return envUrl.replace(/\/+$/, '');
  return 'http://localhost:3000';
}
