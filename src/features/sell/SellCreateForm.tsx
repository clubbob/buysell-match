'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/auth-context';
import { useUserMode } from '@/features/mode/mode-context';
import { createRemoteSellListing, resolveSellImages, updateRemoteSellListing } from '@/lib/sell-remote';
import type { SellListing } from '@/types/sell';
import { inputClassName } from '@/features/auth/auth-errors';
import { useSellerProfile } from '@/features/seller/use-seller-profile';
import { loginHref } from '@/lib/auth-redirect';
import { quantityAmount } from '@/lib/sell-display';
import { isSellerProfileComplete } from '@/types/seller';

const EXTRA_COUNT = 4;

type ImageItem = {
  id: string;
  url: string;
  file: File | null;
};

function toImageItem(file: File): ImageItem {
  return {
    id: `${file.name}-${file.size}-${file.lastModified}`,
    url: URL.createObjectURL(file),
    file,
  };
}

export default function SellCreateForm({ listing }: { listing?: SellListing }) {
  const isEdit = Boolean(listing);
  const router = useRouter();
  const { user, loading } = useAuth();
  const { mode, ready: modeReady, setMode } = useUserMode();
  const { profile, ready: profileReady } = useSellerProfile(user?.uid);
  const [cover, setCover] = useState<ImageItem | null>(
    listing?.images[0] ? { id: 'cover', url: listing.images[0], file: null } : null,
  );
  const [extras, setExtras] = useState<ImageItem[]>(
    (listing?.images.slice(1) ?? []).map((url, index) => ({ id: `extra-${index}`, url, file: null })),
  );
  const [title, setTitle] = useState(listing?.title ?? '');
  const [regularPrice, setRegularPrice] = useState(listing ? String(listing.regularPrice) : '');
  const [salePrice, setSalePrice] = useState(listing ? String(listing.salePrice) : '');
  const [minPurchaseLabel, setMinPurchaseLabel] = useState(listing?.minPurchaseLabel ?? '');
  const [limitLabel, setLimitLabel] = useState(listing?.limitLabel ?? listing?.quantityLabel ?? '');
  const [quantityLabel, setQuantityLabel] = useState(listing?.quantityLabel ?? '');
  const [remainingLabel, setRemainingLabel] = useState(listing?.remainingLabel ?? '');
  const [deadline, setDeadline] = useState(listing?.deadline ?? '');
  const [description, setDescription] = useState(listing?.description ?? '');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const returnPath = isEdit && listing ? `/sell/${listing.id}/edit` : '/sell/new';

  useEffect(() => {
    if (!loading && !user) router.replace(loginHref('seller', returnPath));
  }, [loading, user, router, returnPath]);

  useEffect(() => {
    if (user && modeReady && mode !== 'seller') setMode('seller');
  }, [user, modeReady, mode, setMode]);

  useEffect(() => {
    if (!loading && user && profileReady && !isSellerProfileComplete(profile)) {
      router.replace(`/seller/profile?next=${returnPath}`);
    }
  }, [loading, user, profile, profileReady, router, returnPath]);

  function handleCover(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    setCover(toImageItem(file));
  }

  function handleExtras(fileList: FileList | null) {
    if (!fileList?.length) return;
    const remaining = EXTRA_COUNT - extras.length;
    const files = Array.from(fileList).slice(0, remaining);
    setExtras((current) => [...current, ...files.map(toImageItem)]);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!user) {
      setError(isEdit ? '로그인 후 수정할 수 있습니다.' : '로그인 후 등록할 수 있습니다.');
      return;
    }
    if (!cover) {
      setError('대표 이미지를 넣어 주세요.');
      return;
    }
    if (!isEdit && !cover.file) {
      setError('대표 이미지를 넣어 주세요.');
      return;
    }
    if (!isEdit && extras.length !== EXTRA_COUNT) {
      setError(`추가 이미지는 ${EXTRA_COUNT}장 올려 주세요.`);
      return;
    }
    if (isEdit && extras.length < 1) {
      setError('추가 이미지를 1장 이상 남겨 주세요.');
      return;
    }
    if (!title.trim()) {
      setError('상품명을 입력해 주세요.');
      return;
    }
    const regular = Number(regularPrice);
    const sale = Number(salePrice);
    if (!Number.isFinite(regular) || regular <= 0 || !Number.isFinite(sale) || sale <= 0) {
      setError('가격은 0보다 큰 숫자로 입력해 주세요.');
      return;
    }
    if (!minPurchaseLabel.trim() || !limitLabel.trim() || !quantityLabel.trim() || !remainingLabel.trim()) {
      setError('공동구매 최소 주문, 한계 수량, 수량, 잔여 수량을 입력해 주세요.');
      return;
    }
    const minPurchase = quantityAmount(minPurchaseLabel);
    const limit = quantityAmount(limitLabel);
    const totalQuantity = quantityAmount(quantityLabel);
    const remaining = quantityAmount(remainingLabel);
    if (minPurchase == null || minPurchase <= 0 || limit == null || totalQuantity == null || remaining == null) {
      setError('공동구매 최소 주문, 한계 수량, 수량, 잔여 수량은 숫자로 입력해 주세요.');
      return;
    }
    if (limit < minPurchase) {
      setError('한계 수량은 공동구매 최소 주문보다 적을 수 없습니다.');
      return;
    }
    if (!isEdit && remaining < minPurchase) {
      setError('등록할 때 잔여 수량은 공동구매 최소 주문보다 적을 수 없습니다.');
      return;
    }
    if (remaining > limit) {
      setError('잔여 수량은 한계 수량보다 많을 수 없습니다.');
      return;
    }
    if (totalQuantity < remaining) {
      setError('잔여 수량은 전체 수량보다 많을 수 없습니다.');
      return;
    }
    if (!deadline) {
      setError('마감일을 선택해 주세요.');
      return;
    }
    if (!description.trim()) {
      setError('상품 안내를 입력해 주세요.');
      return;
    }
    if (!isSellerProfileComplete(profile)) {
      router.replace(`/seller/profile?next=${returnPath}`);
      return;
    }

    setPending(true);
    void (async () => {
      try {
        const payload = {
          title: title.trim(),
          sellerId: user.uid,
          sellerName: profile.sellerName,
          representativeName: profile.representativeName,
          businessVerified: profile.businessVerified,
          sellerPhone: profile.sellerPhone,
          sellerEmail: profile.sellerEmail,
          regularPrice: regular,
          salePrice: sale,
          minPurchaseLabel: minPurchaseLabel.trim(),
          limitLabel: limitLabel.trim(),
          quantityLabel: quantityLabel.trim(),
          remainingLabel: remainingLabel.trim(),
          deadline,
          description: description.trim(),
        };
        const item =
          isEdit && listing
            ? await updateRemoteSellListing({
                ...listing,
                ...payload,
                images: await resolveSellImages(user.uid, listing.id, [cover, ...extras]),
              })
            : await createRemoteSellListing(
                { ...payload, id: `u-${crypto.randomUUID()}` },
                [cover.file as File, ...extras.map((entry) => entry.file as File)],
              );
        router.push(`/sell/${item.id}`);
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : isEdit ? '수정에 실패했습니다.' : '등록에 실패했습니다.');
        setPending(false);
      }
    })();
  }

  if (loading || !user || !profileReady || !isSellerProfileComplete(profile)) {
    return <p className="text-sm text-muted">불러오는 중…</p>;
  }

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      <section>
        <h2 className="text-sm font-bold text-ink">상품 사진</h2>
        <p className="mt-1 text-sm text-muted">대표 이미지 1장과 추가 이미지 {EXTRA_COUNT}장을 올려 주세요.</p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink">대표 이미지</span>
            <span className="flex min-h-40 cursor-pointer flex-col items-center justify-center border border-dashed border-line bg-slate-50">
              {cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cover.url} alt="대표 이미지" className="h-40 w-full object-cover" />
              ) : (
                <span className="px-4 py-8 text-center text-sm text-subtle">클릭해서 대표 사진을 넣으세요</span>
              )}
            </span>
            <input type="file" accept="image/*" className="sr-only" onChange={(event) => handleCover(event.target.files)} />
          </label>

          <div>
            <span className="mb-2 block text-sm font-semibold text-ink">추가 이미지</span>
            <div className="grid grid-cols-4 gap-2">
              {extras.map((item) => (
                <div key={item.id} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.url} alt="" className="h-24 w-full border border-line object-cover" />
                  <button
                    type="button"
                    className="absolute right-1 top-1 bg-ink px-1.5 py-0.5 text-[10px] text-white"
                    onClick={() => setExtras((current) => current.filter((entry) => entry.id !== item.id))}
                  >
                    삭제
                  </button>
                </div>
              ))}
              {extras.length < EXTRA_COUNT ? (
                <label className="flex h-24 cursor-pointer items-center justify-center border border-dashed border-line text-xs text-subtle">
                  + 추가
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="sr-only"
                    onChange={(event) => handleExtras(event.target.files)}
                  />
                </label>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-bold text-ink">상품 정보</h2>
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-ink">상품명</span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} className={inputClassName} required />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-ink">정상가 (원)</span>
            <input
              type="number"
              min={1}
              value={regularPrice}
              onChange={(event) => setRegularPrice(event.target.value)}
              className={inputClassName}
              required
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-ink">특판가 (원)</span>
            <input
              type="number"
              min={1}
              value={salePrice}
              onChange={(event) => setSalePrice(event.target.value)}
              className={inputClassName}
              required
            />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-ink">공동구매 최소 주문</span>
            <input
              value={minPurchaseLabel}
              onChange={(event) => setMinPurchaseLabel(event.target.value)}
              className={inputClassName}
              placeholder="예: 20포"
              required
            />
            <span className="block text-xs text-subtle">마감 전까지 이 수량이 모일 때마다 거래합니다. 잔여가 이 수량 이상이면 추가 거래할 수 있습니다.</span>
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-ink">한계 수량</span>
            <input
              value={limitLabel}
              onChange={(event) => setLimitLabel(event.target.value)}
              className={inputClassName}
              placeholder="예: 100포"
              required
            />
            <span className="block text-xs text-subtle">마감까지 이 공구에서 받을 수 있는 전체 한도입니다. 한 번만 파는 수량이 아닙니다.</span>
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-ink">수량</span>
            <input
              value={quantityLabel}
              onChange={(event) => setQuantityLabel(event.target.value)}
              className={inputClassName}
              placeholder="예: 100포"
              required
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-ink">잔여 수량</span>
            <input
              value={remainingLabel}
              onChange={(event) => setRemainingLabel(event.target.value)}
              className={inputClassName}
              placeholder="예: 100포"
              required
            />
            <span className="block text-xs text-subtle">
              판매 확정 때만 줄어듭니다. 최소 주문보다 적으면 잔여 부족으로 구매 참여를 받지 않습니다.
            </span>
          </label>
        </div>
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-ink">마감일</span>
          <input
            type="date"
            value={deadline}
            onChange={(event) => setDeadline(event.target.value)}
            className={inputClassName}
            required
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-ink">상품 안내</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className={`${inputClassName} h-32 py-3`}
            required
          />
        </label>
      </section>

      {error ? (
        <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? (isEdit ? '수정 중…' : '등록 중…') : isEdit ? '수정하기' : '등록하기'}
      </button>
    </form>
  );
}
