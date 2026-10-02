export function quantityAmount(label: string): number | null {
  const match = label.replace(/,/g, '').match(/\d+/);
  if (!match) return null;
  return Number(match[0]);
}

export function formatCount(amount: number): string {
  return `${amount.toLocaleString('ko-KR')}개`;
}

export function formatQuantityNumber(label: string): string {
  const amount = quantityAmount(label);
  return amount == null ? '—' : formatCount(amount);
}

export function formatJoinParticipants(buyers: number, quantity: number): string {
  if (buyers <= 0 || quantity <= 0) return '';
  return `공구 구매 신청 ${buyers.toLocaleString('ko-KR')}명 (${quantity.toLocaleString('ko-KR')}개)`;
}

export type ListingProgressStatus = 'recruiting' | 'deadline' | 'closed';

export function listingProgressStatus(item: { closedAt?: string; deadline: string }, now = new Date()): ListingProgressStatus {
  if (item.closedAt?.trim()) return 'closed';
  if (isDeadlinePassed(item.deadline, now)) return 'deadline';
  return 'recruiting';
}

export function listingProgressStatusLabel(status: ListingProgressStatus): string {
  if (status === 'closed' || status === 'deadline') return '마감';
  return '모집 중';
}

export function formatConfirmedJoinSummary(buyers: number, quantity: number): string {
  if (quantity <= 0) return '';
  if (buyers > 0) {
    return `판매 확정 ${buyers.toLocaleString('ko-KR')}명 (${quantity.toLocaleString('ko-KR')}개)`;
  }
  return `판매 확정 ${quantity.toLocaleString('ko-KR')}개`;
}

export function joinTotalNote(total: number, min: number | null): string {
  if (min == null || min <= 0) return '공구 구매 신청 수량입니다.';
  if (total >= min) return `공구 최소 주문 ${formatCount(min)}을 충족했습니다.`;
  return `공구 최소 주문까지 ${formatCount(min - total)} 남았습니다.`;
}

export function joinPaymentDueDate(confirmedAt: string, days = 2): string {
  const parsed = new Date(confirmedAt);
  if (Number.isNaN(parsed.getTime())) return '';
  const due = new Date(parsed);
  due.setDate(due.getDate() + days);
  const year = due.getFullYear();
  const month = String(due.getMonth() + 1).padStart(2, '0');
  const day = String(due.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

export function joinPaymentDueNotice(confirmedAt: string, days = 2): string {
  const dueDate = joinPaymentDueDate(confirmedAt, days);
  if (!dueDate) return '';
  return `입금해 주세요 (${dueDate})`;
}

export function joinConfirmedNote(total: number, pendingPayments = 0, pendingShipments = 0): string {
  if (total <= 0) return '';
  const details: string[] = [];
  if (pendingPayments > 0) {
    details.push(`입금 대기 ${pendingPayments.toLocaleString('ko-KR')}건`);
  }
  if (pendingShipments > 0) {
    details.push(`배송 대기 ${pendingShipments.toLocaleString('ko-KR')}건`);
  }
  if (details.length > 0) {
    return `판매 확정된 신청입니다. ${details.join(', ')}`;
  }
  return '판매 확정된 신청입니다. 결제·배송이 모두 완료되었습니다.';
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

export function isListingClosed(item: { closedAt?: string; deadline: string }, now = new Date()): boolean {
  if (item.closedAt?.trim()) return true;
  return isDeadlinePassed(item.deadline, now);
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

export function hasDepositAccount(item: {
  depositBank?: string;
  depositAccount?: string;
  depositHolder?: string;
}): boolean {
  return Boolean(item.depositBank?.trim() || item.depositAccount?.trim());
}

export function formatDepositAccount(item: {
  depositBank?: string;
  depositAccount?: string;
  depositHolder?: string;
}): string | null {
  const bank = item.depositBank?.trim() ?? '';
  const account = item.depositAccount?.trim() ?? '';
  const holder = item.depositHolder?.trim() ?? '';
  if (!bank && !account) return null;
  const base = [bank, account].filter(Boolean).join(' ');
  return holder ? `${base} (예금주: ${holder})` : base;
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
