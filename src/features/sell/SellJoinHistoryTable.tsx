'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/auth-context';
import { formatCount, joinTotalNote } from '@/lib/sell-display';
import { maskEmail, maskPersonName } from '@/lib/mask-identity';
import { fetchMemberNames } from '@/lib/member-remote';
import { formatMemberJoinedAt } from '@/types/member';
import type { SellJoin } from '@/types/sell-join';

function BuyerLabel({ name, email }: { name?: string; email?: string }) {
  const maskedName = name && name !== '구매자' ? maskPersonName(name) : '';
  const maskedMail = email ? maskEmail(email) : '';
  if (!maskedName && !maskedMail) return '—';
  if (maskedName && maskedMail) return `${maskedName} (${maskedMail})`;
  return maskedName || maskedMail;
}

export default function SellJoinHistoryTable({
  joins,
  title = '구매 참여 내역',
  minQuantity = null,
}: {
  joins: SellJoin[];
  title?: string;
  minQuantity?: number | null;
}) {
  const { user, loading } = useAuth();
  const totalQuantity = joins.reduce((sum, row) => sum + row.quantity, 0);
  const [namesById, setNamesById] = useState<Record<string, string>>({});

  useEffect(() => {
    if (loading || !user) return;
    const ids = joins.map((row) => row.buyerId);
    let cancelled = false;
    void fetchMemberNames(ids)
      .then((next) => {
        if (!cancelled) setNamesById(next);
      })
      .catch(() => {
        if (!cancelled) setNamesById({});
      });
    return () => {
      cancelled = true;
    };
  }, [joins, loading, user]);

  return (
    <div className="w-full overflow-x-auto border border-line">
      <p className="border-b border-line bg-slate-50 px-3 py-2 text-center text-sm font-semibold text-ink">{title}</p>
      <table className="w-full min-w-[28rem] text-center text-sm">
        <thead>
          <tr className="border-b border-line text-[11px] font-semibold text-subtle">
            <th className="px-3 py-2 font-semibold">구매자</th>
            <th className="px-3 py-2 font-semibold">수량</th>
            <th className="px-3 py-2 font-semibold">상태</th>
            <th className="px-3 py-2 font-semibold">참여일</th>
          </tr>
        </thead>
        <tbody>
          {joins.map((row) => (
            <tr key={row.id} className="border-t border-line">
              <td className="px-3 py-2.5 text-ink">
                <BuyerLabel
                  name={row.buyerName || namesById[row.buyerId] || (row.buyerId === user?.uid ? user.displayName ?? '' : '')}
                  email={row.buyerEmail}
                />
              </td>
              <td className="px-3 py-2.5 font-semibold tabular-nums text-ink">{formatCount(row.quantity)}</td>
              <td className="px-3 py-2.5 font-semibold text-ink">
                {row.status === 'confirmed' ? '판매 확정' : '접수됨'}
              </td>
              <td className="px-3 py-2.5 font-semibold tabular-nums text-ink">
                {formatMemberJoinedAt(row.createdAt) || '—'}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-line bg-slate-50">
            <td className="px-3 py-2.5 font-semibold text-ink">합계</td>
            <td className="px-3 py-2.5 font-semibold tabular-nums text-ink">{formatCount(totalQuantity)}</td>
            <td colSpan={2} className="px-3 py-2.5 text-left text-xs font-medium text-muted">
              {joinTotalNote(totalQuantity, minQuantity)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
