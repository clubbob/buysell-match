export function formatQuantityNumber(label: string): string {
  const match = label.replace(/,/g, '').match(/\d+/);
  if (!match) return '—';
  return Number(match[0]).toLocaleString('ko-KR');
}

export function formatWon(value: number): string {
  return `${value.toLocaleString('ko-KR')}원`;
}

export function discountRate(regularPrice: number, salePrice: number): number {
  if (regularPrice <= 0 || salePrice >= regularPrice) return 0;
  return Math.round(((regularPrice - salePrice) / regularPrice) * 100);
}

export function formatDeadline(isoDate: string, now = new Date()): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const end = new Date(year, month - 1, day);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = Math.round((end.getTime() - today.getTime()) / 86_400_000);
  const ymd = `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`;

  if (diff < 0) return `${ymd} (마감)`;
  if (diff === 0) return `${ymd} (오늘 마감)`;
  return `${ymd} (${diff}일 남음)`;
}
