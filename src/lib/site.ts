export const SITE_NAME = '공구매칭';
export const SITE_TAGLINE = '구매자와 판매자를 연결합니다';

export function getPublicSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (envUrl) return envUrl.replace(/\/+$/, '');
  return 'http://localhost:3000';
}
