import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getTours, getMediaUrl } from '@/lib/cms/queries'
import { TourCard } from '@/components/tours/TourCard'
import { TourFilters } from '@/components/tours/TourFilters'
import { buildMetadata } from '@/lib/seo/metadata'
import Link from 'next/link'

export const revalidate = 60

export const metadata: Metadata = buildMetadata({
  title: 'Tours',
  description: 'Browse and book curated tours across Italy with live availability.',
  path: '/tours',
})

interface ToursPageProps {
  searchParams: Promise<{
    q?: string
    category?: string
    page?: string
    checkIn?: string
    checkOut?: string
  }>
}

export default async function ToursPage({ searchParams }: ToursPageProps) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const result = await getTours({
    q: params.q,
    category: params.category,
    page,
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-bold text-slate-900">Our Tours</h1>
        <p className="mt-3 text-lg text-slate-600">
          Explore unforgettable experiences with live Bókun availability and instant booking.
        </p>
        {params.checkIn && params.checkOut && (
          <p className="mt-2 text-sm font-medium text-sky-600">
            Showing tours for {params.checkIn} to {params.checkOut} — select a tour to pick your time slot.
          </p>
        )}
      </div>

      <div className="mt-8">
        <Suspense fallback={<div className="h-14 animate-pulse rounded-2xl bg-slate-200" />}>
          <TourFilters />
        </Suspense>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {result.docs.map((tour) => (
          <TourCard
            key={tour.id}
            slug={tour.slug}
            title={tour.title}
            shortDescription={tour.shortDescription}
            location={tour.location}
            duration={tour.duration}
            rating={tour.rating}
            reviewCount={tour.reviewCount}
            coverImageUrl={getMediaUrl(tour.coverImage)}
            checkIn={params.checkIn}
            checkOut={params.checkOut}
          />
        ))}
      </div>

      {result.docs.length === 0 && (
        <p className="py-20 text-center text-slate-500">No tours found matching your criteria.</p>
      )}

      {result.totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-4">
          {page > 1 && (
            <Link
              href={`/tours?${new URLSearchParams({ ...params, page: String(page - 1) }).toString()}`}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
            >
              Previous
            </Link>
          )}
          <span className="text-sm text-slate-600">
            Page {page} of {result.totalPages}
          </span>
          {page < result.totalPages && (
            <Link
              href={`/tours?${new URLSearchParams({ ...params, page: String(page + 1) }).toString()}`}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
