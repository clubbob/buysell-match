'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/auth-context';
import { formatCount, joinConfirmedNote, joinPaymentDueNotice, joinTotalNote } from '@/lib/sell-display';
import { maskEmail, maskPersonName } from '@/lib/mask-identity';
import { fetchMemberNames } from '@/lib/member-remote';
import { formatMemberDateTime } from '@/types/member';
import {
  confirmedBatchAt,
  isJoinPaid,
  isJoinShipped,
  joinPaymentLabel,
  joinShippingLabel,
  type SellJoin,
} from '@/types/sell-join';

function BuyerLabel({
  name,
  email,
  reveal = false,
  highlight = false,
}: {
  name?: string;
  email?: string;
  reveal?: boolean;
  highlight?: boolean;
}) {
  const trimmedName = name && name !== '구매자' ? name.trim() : '';
  const trimmedMail = email?.trim() ?? '';
  const displayName = trimmedName ? (reveal ? trimmedName : maskPersonName(trimmedName)) : '';
  const displayMail = trimmedMail ? (reveal ? trimmedMail : maskEmail(trimmedMail)) : '';
  let content: string;
  if (!displayName && !displayMail) return '—';
  if (displayName && displayMail) content = `${displayName} (${displayMail})`;
  else content = displayName || displayMail;
  if (highlight) {
    return <span className="font-semibold text-blue-600">{content}</span>;
  }
  return content;
}

