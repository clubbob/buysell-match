export type SellCategory =
  | 'food'
  | 'living'
  | 'fashion'
  | 'beauty'
  | 'kids'
  | 'digital'
  | 'other';

export const SELL_CATEGORY_LABELS: Record<SellCategory, string> = {
  food: '식품',
  living: '생활·주방',
  fashion: '패션·잡화',
  beauty: '뷰티',
  kids: '유아·키즈',
  digital: '디지털',
  other: '기타',
};

export const SELL_CATEGORY_OPTIONS: SellCategory[] = [
  'food',
  'living',
  'fashion',
  'beauty',
  'kids',
  'digital',
  'other',
];

export function isSellCategory(value: unknown): value is SellCategory {
  return typeof value === 'string' && value in SELL_CATEGORY_LABELS;
}

export function parseSellCategory(value: unknown): SellCategory {
  return isSellCategory(value) ? value : 'other';
}
