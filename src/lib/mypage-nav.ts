export type MyPageTab = 'dashboard' | 'info' | 'inquiries' | 'sell' | 'buy';
export type MyPageInquiryKind = 'all' | 'site' | 'sell';

export function mypageHref(tab: MyPageTab = 'dashboard'): string {
  return tab === 'dashboard' ? '/mypage' : `/mypage?tab=${tab}`;
}

export function mypageBuyInquiryHref(listingId: string): string {
  return mypageSellInquiryWriteHref(listingId);
}

export function mypageSellInquiryHref(id: string): string {
  return `/mypage/sell-inquiries/${encodeURIComponent(id)}`;
}

export function mypageSellInquiryWriteHref(listingId: string): string {
  return `/mypage/sell-inquiries/new?listingId=${encodeURIComponent(listingId)}`;
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
    if (tab === 'buy' || tab === 'sell' || tab === 'inquiries' || tab === 'info' || tab === 'dashboard') {
      return mypageHref(tab);
    }
    return mypageHref('sell');
  }
  return '/sell';
}
