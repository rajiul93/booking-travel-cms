import { HeroSkeleton, TourGridSkeleton } from '@/components/ui/Skeleton'

export default function HomeLoading() {
  return (
    <>
      <HeroSkeleton />
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="space-y-3">
          <div className="h-9 w-48 animate-pulse rounded-md bg-slate-200" />
          <div className="h-5 w-72 animate-pulse rounded-md bg-slate-200" />
        </div>
        <div className="mt-10">
          <TourGridSkeleton count={6} />
        </div>
      </section>
    </>
  )
}
