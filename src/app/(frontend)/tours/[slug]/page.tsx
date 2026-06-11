import { notFound } from 'next/navigation'
import Image from 'next/image'
import type { Metadata } from 'next'
import { getTourBySlug } from '@/lib/booking/service'
import { getMediaUrl } from '@/lib/cms/queries'
import { BookingWidget } from '@/components/booking/BookingWidget'
import { JsonLd } from '@/components/seo/JsonLd'
import { buildMetadata, buildTourJsonLd } from '@/lib/seo/metadata'
import { Star, MapPin, Clock, Check, X } from 'lucide-react'

export const revalidate = 60

interface TourPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: TourPageProps): Promise<Metadata> {
  const { slug } = await params
  const tour = await getTourBySlug(slug)

  if (!tour) {
    return buildMetadata({ title: 'Tour Not Found', noIndex: true })
  }

  return buildMetadata({
    title: tour.seo?.metaTitle ?? tour.title,
    description: tour.seo?.metaDescription ?? tour.shortDescription,
    path: `/tours/${slug}`,
    ogImage: getMediaUrl(tour.seo?.ogImage) ?? getMediaUrl(tour.coverImage),
  })
}

export default async function TourDetailPage({ params }: TourPageProps) {
  const { slug } = await params
  const tour = await getTourBySlug(slug)

  if (!tour) {
    notFound()
  }

  const coverUrl = getMediaUrl(tour.coverImage)
  const galleryImages = (tour.gallery ?? [])
    .map((g) => getMediaUrl(g.image))
    .filter((url): url is string => Boolean(url))

  return (
    <>
      <JsonLd
        data={buildTourJsonLd({
          title: tour.title,
          description: tour.shortDescription,
          slug: tour.slug,
          rating: tour.rating,
          reviewCount: tour.reviewCount,
          coverImageUrl: coverUrl,
        })}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-slate-100">
              {coverUrl && (
                <Image
                  src={coverUrl}
                  alt={tour.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="object-cover"
                />
              )}
            </div>

            {galleryImages.length > 0 && (
              <div className="mt-4 grid grid-cols-4 gap-2">
                {galleryImages.map((url, i) => (
                  <div key={i} className="relative aspect-square overflow-hidden rounded-lg">
                    <Image src={url} alt="" fill sizes="25vw" className="object-cover" />
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8">
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {tour.location}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {tour.duration}
                </span>
                {tour.rating != null && (
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    {tour.rating.toFixed(1)} ({tour.reviewCount ?? 0} reviews)
                  </span>
                )}
              </div>

              <h1 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">{tour.title}</h1>
              <p className="mt-4 text-lg text-slate-600">{tour.shortDescription}</p>
            </div>

            {(tour.highlights?.length ?? 0) > 0 && (
              <section className="mt-10">
                <h2 className="text-xl font-bold text-slate-900">Highlights</h2>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {tour.highlights?.map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
                      {h.text}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <div className="mt-10 grid gap-8 sm:grid-cols-2">
              {(tour.included?.length ?? 0) > 0 && (
                <section>
                  <h2 className="text-xl font-bold text-slate-900">Included</h2>
                  <ul className="mt-4 space-y-2">
                    {tour.included?.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                        {item.item}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {(tour.excluded?.length ?? 0) > 0 && (
                <section>
                  <h2 className="text-xl font-bold text-slate-900">Not Included</h2>
                  <ul className="mt-4 space-y-2">
                    {tour.excluded?.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <X className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                        {item.item}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>

            {(tour.itinerary?.length ?? 0) > 0 && (
              <section className="mt-10">
                <h2 className="text-xl font-bold text-slate-900">Itinerary</h2>
                <ol className="mt-6 space-y-6 border-l-2 border-sky-200 pl-6">
                  {tour.itinerary?.map((step, i) => (
                    <li key={i} className="relative">
                      <span className="absolute -left-[1.6rem] flex h-5 w-5 items-center justify-center rounded-full bg-sky-600 text-xs font-bold text-white">
                        {i + 1}
                      </span>
                      {step.time && (
                        <span className="text-xs font-medium text-sky-600">{step.time}</span>
                      )}
                      <h3 className="font-semibold text-slate-900">{step.title}</h3>
                      {step.description && (
                        <p className="mt-1 text-sm text-slate-600">{step.description}</p>
                      )}
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {(tour.reviews?.length ?? 0) > 0 && (
              <section className="mt-10">
                <h2 className="text-xl font-bold text-slate-900">Reviews</h2>
                <div className="mt-6 space-y-4">
                  {tour.reviews?.map((review, i) => (
                    <div key={i} className="rounded-xl border border-slate-200 p-5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">{review.author}</span>
                        <div className="flex gap-0.5">
                          {Array.from({ length: review.rating }).map((_, j) => (
                            <Star key={j} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div>
            <BookingWidget
              tourId={tour.id}
              bokunActivityId={tour.bokunActivityId}
              tourTitle={tour.title}
            />
          </div>
        </div>
      </div>
    </>
  )
}