export default function SellJoinHistoryTable({
  joins,
  title = '구매 참여 내역',
  minQuantity = null,
  variant = 'open',
  revealBuyerIdentity = false,
  showMarkPaid = false,
  onMarkPaid,
  onMarkPending,
  showManageShipping = false,
  onMarkShipped,
  onMarkShippingPending,
  markingPaymentJoinId = null,
  markingShippingJoinId = null,
}: {
  joins: SellJoin[];
  title?: string;
  minQuantity?: number | null;
  variant?: 'open' | 'confirmed';
  revealBuyerIdentity?: boolean;
  showMarkPaid?: boolean;
  onMarkPaid?: (joinId: string) => void;
  onMarkPending?: (joinId: string) => void;
  showManageShipping?: boolean;
  onMarkShipped?: (joinId: string) => void;
  onMarkShippingPending?: (joinId: string) => void;
  markingPaymentJoinId?: string | null;
  markingShippingJoinId?: string | null;
}) {
  const { user, loading } = useAuth();
  const isConfirmedTable = variant === 'confirmed';
  const confirmedAt = isConfirmedTable ? confirmedBatchAt(joins) : undefined;
  const totalQuantity = joins.reduce((sum, row) => sum + row.quantity, 0);
  const pendingPayments = joins.filter((row) => row.status === 'confirmed' && !isJoinPaid(row)).length;
  const pendingShipments = joins.filter(
    (row) => row.status === 'confirmed' && isJoinPaid(row) && !isJoinShipped(row),
  ).length;
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
      {confirmedAt ? (
        <p className="border-b border-line bg-slate-50 px-3 py-1.5 text-center text-xs font-medium text-muted">
          확정 일시 {formatMemberDateTime(confirmedAt)}
          {pendingPayments > 0 ? (
            <>
              {' · '}
              <span className="font-semibold text-danger">{joinPaymentDueNotice(confirmedAt)}</span>
            </>
          ) : null}
        </p>
      ) : null}
      <table className={`w-full text-center text-sm ${isConfirmedTable ? 'min-w-[40rem]' : 'min-w-[28rem]'}`}>
        <thead>
          <tr className="border-b border-line text-[11px] font-semibold text-subtle">
            <th className="px-3 py-2 font-semibold">구매자</th>
            <th className="px-3 py-2 font-semibold">수량</th>
            <th className="px-3 py-2 font-semibold">상태</th>
            <th className="px-3 py-2 font-semibold">참여 일시</th>
            {isConfirmedTable ? <th className="px-3 py-2 font-semibold">결제</th> : null}
            {isConfirmedTable ? <th className="px-3 py-2 font-semibold">배송</th> : null}
          </tr>
        </thead>
        <tbody>
          {joins.map((row) => {
            const isSelf = row.buyerId === user?.uid;
            return (
            <tr key={row.id} className="border-t border-line">
              <td className="px-3 py-2.5 text-ink">
                <BuyerLabel
                  name={row.buyerName || namesById[row.buyerId] || (isSelf ? user.displayName ?? '' : '')}
                  email={row.buyerEmail || (isSelf ? user.email ?? '' : '')}
                  reveal={revealBuyerIdentity || isSelf}
                  highlight={isSelf}
                />
              </td>
              <td className="px-3 py-2.5 tabular-nums text-ink">{formatCount(row.quantity)}</td>
              <td className="px-3 py-2.5 text-ink">{row.status === 'confirmed' ? '판매 확정' : '접수됨'}</td>
              <td className="px-3 py-2.5 tabular-nums text-ink">{formatMemberDateTime(row.createdAt) || '—'}</td>
              {isConfirmedTable ? (
                <td className="px-3 py-2.5 text-ink">
                  <div className="flex flex-col items-center gap-1.5">
                    <span className={isJoinPaid(row) ? 'text-blue-600' : 'text-danger'}>{joinPaymentLabel(row)}</span>
                    {showMarkPaid && !isJoinPaid(row) ? (
                      <button
                        type="button"
                        className="btn-chip"
                        disabled={markingPaymentJoinId === row.id}
                        onClick={() => onMarkPaid?.(row.id)}
                      >
                        {markingPaymentJoinId === row.id ? '처리 중…' : '결제 완료'}
                      </button>
                    ) : null}
                    {showMarkPaid && isJoinPaid(row) ? (
                      <button
                        type="button"
                        className="btn-chip"
                        disabled={markingPaymentJoinId === row.id}
                        onClick={() => onMarkPending?.(row.id)}
                      >
                        {markingPaymentJoinId === row.id ? '처리 중…' : '입금 대기'}
                      </button>
                    ) : null}
                  </div>
                </td>
              ) : null}
              {isConfirmedTable ? (
                <td className="px-3 py-2.5 text-ink">
                  {!isJoinPaid(row) ? (
                    <span className="text-muted">—</span>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5">
                      <span className={isJoinShipped(row) ? 'text-blue-600' : 'text-danger'}>{joinShippingLabel(row)}</span>
                      {showManageShipping && !isJoinShipped(row) ? (
                        <button
                          type="button"
                          className="btn-chip"
                          disabled={markingShippingJoinId === row.id}
                          onClick={() => onMarkShipped?.(row.id)}
                        >
                          {markingShippingJoinId === row.id ? '처리 중…' : '배송 완료'}
                        </button>
                      ) : null}
                      {showManageShipping && isJoinShipped(row) ? (
                        <button
                          type="button"
                          className="btn-chip"
                          disabled={markingShippingJoinId === row.id}
                          onClick={() => onMarkShippingPending?.(row.id)}
                        >
                          {markingShippingJoinId === row.id ? '처리 중…' : '배송 대기'}
                        </button>
                      ) : null}
                    </div>
                  )}
                </td>
              ) : null}
            </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t border-line bg-slate-50">
            <td className="px-3 py-2.5 font-semibold text-ink">합계</td>
            <td className="px-3 py-2.5 font-semibold tabular-nums text-ink">{formatCount(totalQuantity)}</td>
            <td colSpan={isConfirmedTable ? 4 : 2} className="px-3 py-2.5 text-left text-xs font-semibold text-ink">
              {variant === 'confirmed'
                ? joinConfirmedNote(totalQuantity, pendingPayments, pendingShipments)
                : joinTotalNote(totalQuantity, minQuantity)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
