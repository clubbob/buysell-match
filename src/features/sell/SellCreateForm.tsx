'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/features/auth/auth-context';
import { inputClassName } from '@/features/auth/auth-errors';
import { useSellerProfile } from '@/features/seller/use-seller-profile';
import { loginHref } from '@/lib/auth-redirect';
import { listingGuide } from '@/lib/sell-guide';
import { quantityAmount } from '@/lib/sell-display';
import { isHttpUrl, normalizeHttpUrl, sourceTypeFromUrls, youtubeVideoId } from '@/lib/sell-source';
import { createRemoteSellListing, resolveSellImages, updateRemoteSellListing } from '@/lib/sell-remote';
import { cn } from '@/lib/utils';
import { isSellerProfileComplete } from '@/types/seller';
import type { SellListing } from '@/types/sell';
import {
  EXTRA_IMAGE_COUNT,
  IMAGE_SLOT_COUNT,
  SPEC_GRID,
  SPEC_PANEL_PAD,
  SPEC_PRICE_FIELDS,
  SPEC_QTY_FIELDS,
  SPEC_ROW,
} from '@/features/sell/sell-spec-ui';

type ImageItem = {
  id: string;
  url: string;
  file: File | null;
};

type GuideTab = 'guide' | 'reviews' | 'inquiries';

function toImageItem(file: File): ImageItem {
  return {
    id: `${file.name}-${file.size}-${file.lastModified}`,
    url: URL.createObjectURL(file),
    file,
  };
}

function SpecField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={`${SPEC_ROW} border-b border-line py-3`}>
      <dt className="whitespace-nowrap text-subtle">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative min-h-12 flex-1 whitespace-nowrap px-2 text-sm font-semibold sm:px-4',
        active ? 'text-ink after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:bg-ink sm:after:inset-x-4' : 'text-muted',
      )}
    >
      {children}
    </button>
  );
}

