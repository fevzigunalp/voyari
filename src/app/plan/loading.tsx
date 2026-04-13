export default function PlanLoading() {
  return (
    <main className="min-h-[100svh] flex items-center justify-center px-6 py-24 bg-bg-primary text-text-primary">
      <div className="w-full max-w-3xl">
        <div className="h-4 w-40 rounded bg-white/[0.06] animate-pulse" />
        <div className="mt-6 rounded-3xl border border-white/[0.06] bg-[rgba(17,24,39,0.5)] p-8 sm:p-10">
          <div className="h-3 w-24 rounded bg-white/[0.06] animate-pulse" />
          <div className="mt-5 h-9 w-3/4 rounded bg-white/[0.08] animate-pulse" />
          <div className="mt-3 h-4 w-1/2 rounded bg-white/[0.05] animate-pulse" />
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-12 rounded-xl bg-white/[0.04] animate-pulse"
              />
            ))}
          </div>
          <div className="mt-8 pt-6 border-t border-white/[0.06] flex justify-between">
            <div className="h-10 w-24 rounded-xl bg-white/[0.04] animate-pulse" />
            <div className="h-10 w-32 rounded-xl bg-[rgba(212,168,83,0.15)] animate-pulse" />
          </div>
        </div>
      </div>
    </main>
  );
}
