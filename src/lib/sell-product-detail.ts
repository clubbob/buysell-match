import type { SellListing } from '@/types/sell';

export type SellProductDetail = {
  composition: string;
  specification: string;
  origin: string;
  certification: string;
  shippingFee: string;
  shippingGuide: string;
  returnPolicy: string;
};

export type SellDetailRow = {
  label: string;
  value: string;
};

export const EMPTY_PRODUCT_DETAIL: SellProductDetail = {
  composition: '',
  specification: '',
  origin: '',
  certification: '',
  shippingFee: '',
  shippingGuide: '',
  returnPolicy: '',
};

export function hasStructuredDetail(item: Partial<SellProductDetail>): boolean {
  return Boolean(
    item.composition?.trim() ||
      item.specification?.trim() ||
      item.origin?.trim() ||
      item.certification?.trim() ||
      item.shippingFee?.trim() ||
      item.shippingGuide?.trim() ||
      item.returnPolicy?.trim(),
  );
}

export function readProductDetail(listing?: Pick<SellListing, keyof SellProductDetail>): SellProductDetail {
  if (!listing) return { ...EMPTY_PRODUCT_DETAIL };
  return {
    composition: listing.composition ?? '',
    specification: listing.specification ?? '',
    origin: listing.origin ?? '',
    certification: listing.certification ?? '',
    shippingFee: listing.shippingFee ?? '',
    shippingGuide: listing.shippingGuide ?? '',
    returnPolicy: listing.returnPolicy ?? '',
  };
}

export function productDetailRows(item: SellProductDetail): SellDetailRow[] {
  const rows: SellDetailRow[] = [
    { label: '구성', value: item.composition.trim() },
    { label: '규격·용량', value: item.specification.trim() },
    { label: '원산지', value: item.origin.trim() },
    { label: '인증·허가', value: item.certification.trim() },
  ];
  return rows.filter((row) => row.value);
}

export function tradeDetailRows(item: SellProductDetail): SellDetailRow[] {
  const rows: SellDetailRow[] = [
    { label: '배송비', value: item.shippingFee.trim() },
    { label: '배송 안내', value: item.shippingGuide.trim() },
    { label: '교환·반품', value: item.returnPolicy.trim() },
  ];
  return rows.filter((row) => row.value);
}

export function composeLegacySpecText(detail: SellProductDetail): string {
  return productDetailRows(detail)
    .map((row) => `${row.label}: ${row.value}`)
    .join('\n');
}

export function composeLegacyTradeText(detail: SellProductDetail): string {
  return tradeDetailRows(detail)
    .map((row) => `${row.label}: ${row.value}`)
    .join('\n');
}