export default function SellCreateForm({ listing }: { listing?: SellListing }) {
  const isEdit = Boolean(listing);
  const router = useRouter();
  const { user, loading } = useAuth();
  const { profile, ready: profileReady } = useSellerProfile(user?.uid);
  const [cover, setCover] = useState<ImageItem | null>(
    listing?.images[0] ? { id: 'cover', url: listing.images[0], file: null } : null,
  );
  const [extras, setExtras] = useState<ImageItem[]>(
    (listing?.images.slice(1) ?? []).map((url, index) => ({ id: `extra-${index}`, url, file: null })),
  );
  const [activeImage, setActiveImage] = useState(0);
  const [title, setTitle] = useState(listing?.title ?? '');
  const [regularPrice, setRegularPrice] = useState(listing ? String(listing.regularPrice) : '');
  const [salePrice, setSalePrice] = useState(listing ? String(listing.salePrice) : '');
  const [minPurchaseLabel, setMinPurchaseLabel] = useState(listing?.minPurchaseLabel ?? '');
  const [remainingLabel, setRemainingLabel] = useState(listing?.remainingLabel ?? '');
  const [deadline, setDeadline] = useState(listing?.deadline ?? '');
  const [coupangUrl, setCoupangUrl] = useState(listing?.coupangUrl ?? '');
  const [smartstoreUrl, setSmartstoreUrl] = useState(listing?.smartstoreUrl ?? '');
  const [youtubeUrl, setYoutubeUrl] = useState(listing?.youtubeUrl ?? '');
  const initialGuide = listing ? listingGuide(listing) : { intro: '', spec: '', trade: '' };
  const [description, setDescription] = useState(initialGuide.intro);
  const [specText, setSpecText] = useState(initialGuide.spec);
  const [tradeText, setTradeText] = useState(initialGuide.trade);
  const [guideTab, setGuideTab] = useState<GuideTab>('guide');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const pickSlot = useRef(0);
  const fileInput = useRef<HTMLInputElement>(null);
  const guidePanel = useRef<HTMLElement>(null);

  const returnPath = isEdit && listing ? `/sell/${listing.id}/edit` : '/sell/new';
  const images = [cover, ...extras];
  const current = images[activeImage] ?? images[0];

  useEffect(() => {
    if (!loading && !user) router.replace(loginHref(returnPath));
  }, [loading, user, router, returnPath]);

  useEffect(() => {
    if (!loading && user && profileReady && !isSellerProfileComplete(profile)) {
      router.replace(`/seller/profile?next=${returnPath}`);
    }
  }, [loading, user, profile, profileReady, router, returnPath]);

  function openPicker(slot: number) {
    pickSlot.current = slot;
    if (fileInput.current) {
      fileInput.current.value = '';
      fileInput.current.click();
    }
  }

  function handlePicked(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    const slot = pickSlot.current;
    const next = toImageItem(file);
    if (slot <= 0) {
      setCover(next);
      setActiveImage(0);
      return;
    }
    const extraIndex = Math.min(Math.max(slot - 1, extras.length), EXTRA_IMAGE_COUNT - 1);
    setExtras((currentExtras) => {
      if (currentExtras.length >= EXTRA_IMAGE_COUNT) return currentExtras;
      if (extraIndex < currentExtras.length) {
        const copy = [...currentExtras];
        copy[extraIndex] = next;
        return copy;
      }
      return [...currentExtras, next];
    });
    setActiveImage(extraIndex + 1);
  }

  function removeCover() {
    setCover(null);
    setActiveImage(0);
  }

  function removeExtra(index: number) {
    setExtras((currentExtras) => currentExtras.filter((_, extraIndex) => extraIndex !== index));
    setActiveImage((value) => (value === index + 1 ? 0 : value > index + 1 ? value - 1 : value));
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
    if (!isEdit && extras.length !== EXTRA_IMAGE_COUNT) {
      setError(`추가 이미지는 ${EXTRA_IMAGE_COUNT}장 올려 주세요.`);
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
    if (!minPurchaseLabel.trim() || !remainingLabel.trim()) {
      setError('공구 최소 주문, 잔여 수량을 입력해 주세요.');
      return;
    }
    const minPurchase = quantityAmount(minPurchaseLabel);
    const remaining = quantityAmount(remainingLabel);
    if (minPurchase == null || minPurchase <= 0 || remaining == null) {
      setError('공구 최소 주문, 잔여 수량은 숫자로 입력해 주세요.');
      return;
    }
    if (!isEdit && remaining < minPurchase) {
      setError('등록할 때 잔여 수량은 공구 최소 주문보다 적을 수 없습니다.');
      return;
    }
    if (!deadline) {
      setError('마감을 선택해 주세요.');
      return;
    }
    const nextCoupangUrl = coupangUrl.trim() ? normalizeHttpUrl(coupangUrl) : '';
    const nextSmartstoreUrl = smartstoreUrl.trim() ? normalizeHttpUrl(smartstoreUrl) : '';
    const nextYoutubeUrl = youtubeUrl.trim() ? normalizeHttpUrl(youtubeUrl) : '';
    if (nextCoupangUrl && !isHttpUrl(nextCoupangUrl)) {
      setError('쿠팡 URL을 확인해 주세요.');
      return;
    }
    if (nextSmartstoreUrl && !isHttpUrl(nextSmartstoreUrl)) {
      setError('스마트스토어 URL을 확인해 주세요.');
      return;
    }
    if (nextYoutubeUrl && !youtubeVideoId(nextYoutubeUrl)) {
      setError('유튜브 판매상품 URL을 확인해 주세요.');
      return;
    }
    if (!description.trim() || !specText.trim() || !tradeText.trim()) {
      setGuideTab('guide');
      setError('소개, 구성·규격, 결제·배송·교환을 모두 입력해 주세요.');
      window.requestAnimationFrame(() => {
        guidePanel.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
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
          sellerMobile: profile.sellerMobile,
          sellerPhone: profile.sellerPhone,
          sellerEmail: user.email || profile.sellerEmail,
          regularPrice: regular,
          salePrice: sale,
          minPurchaseLabel: minPurchaseLabel.trim(),
          limitLabel: remainingLabel.trim(),
          quantityLabel: remainingLabel.trim(),
          remainingLabel: remainingLabel.trim(),
          deadline,
          sourceType: sourceTypeFromUrls(Boolean(nextCoupangUrl || nextSmartstoreUrl), nextYoutubeUrl),
          coupangUrl: nextCoupangUrl,
          smartstoreUrl: nextSmartstoreUrl,
          productUrl: nextCoupangUrl || nextSmartstoreUrl,
          productUrls: [nextCoupangUrl, nextSmartstoreUrl].filter(Boolean),
          youtubeUrl: nextYoutubeUrl,
          description: description.trim(),
          specText: specText.trim(),
          tradeText: tradeText.trim(),
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
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      <input ref={fileInput} type="file" accept="image/*" className="sr-only" onChange={(event) => handlePicked(event.target.files)} />

      <article className="panel overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          <div className="w-full border-b border-line lg:w-[22rem] lg:shrink-0 lg:self-stretch lg:border-b-0 lg:border-r">
            <div className="flex h-full flex-col bg-slate-50">
              <button
                type="button"
                className="relative min-h-0 flex-1"
                onClick={() => openPicker(activeImage)}
              >
                {current ? (
                  <img
                    src={current.url}
                    alt=""
                    className="aspect-square w-full bg-slate-50 object-contain p-3 lg:absolute lg:inset-0 lg:aspect-auto lg:h-full lg:w-full"
                  />
                ) : (
                  <span className="flex aspect-square w-full items-center justify-center px-4 text-center text-sm text-subtle lg:absolute lg:inset-0 lg:aspect-auto">
                    클릭해서 대표 사진을 넣으세요
                  </span>
                )}
                {current && activeImage === 0 ? (
                  <span className="absolute left-3 top-3 bg-ink px-2 py-1 text-[11px] font-semibold text-white">대표</span>
                ) : null}
              </button>
              <ul className="grid shrink-0 grid-cols-5 gap-px border-t border-line bg-line">
                {Array.from({ length: IMAGE_SLOT_COUNT }, (_, slot) => {
                  const item = images[slot];
                  return (
                    <li key={slot}>
                      {item ? (
                        <div className="relative">
                          <button
                            type="button"
                            className={cn(
                              'relative block w-full bg-white',
                              slot === activeImage ? 'ring-2 ring-inset ring-ink' : 'opacity-80 hover:opacity-100',
                            )}
                            onClick={() => setActiveImage(slot)}
                          >
                            <img src={item.url} alt="" className="aspect-square w-full object-contain bg-white p-1" />
                            {slot === 0 ? (
                              <span className="absolute left-1 top-1 bg-ink px-1.5 py-0.5 text-[10px] font-semibold text-white">
                                대표
                              </span>
                            ) : null}
                          </button>
                          <button
                            type="button"
                            className="absolute right-1 top-1 bg-ink px-1.5 py-0.5 text-[10px] text-white"
                            onClick={(event) => {
                              event.stopPropagation();
                              if (slot === 0) removeCover();
                              else removeExtra(slot - 1);
                            }}
                          >
                            삭제
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="flex aspect-square w-full items-center justify-center bg-white text-xs text-subtle"
                          onClick={() => openPicker(slot === 0 ? 0 : extras.length + 1)}
                        >
                          + 추가
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className={`min-w-0 flex-1 ${SPEC_PANEL_PAD}`}>
            <dl className={SPEC_GRID}>
              <SpecField label="상품명">
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className={inputClassName}
                  placeholder="상품명"
                  required
                />
              </SpecField>
              <div className={`${SPEC_ROW} gap-y-2 border-b border-line py-3`}>
                <p className="col-span-2 whitespace-nowrap text-subtle">온라인 판매상품 URL (선택)</p>
                <label htmlFor="sell-coupang-url" className="whitespace-nowrap text-subtle">
                  쿠팡
                </label>
                <input
                  id="sell-coupang-url"
                  type="text"
                  inputMode="url"
                  value={coupangUrl}
                  onChange={(event) => setCoupangUrl(event.target.value)}
                  className={inputClassName}
                  placeholder="상품 URL 주소"
                />
                <label htmlFor="sell-smartstore-url" className="whitespace-nowrap text-subtle">
                  스마트스토어
                </label>
                <input
                  id="sell-smartstore-url"
                  type="text"
                  inputMode="url"
                  value={smartstoreUrl}
                  onChange={(event) => setSmartstoreUrl(event.target.value)}
                  className={inputClassName}
                  placeholder="상품 URL 주소"
                />
              </div>
              <div className={`${SPEC_ROW} gap-y-2 border-b border-line py-3`}>
                <p className="col-span-2 whitespace-nowrap text-subtle">유튜브 판매상품 URL (선택)</p>
                <span aria-hidden />
                <input
                  type="text"
                  inputMode="url"
                  value={youtubeUrl}
                  onChange={(event) => setYoutubeUrl(event.target.value)}
                  className={inputClassName}
                  placeholder="영상 URL 주소"
                  aria-label="유튜브 판매상품 URL"
                />
              </div>
              <div className={`${SPEC_ROW} border-b border-line py-3`}>
                <label htmlFor="sell-regular-price" className="whitespace-nowrap text-subtle">
                  정상 가격
                </label>
                <div className={SPEC_PRICE_FIELDS}>
                  <input
                    id="sell-regular-price"
                    type="number"
                    min={1}
                    value={regularPrice}
                    onChange={(event) => setRegularPrice(event.target.value)}
                    className={`${inputClassName} min-w-0`}
                    placeholder="원"
                    required
                  />
                  <label htmlFor="sell-sale-price" className="whitespace-nowrap text-subtle">
                    특판 가격
                  </label>
                  <input
                    id="sell-sale-price"
                    type="number"
                    min={1}
                    value={salePrice}
                    onChange={(event) => setSalePrice(event.target.value)}
                    className={`${inputClassName} min-w-0`}
                    placeholder="원"
                    required
                  />
                </div>
              </div>
              <div className={`${SPEC_ROW} py-3`}>
                <label htmlFor="sell-min-purchase" className="whitespace-nowrap text-subtle">
                  공구 최소 주문
                </label>
                <div className={SPEC_QTY_FIELDS}>
                  <input
                    id="sell-min-purchase"
                    value={minPurchaseLabel}
                    onChange={(event) => setMinPurchaseLabel(event.target.value)}
                    className={`${inputClassName} min-w-0`}
                    placeholder="예: 20개"
                    required
                  />
                  <label htmlFor="sell-remaining" className="whitespace-nowrap text-subtle">
                    잔여 수량
                  </label>
                  <input
                    id="sell-remaining"
                    value={remainingLabel}
                    onChange={(event) => setRemainingLabel(event.target.value)}
                    className={`${inputClassName} min-w-0`}
                    placeholder="예: 80개"
                    required
                  />
                  <label htmlFor="sell-deadline" className="whitespace-nowrap text-subtle">
                    마감
                  </label>
                  <input
                    id="sell-deadline"
                    type="date"
                    value={deadline}
                    onChange={(event) => setDeadline(event.target.value)}
                    className={`${inputClassName} min-w-0`}
                    required
                  />
                </div>
              </div>
            </dl>
          </div>
        </div>
      </article>

      <section ref={guidePanel} className="panel overflow-hidden">
        <div className="flex border-b border-line">
          <TabButton active={guideTab === 'guide'} onClick={() => setGuideTab('guide')}>
            상품 안내
          </TabButton>
          <TabButton active={guideTab === 'reviews'} onClick={() => setGuideTab('reviews')}>
            구매자 후기 0
          </TabButton>
          <TabButton active={guideTab === 'inquiries'} onClick={() => setGuideTab('inquiries')}>
            상품 문의 0
          </TabButton>
        </div>

        <div hidden={guideTab !== 'guide'}>
          <div className="space-y-5 px-4 py-6 sm:px-6 sm:py-7">
            {error?.includes('소개') ? (
              <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-danger" role="alert">
                {error}
              </p>
            ) : null}
            <label className="block space-y-2">
              <span className="text-sm font-bold text-ink">소개</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className={`${inputClassName} h-28 py-3`}
                placeholder="어떤 상품인지 한눈에 보이게 적어 주세요."
              />
            </label>
            <label className="block space-y-2 border-t border-line pt-5">
              <span className="text-sm font-bold text-ink">구성·규격</span>
              <textarea
                value={specText}
                onChange={(event) => setSpecText(event.target.value)}
                className={`${inputClassName} h-32 py-3`}
                placeholder="구성품, 수량, 크기, 소재처럼 확인에 필요한 내용을 적습니다."
              />
            </label>
            <label className="block space-y-2 border-t border-line pt-5">
              <span className="text-sm font-bold text-ink">결제·배송·교환</span>
              <textarea
                value={tradeText}
                onChange={(event) => setTradeText(event.target.value)}
                className={`${inputClassName} h-32 py-3`}
                placeholder="입금 방법, 배송, 교환·반품은 판매자 조건을 구체적으로 적습니다."
              />
            </label>
          </div>
        </div>
        <div hidden={guideTab !== 'reviews'}>
          <p className="px-4 py-10 text-center text-sm text-muted sm:px-6">아직 구매자 후기가 없습니다.</p>
        </div>
        <div hidden={guideTab !== 'inquiries'}>
          <p className="px-4 py-10 text-center text-sm text-muted sm:px-6">아직 상품 문의가 없습니다.</p>
        </div>
      </section>

      <div className="panel px-4 py-4 sm:px-6">
        {error ? (
          <p className="mb-3 text-center text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}
        <div className="flex justify-center">
          <button type="submit" className="btn-primary" disabled={pending}>
            {pending ? (isEdit ? '수정 중…' : '등록 중…') : isEdit ? '수정하기' : '등록하기'}
          </button>
        </div>
      </div>

      <p className="text-xs leading-relaxed text-subtle">
        공구매칭은 통신판매중개자이며 결제·정산·배송의 당사자가 아닙니다. 거래는 판매자와 구매자 사이에서 이루어집니다.
      </p>
    </form>
  );
}
