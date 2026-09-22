export type UserMode = 'buyer' | 'seller';

const USER_MODE_KEY = 'buysell.userMode';

export const USER_MODE_LABELS: Record<UserMode, string> = {
  buyer: '구매자',
  seller: '판매자',
};

export type HeaderNavItem = {
  href: string;
  label: string;
  exact?: boolean;
};

export function getHeaderNavItems(mode: UserMode | null, isLoggedIn: boolean): HeaderNavItem[] {
  const home: HeaderNavItem = { href: '/', label: '메인', exact: true };

  if (!isLoggedIn || !mode) {
    return [home, { href: '/sell', label: '팝니다' }, { href: '/buy', label: '삽니다' }];
  }

  if (mode === 'buyer') {
    return [home, { href: '/sell', label: '팝니다' }, { href: '/buy/new', label: '삽니다 등록' }];
  }

  return [home, { href: '/buy', label: '삽니다' }, { href: '/sell/new', label: '팝니다 등록' }];
}

export function isUserMode(value: unknown): value is UserMode {
  return value === 'buyer' || value === 'seller';
}

export function loadUserMode(): UserMode | null {
  if (typeof window === 'undefined') return null;
  return isUserMode(localStorage.getItem(USER_MODE_KEY))
    ? (localStorage.getItem(USER_MODE_KEY) as UserMode)
    : null;
}

export function saveUserMode(mode: UserMode): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_MODE_KEY, mode);
}

export function clearUserMode(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(USER_MODE_KEY);
}
