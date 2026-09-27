import PageBack from '@/components/ui/PageBack';

export function LegalDoc({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <PageBack href="/">← 홈</PageBack>
      <article className="panel max-w-3xl px-4 py-6 text-sm leading-relaxed text-muted sm:px-6 sm:py-8">
        <h1 className="text-xl font-bold tracking-tight text-ink">{title}</h1>
        <p className="mt-2 text-xs text-subtle">시행일 2026.09.27</p>
        {children}
      </article>
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 first:mt-0">
      <h2 className="font-semibold text-ink">{title}</h2>
      <div className="mt-2 space-y-2">{children}</div>
    </section>
  );
}
