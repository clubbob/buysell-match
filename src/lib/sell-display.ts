export function quantityAmount(label: string): number | null {
  const match = label.replace(/,/g, '').match(/\d+/);
  if (!match) return null;
  return Number(match[0]);
}

export function formatQuantityNumber(label: string): string {
  const amount = quantityAmount(label);
  return amount == null ? '—' : amount.toLocaleString('ko-KR');
}

export function joinAvailable(limit: number, remaining: number, gathered: number): number {
  return Math.max(0, Math.min(limit, remaining) - gathered);
}

export function isRemainingShort(minLabel: string, remainingLabel: string): boolean {
  const min = quantityAmount(minLabel);
  const remaining = quantityAmount(remainingLabel);
  if (min == null || remaining == null) return false;
  return remaining < min;
}

export function replaceQuantityNumber(label: string, next: number): string {
  const formatted = next.toLocaleString('ko-KR');
  if (!label.trim()) return formatted;
  const replaced = label.replace(/\d[\d,]*/, formatted);
  return replaced === label ? formatted : replaced;
}

export function isDeadlinePassed(isoDate: string, now = new Date()): boolean {
  const [year, month, day] = isoDate.split('-').map(Number);
  const end = new Date(year, month - 1, day);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return end.getTime() < today.getTime();
}

export function formatWon(value: number): string {
  return `${value.toLocaleString('ko-KR')}원`;
}

export function discountRate(regularPrice: number, salePrice: number): number {
  if (regularPrice <= 0 || salePrice >= regularPrice) return 0;
  return Math.round(((regularPrice - salePrice) / regularPrice) * 100);
}

export function deadlineParts(isoDate: string, now = new Date()): { date: string; note: string } {
  const [year, month, day] = isoDate.split('-').map(Number);
  const end = new Date(year, month - 1, day);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = Math.round((end.getTime() - today.getTime()) / 86_400_000);
  const date = `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`;

  if (diff < 0) return { date, note: '(마감)' };
  if (diff === 0) return { date, note: '(오늘 마감)' };
  return { date, note: `(${diff}일 남음)` };
}

export function formatDeadline(isoDate: string, now = new Date()): string {
  const { date, note } = deadlineParts(isoDate, now);
  return `${date} ${note}`;
}
