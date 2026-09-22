export function PostCardSkeleton() {
  return (
    <div className="overflow-hidden" aria-hidden="true">
      <div className="aspect-[16/10] animate-pulse bg-white/10" />
      <div className="space-y-3 px-4 pt-4 sm:px-0">
        <div className="h-6 w-20 animate-pulse rounded-2xl bg-white/10" />
        <div className="space-y-2">
          <div className="h-5 w-full animate-pulse rounded bg-white/10" />
          <div className="h-5 w-[80%] animate-pulse rounded bg-white/10" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-white/[0.07]" />
          <div className="h-4 w-[60%] animate-pulse rounded bg-white/[0.07]" />
        </div>
        <div className="flex flex-col gap-2 pt-1">
          <div className="h-3 w-28 animate-pulse rounded bg-white/[0.07]" />
          <div className="flex items-center gap-2">
            <div className="size-8 animate-pulse rounded-full bg-white/10" />
            <div className="h-3 w-24 animate-pulse rounded bg-white/[0.07]" />
          </div>
        </div>
      </div>
    </div>
  );
}
