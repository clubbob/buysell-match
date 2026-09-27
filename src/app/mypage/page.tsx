'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import DefaultAddressBadge from '@/components/ui/DefaultAddressBadge';
import PageIntro from '@/components/ui/PageIntro';
import SellListPanel from '@/components/ui/SellListPanel';
import { useAuth } from '@/features/auth/auth-context';
import { useUserMode } from '@/features/mode/mode-context';
import { useSellListings } from '@/features/sell/use-sell-listings';
import { useBuyerProfile } from '@/features/buyer/use-buyer-profile';
import { useSellerProfile } from '@/features/seller/use-seller-profile';
import { USER_MODE_LABELS } from '@/lib/user-mode';
import { cn } from '@/lib/utils';
import { hasBuyerProfile } from '@/types/buyer';
import { formatBusinessVerifiedAt, isSellerProfileComplete } from '@/types/seller';

export default function MyPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { mode, setMode, resetMode } = useUserMode();
  const { mine, ready } = useSellListings();
  const { profile, ready: profileReady } = useSellerProfile(user?.uid);
  const { profile: buyerProfile, ready: buyerReady } = useBuyerProfile(user?.uid);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  if (loading || !user) {
    return <p className="text-sm text-muted">불러오는 중…</p>;
  }

  const myListings = mine(user.uid);
  const canPostSell = profileReady && isSellerProfileComplete(profile);
  const canPostBuy = buyerReady && hasBuyerProfile(buyerProfile);

  return (
    <div className="space-y-6">
      <PageIntro title="마이페이지" description={user.displayName ? `${user.displayName} · ${user.email ?? ''}` : (user.email ?? '')}>
        {canPostBuy || canPostSell ? (
          <div className="action-row">
            {canPostBuy ? (
              <Link href="/buy/new" className="btn-secondary">
                삽니다 등록
              </Link>
            ) : null}
            {canPostSell ? (
              <Link href="/sell/new" className="btn-primary">
                팝니다 등록
              </Link>
            ) : null}
          </div>
        ) : null}
      </PageIntro>

      <section className="panel px-4 py-5 sm:px-5">
        <h2 className="text-sm font-bold text-ink">서비스 이용 모드</h2>
        <p className="mt-1 text-sm text-muted">{mode ? `${USER_MODE_LABELS[mode]}로 이용 중입니다.` : '아직 고르지 않았습니다.'}</p>
        <div className="action-row mt-4">
          <button
            type="button"
            onClick={() => setMode('buyer')}
            className={cn(mode === 'buyer' ? 'btn-primary' : 'btn-secondary')}
          >
            구매자로 이용
          </button>
          <button
            type="button"
            onClick={() => setMode('seller')}
            className={cn(mode === 'seller' ? 'btn-primary' : 'btn-secondary')}
          >
            판매자로 이용
          </button>
          <button type="button" onClick={() => resetMode({ navigate: true })} className="btn-ghost">
            선택 해제
          </button>
        </div>
      </section>

      <section className="panel px-4 py-5 sm:px-5">
        <h2 className="text-sm font-bold text-ink">기본 회원 정보</h2>
        <dl className="mt-3 space-y-1.5 text-sm">
          <div className="flex gap-3">
            <dt className="w-[7.5rem] shrink-0 text-muted">이름</dt>
            <dd className="min-w-0 text-ink">{user.displayName || '—'}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-[7.5rem] shrink-0 text-muted">이메일</dt>
            <dd className="min-w-0 break-all text-ink">{user.email || '—'}</dd>
          </div>
        </dl>
        <div className="mt-4">
          <Link href="/mypage/password" className="btn-secondary">
            비밀번호 변경
          </Link>
        </div>
      </section>

      <section className="panel px-4 py-5 sm:px-5">
        <h2 className="text-sm font-bold text-ink">구매자 세부 정보</h2>
        {!buyerReady ? (
          <p className="mt-1 text-sm text-muted">불러오는 중…</p>
        ) : hasBuyerProfile(buyerProfile) ? (
          <>
            <dl className="mt-3 space-y-1.5 text-sm">
              <div className="flex gap-3">
                <dt className="w-[7.5rem] shrink-0 text-muted">핸드폰 번호</dt>
                <dd className="min-w-0 text-ink">{buyerProfile.buyerPhone}</dd>
              </div>
              {buyerProfile.addresses.map((item, index) => (
                <div key={item.id} className="flex gap-3">
                  <dt className="w-[7.5rem] shrink-0 text-muted">
                    {buyerProfile.addresses.length > 1 ? `배송 주소 ${index + 1}` : '배송 주소'}
                  </dt>
                  <dd className="flex min-w-0 flex-wrap items-center gap-2 text-ink">
                    <span>{item.address}</span>
                    {item.id === buyerProfile.defaultAddressId ? <DefaultAddressBadge /> : null}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-4">
              <Link href="/buyer/profile" className="btn-secondary">
                수정
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="mt-1 text-sm text-muted">아직 등록된 구매자 세부 정보가 없습니다.</p>
            <div className="mt-4">
              <Link href="/buyer/profile" className="btn-secondary">
                구매자 정보 등록
              </Link>
            </div>
          </>
        )}
      </section>

      <section className="panel px-4 py-5 sm:px-5">
        <h2 className="text-sm font-bold text-ink">판매자 세부 정보</h2>
        {!profileReady ? (
          <p className="mt-1 text-sm text-muted">불러오는 중…</p>
        ) : profile ? (
          <>
            <dl className="mt-3 grid gap-x-8 gap-y-1.5 text-sm sm:grid-cols-2">
              <div className="flex gap-3">
                <dt className="w-[7.5rem] shrink-0 text-muted">사업자등록번호</dt>
                <dd className="min-w-0 text-ink">
                  {profile.businessNumber}
                  {profile.businessVerified
                    ? ` · 사업자 확인${profile.businessVerifiedAt ? ` ${formatBusinessVerifiedAt(profile.businessVerifiedAt)}` : ''}`
                    : ''}
                </dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-[7.5rem] shrink-0 text-muted">상호</dt>
                <dd className="min-w-0 text-ink">{profile.sellerName}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-[7.5rem] shrink-0 text-muted">대표자</dt>
                <dd className="min-w-0 text-ink">{profile.representativeName}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-[7.5rem] shrink-0 text-muted">사업장 주소</dt>
                <dd className="min-w-0 text-ink">{profile.businessAddress}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-[7.5rem] shrink-0 text-muted">핸드폰 번호</dt>
                <dd className="min-w-0 text-ink">{profile.sellerMobile || '—'}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-[7.5rem] shrink-0 text-muted">사업장 전화</dt>
                <dd className="min-w-0 text-ink">{profile.sellerPhone || '—'}</dd>
              </div>
              <div className="flex gap-3 sm:col-span-2">
                <dt className="w-[7.5rem] shrink-0 text-muted">사업자등록증</dt>
                <dd className="min-w-0">
                  {profile.businessCertificateUrl ? (
                    <a
                      href={profile.businessCertificateUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-chip"
                    >
                      첨부 파일 보기
                    </a>
                  ) : (
                    <span className="text-muted">미첨부 · 수정에서 첨부해 주세요</span>
                  )}
                </dd>
              </div>
            </dl>
            <div className="mt-4">
              <Link href="/seller/profile" className="btn-secondary">
                수정
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="mt-1 text-sm text-muted">아직 등록된 판매자 세부 정보가 없습니다.</p>
            <div className="mt-4">
              <Link href="/seller/profile" className="btn-secondary">
                판매자 정보 등록
              </Link>
            </div>
          </>
        )}
      </section>

      {ready && myListings.length > 0 ? (
        <SellListPanel title="내가 올린 팝니다" description="계정에 저장된 글입니다." items={myListings} />
      ) : (
        <div className="panel px-4 py-10 text-center">
          <p className="text-sm text-muted">아직 올린 팝니다가 없습니다.</p>
          {canPostSell ? (
            <Link href="/sell/new" className="btn-primary mt-4">
              팝니다 등록
            </Link>
          ) : null}
        </div>
      )}

      <div className="panel px-4 py-10 text-center">
        <p className="text-sm text-muted">아직 올린 삽니다가 없습니다.</p>
        {canPostBuy ? (
          <Link href="/buy/new" className="btn-primary mt-4">
            삽니다 등록
          </Link>
        ) : null}
      </div>
    </div>
  );
}
