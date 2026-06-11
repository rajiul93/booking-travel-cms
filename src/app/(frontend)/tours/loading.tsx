import { TourGridSkeleton } from '@/components/ui/Skeleton'

export default function ToursLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-3">
        <div className="h-10 w-40 animate-pulse rounded-md bg-slate-200" />
        <div className="h-5 w-64 animate-pulse rounded-md bg-slate-200" />
      </div>
      <div className="mt-8 h-14 animate-pulse rounded-xl bg-slate-200" />
      <div className="mt-10">
        <TourGridSkeleton count={9} />
      </div>
    </div>
  )
}
