import { cn } from '@/lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-slate-200/80', className)} />
}

export function HeroSkeleton() {
  return (
    <section className="relative min-h-[520px] bg-slate-900 sm:min-h-[600px]">
      <Skeleton className="absolute inset-0 rounded-none bg-slate-800" />
      <div className="relative z-10 mx-auto flex min-h-[520px] max-w-7xl flex-col justify-end px-4 pb-10 pt-24 sm:min-h-[600px] sm:px-6 sm:pb-14 lg:px-8">
        <Skeleton className="h-4 w-32 bg-slate-700" />
        <Skeleton className="mt-4 h-12 w-full max-w-xl bg-slate-700" />
        <Skeleton className="mt-3 h-6 w-full max-w-lg bg-slate-700" />
        <Skeleton className="mt-10 h-24 w-full rounded-2xl bg-slate-700" />
      </div>
    </section>
  )
}

export function TourCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
  )
}

export function TourGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <TourCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function TourDetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Skeleton className="aspect-[16/9] w-full rounded-2xl" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-20 w-full" />
        </div>
        <Skeleton className="h-[520px] w-full rounded-2xl" />
      </div>
    </div>
  )
}
