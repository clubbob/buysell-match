'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import DefaultAddressBadge from '@/components/ui/DefaultAddressBadge';
import PageBack from '@/components/ui/PageBack';
import { readApiJson } from '@/lib/api-json';
import { getClientAuth } from '@/lib/firebase';
import type { BuyerProfile } from '@/types/buyer';
import { formatMemberJoinedAt, type MemberRecord } from '@/types/member';

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

export default function AdminMemberDetail({ id }: { id: string }) {
  const router = useRouter();
  const [item, setItem] = useState<MemberRecord | null>(null);
  const [ready, setReady] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetch(`/api/admin/members/${id}`)
      .then(async (response) => {
        const data = await readApiJson<{ ok?: boolean; item?: MemberRecord; message?: string }>(
          response,
          '회원 정보를 불러오지 못했습니다.',
        );
        if (!response.ok || !data.ok || !data.item) throw new Error(data.message ?? '회원 정보를 불러오지 못했습니다.');
        return data.item;
      })
      .then((next) => {
        if (!cancelled) setItem(next);
      })
      .catch((loadError: unknown) => {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : '회원 정보를 불러오지 못했습니다.');
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleDelete() {
    if (!item) return;
    const label = item.member.name || item.member.email || '이 회원';
    if (!window.confirm(`${label} 정보를 삭제할까요?`)) return;
    setError(null);
    setPending(true);
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
      router.replace('/admin/members');
      router.refresh();
    } catch {
      setError('삭제에 실패했습니다.');
    } finally {
      setPending(false);
    }
  }

  if (!ready) {
    return <p className="text-sm text-muted">불러오는 중…</p>;
  }

  if (!item) {
    return (
      <div className="space-y-5">
        <PageBack href="/admin/members" />
        <p className="panel px-4 py-10 text-center text-sm text-muted">{error ?? '없는 회원입니다.'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-end gap-2">
        <button type="button" className="btn-secondary" disabled={pending} onClick={() => void handleDelete()}>
          {pending ? '삭제 중…' : '삭제'}
        </button>
        <PageBack href="/admin/members" />
      </div>

      {error ? (
        <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      <article className="panel px-4 py-5 sm:px-5">
        <h1 className="text-sm font-bold text-ink">{item.member.name || item.member.email || '이름 없음'}</h1>

        <section className="mt-4 border-t border-line pt-4">
          <h2 className="text-xs font-semibold tracking-wide text-subtle">기본 회원 정보</h2>
          <dl className="mt-2 space-y-1.5">
            <Field label="이름" value={item.member.name} />
            <Field label="이메일" value={item.member.email} />
            <Field label="가입 일자" value={formatMemberJoinedAt(item.member.createdAt)} />
          </dl>
        </section>

        <section className="mt-4 border-t border-line pt-4">
          <h2 className="text-xs font-semibold tracking-wide text-subtle">구매자 세부 정보</h2>
          {item.buyer ? (
            <BuyerFields buyer={item.buyer} />
          ) : (
            <p className="mt-2 text-sm text-muted">아직 등록된 구매자 세부 정보가 없습니다.</p>
          )}
        </section>

        <section className="mt-4 border-t border-line pt-4">
          <h2 className="text-xs font-semibold tracking-wide text-subtle">판매자 세부 정보</h2>
          {item.seller ? (
            <dl className="mt-2 space-y-1.5">
              <Field label="상호" value={item.seller.sellerName} />
              <Field label="대표자" value={item.seller.representativeName} />
              <Field label="사업자등록번호" value={item.seller.businessNumber} />
              <Field label="핸드폰 번호" value={item.seller.sellerMobile} />
              <Field label="사업장 전화" value={item.seller.sellerPhone} />
              <Field label="사업장 주소" value={item.seller.businessAddress} />
              {item.seller.businessCertificateUrl ? (
                <div className="flex gap-3 text-sm">
                  <dt className="w-24 shrink-0 text-muted sm:w-[7.5rem]">사업자등록증</dt>
                  <dd>
                    <a href={item.seller.businessCertificateUrl} target="_blank" rel="noreferrer" className="btn-chip">
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
      </article>
    </div>
  );
}
