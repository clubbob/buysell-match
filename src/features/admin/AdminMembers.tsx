'use client';

import { useEffect, useState } from 'react';
import DefaultAddressBadge from '@/components/ui/DefaultAddressBadge';
import PageIntro from '@/components/ui/PageIntro';
import { getClientAuth } from '@/lib/firebase';
import { formatBusinessVerifiedAt } from '@/types/seller';
import type { BuyerProfile } from '@/types/buyer';
import type { MemberRecord } from '@/types/member';

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex gap-3 text-sm">
      <dt className="w-24 shrink-0 text-muted sm:w-[7.5rem]">{label}</dt>
      <dd className="min-w-0 break-all text-ink">{value?.trim() ? value : '—'}</dd>
    </div>
  );
}

function BuyerFields({ buyer }: { buyer: BuyerProfile }) {
  return (
    <dl className="mt-2 space-y-1.5">
      <Field label="핸드폰 번호" value={buyer.buyerPhone} />
      {buyer.addresses.map((address, index) => (
        <div key={address.id} className="flex gap-3 text-sm">
          <dt className="w-24 shrink-0 text-muted sm:w-[7.5rem]">
            {buyer.addresses.length > 1 ? `배송 주소 ${index + 1}` : '배송 주소'}
          </dt>
          <dd className="flex min-w-0 flex-wrap items-center gap-2 break-all text-ink">
            <span>{address.address}</span>
            {address.id === buyer.defaultAddressId ? <DefaultAddressBadge /> : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default function AdminMembers() {
  const [items, setItems] = useState<MemberRecord[]>([]);
  const [ready, setReady] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetch('/api/admin/members')
      .then(async (response) => {
        const data = (await response.json()) as { ok?: boolean; items?: MemberRecord[]; message?: string };
        if (!response.ok || !data.ok) throw new Error(data.message ?? '목록을 불러오지 못했습니다.');
        return data.items ?? [];
      })
      .then((next) => {
        if (!cancelled) setItems(next);
      })
      .catch((loadError: unknown) => {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : '목록을 불러오지 못했습니다.');
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleDelete(item: MemberRecord) {
    const label = item.member.name || item.member.email || '이 회원';
    if (!window.confirm(`${label} 정보를 삭제할까요?`)) return;
    setError(null);
    setPendingId(item.member.id);
    try {
      const token = await getClientAuth()?.currentUser?.getIdToken();
      const response = await fetch(`/api/admin/members/${item.member.id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = (await response.json()) as { ok?: boolean; message?: string };
      if (!response.ok || !data.ok) {
        setError(data.message ?? '삭제에 실패했습니다.');
        return;
      }
      setItems((current) => current.filter((entry) => entry.member.id !== item.member.id));
    } catch {
      setError('삭제에 실패했습니다.');
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-5">
      <PageIntro title="회원정보" description="기본 회원 정보와 구매자·판매자 세부 정보를 함께 확인합니다." />
      {error ? (
        <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      {!ready ? (
        <p className="text-sm text-muted">불러오는 중…</p>
      ) : items.length === 0 ? (
        <p className="panel px-4 py-10 text-center text-sm text-muted">아직 등록된 회원이 없습니다.</p>
      ) : (
        <ul className="space-y-4">
          {items.map((item) => (
            <li key={item.member.id} className="panel px-4 py-5 sm:px-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="text-sm font-bold text-ink">{item.member.name || item.member.email || '이름 없음'}</h2>
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={pendingId === item.member.id}
                  onClick={() => void handleDelete(item)}
                >
                  {pendingId === item.member.id ? '삭제 중…' : '삭제'}
                </button>
              </div>

              <section className="mt-4 border-t border-line pt-4">
                <h3 className="text-xs font-semibold tracking-wide text-subtle">기본 회원 정보</h3>
                <dl className="mt-2 space-y-1.5">
                  <Field label="이름" value={item.member.name} />
                  <Field label="이메일" value={item.member.email} />
                </dl>
              </section>

              <section className="mt-4 border-t border-line pt-4">
                <h3 className="text-xs font-semibold tracking-wide text-subtle">구매자 세부 정보</h3>
                {item.buyer ? (
                  <BuyerFields buyer={item.buyer} />
                ) : (
                  <p className="mt-2 text-sm text-muted">아직 등록된 구매자 세부 정보가 없습니다.</p>
                )}
              </section>

              <section className="mt-4 border-t border-line pt-4">
                <h3 className="text-xs font-semibold tracking-wide text-subtle">판매자 세부 정보</h3>
                {item.seller ? (
                  <dl className="mt-2 space-y-1.5">
                    <Field label="상호" value={item.seller.sellerName} />
                    <Field label="대표자" value={item.seller.representativeName} />
                    <Field label="사업자등록번호" value={item.seller.businessNumber} />
                    <Field
                      label="사업자 인증"
                      value={
                        item.seller.businessVerified
                          ? `인증${item.seller.businessVerifiedAt ? ` ${formatBusinessVerifiedAt(item.seller.businessVerifiedAt)}` : ''}`
                          : '대기'
                      }
                    />
                    <Field label="핸드폰 번호" value={item.seller.sellerMobile} />
                    <Field label="사업장 전화" value={item.seller.sellerPhone} />
                    <Field label="사업장 주소" value={item.seller.businessAddress} />
                    {item.seller.businessCertificateUrl ? (
                      <div className="flex gap-3 text-sm">
                        <dt className="w-24 shrink-0 text-muted sm:w-[7.5rem]">사업자등록증</dt>
                        <dd>
                          <a
                            href={item.seller.businessCertificateUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-chip"
                          >
                            첨부 파일 보기
                          </a>
                        </dd>
                      </div>
                    ) : (
                      <Field label="사업자등록증" value="미첨부" />
                    )}
                  </dl>
                ) : (
                  <p className="mt-2 text-sm text-muted">아직 등록된 판매자 세부 정보가 없습니다.</p>
                )}
              </section>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
