export type MyPageTab = 'info' | 'inquiries' | 'sell' | 'buy';
export type MyPageInquiryKind = 'all' | 'site' | 'sell';

export function mypageHref(tab: MyPageTab = 'info'): string {
  return tab === 'info' ? '/mypage' : `/mypage?tab=${tab}`;
}

export function mypageBuyInquiryHref(listingId: string): string {
  return `/mypage?tab=buy&listingId=${encodeURIComponent(listingId)}`;
}

export function parseMyPageInquiryKind(value: string | null): MyPageInquiryKind {
  if (value === 'site' || value === 'sell') return value;
  return 'all';
}

export function mypageInquiriesHref(kind: MyPageInquiryKind = 'all'): string {
  if (kind === 'all') return '/mypage?tab=inquiries';
  return `/mypage?tab=inquiries&inquiry=${kind}`;
}

export function sellDetailHref(id: string, options?: { from?: string; mypageTab?: 'sell' | 'buy' }): string {
  if (options?.from === 'mypage') {
    const tab = options.mypageTab === 'buy' ? 'buy' : 'sell';
    return `/sell/${id}?from=mypage&tab=${tab}`;
  }
  if (options?.from) {
    return `/sell/${id}?from=${encodeURIComponent(options.from)}`;
  }
  return `/sell/${id}`;
}

export function resolveSellBackHref(from?: string | null, tab?: string | null): string {
  if (from === 'mypage') {
    if (tab === 'buy' || tab === 'sell' || tab === 'inquiries') {
      return mypageHref(tab);
    }
    return mypageHref('sell');
  }
  return '/sell';
}
