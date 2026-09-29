export const SELL_SOURCE_TYPES = ['online', 'youtube', 'both'] as const;

export type SellSourceType = (typeof SELL_SOURCE_TYPES)[number];

export const SELL_SOURCE_LABELS: Record<SellSourceType, string> = {
  online: '온라인 판매',
  youtube: '유튜브',
  both: '온라인 판매 · 유튜브',
};

export function parseSellSourceType(value: unknown): SellSourceType {
  if (value === 'youtube' || value === 'both') return value;
  return 'online';
}

export function sourceTypeFromUrls(hasOnline: boolean, youtubeUrl: string): SellSourceType {
  const youtube = Boolean(youtubeUrl.trim());
  if (hasOnline && youtube) return 'both';
  if (youtube) return 'youtube';
  return 'online';
}

export type ShopUrlFields = {
  coupangUrl?: string;
  smartstoreUrl?: string;
  productUrl?: string;
  productUrls?: string[];
  youtubeUrl?: string;
};

export function classifyShopHost(href: string): 'coupang' | 'smartstore' | null {
  try {
    const host = new URL(normalizeHttpUrl(href)).hostname.replace(/^www\./, '');
    if (host.includes('coupang')) return 'coupang';
    if (host.includes('smartstore') || host.includes('shopping.naver')) return 'smartstore';
  } catch {
    return null;
  }
  return null;
}

export function parseShopUrls(data: {
  coupangUrl?: unknown;
  smartstoreUrl?: unknown;
  productUrl?: unknown;
  productUrls?: unknown;
}): { coupangUrl: string; smartstoreUrl: string } {
  let coupangUrl = String(data.coupangUrl ?? '').trim();
  let smartstoreUrl = String(data.smartstoreUrl ?? '').trim();
  const leftovers = [
    ...(Array.isArray(data.productUrls) ? data.productUrls.map((value) => String(value ?? '').trim()) : []),
    String(data.productUrl ?? '').trim(),
  ]
    .filter(Boolean)
    .map((value) => normalizeHttpUrl(value));

  for (const url of leftovers) {
    const kind = classifyShopHost(url);
    if (kind === 'coupang' && !coupangUrl) coupangUrl = url;
    if (kind === 'smartstore' && !smartstoreUrl) smartstoreUrl = url;
  }

  return {
    coupangUrl: coupangUrl ? normalizeHttpUrl(coupangUrl) : '',
    smartstoreUrl: smartstoreUrl ? normalizeHttpUrl(smartstoreUrl) : '',
  };
}

export function listingShopLinks(item: ShopUrlFields): { label: string; href: string }[] {
  const { coupangUrl, smartstoreUrl } = parseShopUrls(item);
  return [
    coupangUrl ? { label: '쿠팡', href: coupangUrl } : null,
    smartstoreUrl ? { label: '스마트스토어', href: smartstoreUrl } : null,
  ].filter((item): item is { label: string; href: string } => Boolean(item));
}

export function listingSourceLabel(item: ShopUrlFields): string {
  const shops = parseShopUrls(item);
  const parts: string[] = [];
  if (shops.coupangUrl) parts.push('쿠팡');
  if (shops.smartstoreUrl) parts.push('스마트스토어');
  if (item.youtubeUrl?.trim()) parts.push(SELL_SOURCE_LABELS.youtube);
  return parts.join(' · ');
}

export function normalizeHttpUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function isHttpUrl(raw: string): boolean {
  try {
    const url = new URL(normalizeHttpUrl(raw));
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function videoIdFromPath(parts: string[], key: string): string | null {
  const index = parts.indexOf(key);
  const candidate = index >= 0 ? parts[index + 1] : undefined;
  return candidate && /^[\w-]{11}$/.test(candidate) ? candidate : null;
}

export function youtubeVideoId(raw: string): string | null {
  try {
    const url = new URL(normalizeHttpUrl(raw));
    const host = url.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0]?.slice(0, 11);
      return id && /^[\w-]{11}$/.test(id) ? id : null;
    }
    if (
      host === 'youtube.com' ||
      host === 'm.youtube.com' ||
      host === 'music.youtube.com' ||
      host === 'youtube-nocookie.com'
    ) {
      const fromQuery = url.searchParams.get('v');
      if (fromQuery && /^[\w-]{11}$/.test(fromQuery)) return fromQuery;
      const parts = url.pathname.split('/').filter(Boolean);
      return videoIdFromPath(parts, 'live') || videoIdFromPath(parts, 'embed') || videoIdFromPath(parts, 'shorts');
    }
  } catch {
    return null;
  }
  return null;
}

export function youtubeEmbedSrc(raw: string): string | null {
  const id = youtubeVideoId(raw);
  return id ? `https://www.youtube-nocookie.com/embed/${id}?rel=0` : null;
}
