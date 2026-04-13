export default function ResultLoading() {
  return (
    <main className="min-h-[100svh] bg-bg-primary text-text-primary">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="flex justify-end mb-4">
          <div className="h-9 w-40 rounded-lg bg-[rgba(212,168,83,0.2)] animate-pulse" />
        </div>

        <div className="rounded-3xl border border-white/[0.06] bg-[rgba(17,24,39,0.5)] p-6 md:p-8">
          <div className="h-3 w-24 rounded bg-white/[0.06] animate-pulse" />
          <div className="mt-4 h-10 w-3/4 rounded bg-white/[0.08] animate-pulse" />
          <div className="mt-3 h-4 w-1/2 rounded bg-white/[0.05] animate-pulse" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-24 rounded-2xl bg-white/[0.04] animate-pulse"
              />
            ))}
          </div>
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-9 w-28 rounded-full bg-white/[0.05] animate-pulse shrink-0"
            />
          ))}
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-[260px_1fr]">
          <div className="hidden md:flex flex-col gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-16 rounded-xl bg-white/[0.04] animate-pulse"
              />
            ))}
          </div>
          <div className="flex flex-col gap-5">
            <div className="h-64 rounded-2xl bg-white/[0.04] animate-pulse" />
            <div className="h-80 rounded-2xl bg-white/[0.04] animate-pulse" />
          </div>
        </div>
      </div>
    </main>
  );
}
