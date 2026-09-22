export default function PageIntro({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="border-b border-line pb-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {eyebrow ? <p className="text-xs font-semibold tracking-wide text-subtle">{eyebrow}</p> : null}
          <h1 className={`${eyebrow ? 'mt-1 ' : ''}text-2xl font-bold tracking-tight text-ink sm:text-[1.75rem]`}>{title}</h1>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted sm:text-[15px]">{description}</p>
          ) : null}
        </div>
        {children ? <div className="ml-auto shrink-0">{children}</div> : null}
      </div>
    </section>
  );
}
