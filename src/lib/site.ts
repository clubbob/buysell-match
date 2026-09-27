export const SITE_NAME = '공구매칭';
export const SITE_TAGLINE = '구매자와 판매자를 연결합니다';

export const SITE_COMPANY = {
  legalName: '주식회사 공구매칭',
  representative: '김하준',
  address: '서울특별시 성동구 왕십리로 125, 4층 (성수동1가)',
  email: 'help@gonggumatch.co.kr',
  phone: '02-1234-5678',
  businessNumber: '123-45-67890',
  privacyOfficer: '이서연',
};

export function getPublicSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (envUrl) return envUrl.replace(/\/+$/, '');
  return 'http://localhost:3000';
}
