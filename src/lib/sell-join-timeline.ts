import { formatCount, quantityAmount } from '@/lib/sell-display';
import type { SellListing } from '@/types/sell';
import type { SellJoin } from '@/types/sell-join';

export type JoinTimelineEvent = {
  kind: 'open' | 'confirmed';
  at: string;
  quantity: number;
};

export type JoinTimelineStep = {
  label: '구매 신청' | '확정';
  kind: 'open' | 'confirmed';
  at: string;
  quantity: number;
  remainingBefore: number;
  remainingAfter: number;
};

export function timelineInstant(at?: string): number {
  if (!at?.trim()) return 0;
  const parsed = Date.parse(at);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function formatTimelineAt(at?: string): string {
  if (!at?.trim()) return '—';
  const parsed = new Date(at);
  if (Number.isNaN(parsed.getTime())) return '—';
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  const hour = String(parsed.getHours()).padStart(2, '0');
  const minute = String(parsed.getMinutes()).padStart(2, '0');
  return `${month}/${day} ${hour}:${minute}`;
}

function groupTimelineEvents(
  joins: SellJoin[],
  pickAt: (join: SellJoin) => string | undefined,
  kind: JoinTimelineEvent['kind'],
  filter: (join: SellJoin) => boolean,
): JoinTimelineEvent[] {
  const grouped = new Map<number, { at: string; quantity: number }>();

  for (const join of joins) {
    if (!filter(join)) continue;
    const at = pickAt(join)?.trim();
    if (!at) continue;
    const instant = timelineInstant(at);
    const current = grouped.get(instant);
    if (current) {
      current.quantity += join.quantity;
      continue;
    }
    grouped.set(instant, { at, quantity: join.quantity });
  }

  return [...grouped.entries()]
    .sort(([left], [right]) => left - right)
    .map(([, value]) => ({ kind, at: value.at, quantity: value.quantity }));
}

export function buildJoinTimelineEvents(joins: SellJoin[]): JoinTimelineEvent[] {
  const events = [
    ...groupTimelineEvents(
      joins,
      (join) => join.createdAt,
      'open',
      (join) => join.status === 'open',
    ),
    ...groupTimelineEvents(
      joins,
      (join) => join.confirmedAt || join.createdAt,
      'confirmed',
      (join) => join.status === 'confirmed',
    ),
  ];

  return events.sort((a, b) => {
    const timeOrder = timelineInstant(a.at) - timelineInstant(b.at);
    if (timeOrder !== 0) return timeOrder;
    if (a.kind === b.kind) return 0;
    return a.kind === 'open' ? -1 : 1;
  });
}

export function buildJoinTimeline(item: SellListing, joins: SellJoin[]): {
  initialRemaining: number;
  currentRemaining: number;
  steps: JoinTimelineStep[];
} {
  const currentRemaining = quantityAmount(item.remainingLabel) ?? 0;
  const confirmedTotal = joins
    .filter((join) => join.status === 'confirmed')
    .reduce((sum, join) => sum + join.quantity, 0);
  const initialRemaining = currentRemaining + confirmedTotal;

  let stock = initialRemaining;
  let openPending = 0;
  const steps: JoinTimelineStep[] = [];

  for (const event of buildJoinTimelineEvents(joins)) {
    if (event.kind === 'open') {
      const remainingBefore = Math.max(0, stock - openPending);
      openPending += event.quantity;
      const remainingAfter = Math.max(0, stock - openPending);
      steps.push({
        label: '구매 신청',
        kind: 'open',
        at: event.at,
        quantity: event.quantity,
        remainingBefore,
        remainingAfter,
      });
      continue;
    }

    const remainingBefore = stock;
    stock = Math.max(0, stock - event.quantity);
    openPending = Math.max(0, openPending - event.quantity);
    steps.push({
      label: '확정',
      kind: 'confirmed',
      at: event.at,
      quantity: event.quantity,
      remainingBefore,
      remainingAfter: stock,
    });
  }

  return { initialRemaining, currentRemaining, steps };
}

export function formatTimelineQuantity(amount: number): string {
  return formatCount(amount);
}
