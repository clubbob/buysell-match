import { BUYER_DETAIL_LABEL, SELLER_DETAIL_LABEL } from '@/lib/profile-labels';

export const SELL_CREATE_PATH = '/sell/new';

export function sellerProfileRequiredMessage() {
  return `${SELLER_DETAIL_LABEL}을 먼저 해야 합니다.`;
}

export function buyerProfileRequiredMessage() {
  return `${BUYER_DETAIL_LABEL}을 먼저 해야 합니다.`;
}

export function sellerProfileHref(next = SELL_CREATE_PATH) {
  return `/seller/profile?next=${encodeURIComponent(next)}`;
}

export function buyerProfileHref(next: string) {
  return `/buyer/profile?next=${encodeURIComponent(next)}`;
}

export function alertAndGoToSellerProfile(router: { push: (href: string) => void }, next = SELL_CREATE_PATH) {
  window.alert(sellerProfileRequiredMessage());
  router.push(sellerProfileHref(next));
}

export function alertAndGoToBuyerProfile(router: { push: (href: string) => void }, next: string) {
  window.alert(buyerProfileRequiredMessage());
  router.push(buyerProfileHref(next));
}
