'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

export default function SellImageGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const current = images[active] ?? images[0];

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
      if (images.length < 2) return;
      if (event.key === 'ArrowLeft') setActive((index) => (index === 0 ? images.length - 1 : index - 1));
      if (event.key === 'ArrowRight') setActive((index) => (index === images.length - 1 ? 0 : index + 1));
    }
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, images.length]);

  if (!current) {
    return (
      <div className="flex aspect-square items-center justify-center bg-slate-50 text-sm text-subtle">사진 없음</div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <button
        type="button"
        className="relative min-h-0 flex-1 cursor-zoom-in"
        onClick={() => setOpen(true)}
        aria-label={`${alt} 크게 보기`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current}
          alt={alt}
          className="aspect-square w-full object-cover lg:absolute lg:inset-0 lg:h-full lg:w-full lg:aspect-auto"
        />
        {active === 0 ? (
          <span className="absolute left-3 top-3 bg-ink px-2 py-1 text-[11px] font-semibold text-white">대표</span>
        ) : null}
      </button>
      {images.length > 1 ? (
        <ul className="grid shrink-0 grid-cols-4 gap-px border-t border-line bg-line sm:grid-cols-5">
          {images.map((src, index) => (
            <li key={`${src}-${index}`}>
              <button
                type="button"
                className={cn(
                  'relative block w-full bg-white',
                  index === active ? 'ring-2 ring-inset ring-ink' : 'opacity-80 hover:opacity-100',
                )}
                onClick={() => setActive(index)}
                aria-label={index === 0 ? '대표 이미지' : `추가 이미지 ${index}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="aspect-square w-full object-cover" />
                {index === 0 ? (
                  <span className="absolute left-1 top-1 bg-ink px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    대표
                  </span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {open
        ? createPortal(
            <div
              className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/80 p-4"
              onClick={() => setOpen(false)}
              role="dialog"
              aria-modal="true"
              aria-label={`${alt} 크게 보기`}
            >
              <button
                type="button"
                className="btn-secondary absolute right-4 top-4 border-white bg-white"
                onClick={() => setOpen(false)}
              >
                닫기
              </button>
              {images.length > 1 ? (
                <button
                  type="button"
                  className="btn-secondary absolute left-4 top-1/2 -translate-y-1/2 border-white bg-white"
                  onClick={(event) => {
                    event.stopPropagation();
                    setActive((index) => (index === 0 ? images.length - 1 : index - 1));
                  }}
                >
                  이전
                </button>
              ) : null}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={current}
                alt={alt}
                className="max-h-[90vh] max-w-[min(90vw,52rem)] object-contain"
                onClick={(event) => event.stopPropagation()}
              />
              {images.length > 1 ? (
                <button
                  type="button"
                  className="btn-secondary absolute right-4 top-1/2 -translate-y-1/2 border-white bg-white"
                  onClick={(event) => {
                    event.stopPropagation();
                    setActive((index) => (index === images.length - 1 ? 0 : index + 1));
                  }}
                >
                  다음
                </button>
              ) : null}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
