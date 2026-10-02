export type MyPageTab = 'info' | 'inquiries' | 'sell' | 'buy';

export function mypageHref(tab: MyPageTab = 'info'): string {
  return tab === 'info' ? '/mypage' : `/mypage?tab=${tab}`;
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
