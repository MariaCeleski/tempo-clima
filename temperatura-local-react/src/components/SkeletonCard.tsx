export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 dark:border-white/25 bg-white/80 dark:bg-white/10 p-6 shadow-lg dark:shadow-none backdrop-blur-md" role="status" aria-label="Carregando dados do clima">
      <span className="sr-only">Carregando dados do clima...</span>
      {/* City name */}
      <div className="mx-auto mb-1 h-7 w-40 rounded-lg bg-slate-200 dark:bg-white/20" />
      {/* State */}
      <div className="mx-auto mb-4 h-4 w-24 rounded bg-slate-100 dark:bg-white/10" />

      <div className="flex flex-col items-center gap-4">
        {/* Icon */}
        <div className="h-24 w-24 rounded-full bg-slate-200 dark:bg-white/15" />

        <div className="grid w-full gap-3">
          {/* Temperature */}
          <div className="mx-auto h-9 w-28 rounded-lg bg-slate-200 dark:bg-white/20" />
          {/* Feels like */}
          <div className="mx-auto h-4 w-32 rounded bg-slate-100 dark:bg-white/10" />
          {/* Description */}
          <div className="mx-auto h-6 w-36 rounded bg-slate-200 dark:bg-white/15" />
          {/* Humidity + Wind */}
          <div className="flex justify-center gap-6">
            <div className="h-5 w-20 rounded bg-slate-100 dark:bg-white/10" />
            <div className="h-5 w-24 rounded bg-slate-100 dark:bg-white/10" />
          </div>
          {/* Sunrise + Sunset */}
          <div className="flex justify-center gap-6">
            <div className="h-4 w-16 rounded bg-slate-100 dark:bg-white/10" />
            <div className="h-4 w-16 rounded bg-slate-100 dark:bg-white/10" />
          </div>
          {/* Clock */}
          <div className="mx-auto h-4 w-36 rounded bg-slate-100 dark:bg-white/10" />
          {/* Suggestion */}
          <div className="mx-auto mt-2 h-8 w-full rounded-lg bg-slate-50 dark:bg-white/5" />
        </div>
      </div>
    </div>
  );
}
