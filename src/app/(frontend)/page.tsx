import Link from 'next/link'
import Image from 'next/image'
import { getFeaturedTours, getPublishedBlogPosts, getMediaUrl } from '@/lib/cms/queries'
import { TourCard } from '@/components/tours/TourCard'
import { ArrowRight, Star } from 'lucide-react'

export const revalidate = 60

const testimonials = [
  {
    name: 'Sarah M.',
    location: 'London, UK',
    text: 'An absolutely magical experience. The guides were knowledgeable and every detail was perfectly organized.',
    rating: 5,
  },
  {
    name: 'Marco R.',
    location: 'Milan, Italy',
    text: 'Booking was seamless and the tour exceeded our expectations. Highly recommend Dream Tourism!',
    rating: 5,
  },
  {
    name: 'Emily K.',
    location: 'New York, USA',
    text: 'From booking to the final goodbye, everything was professional and unforgettable.',
    rating: 5,
  },
]

export default async function HomePage() {
  const [featuredTours, blogPosts] = await Promise.all([
    getFeaturedTours(6),
    getPublishedBlogPosts(3),
  ])

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-900 via-sky-800 to-slate-900 text-white">
        <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-10" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-sky-300">
              dreamtourism.it
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">
              Discover Italy&apos;s Most Unforgettable Tours
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-sky-100">
              Curated adventures, cultural experiences, and day trips with live
              availability and instant confirmation.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/tours"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-sky-900 transition hover:bg-sky-50"
              >
                Explore Tours
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Featured Tours</h2>
            <p className="mt-2 text-slate-600">Hand-picked experiences for every traveler</p>
          </div>
          <Link href="/tours" className="hidden text-sm font-semibold text-sky-600 hover:text-sky-700 sm:block">
            View all tours →
          </Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredTours.docs.map((tour) => (
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
            />
          ))}
        </div>
        {featuredTours.docs.length === 0 && (
          <p className="text-center text-slate-500">
            Featured tours will appear here once published in the admin panel.
          </p>
        )}
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-slate-900">What Travelers Say</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <blockquote
                key={t.name}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-6"
              >
                <div className="flex gap-1">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-600">&ldquo;{t.text}&rdquo;</p>
                <footer className="mt-4 text-sm font-semibold text-slate-900">
                  {t.name}
                  <span className="block font-normal text-slate-500">{t.location}</span>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {blogPosts.docs.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900">From the Blog</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {blogPosts.docs.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white"
              >
                <div className="relative aspect-video bg-slate-100">
                  {getMediaUrl(post.coverImage) && (
                    <Image
                      src={getMediaUrl(post.coverImage)!}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-slate-900 group-hover:text-sky-600">
                    {post.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-600">{post.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="bg-sky-600 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold">Ready for Your Next Adventure?</h2>
          <p className="mx-auto mt-4 max-w-xl text-sky-100">
            Browse our collection of tours and book your experience with live availability
            and secure Stripe checkout.
          </p>
          <Link
            href="/tours"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-50"
          >
            Start Exploring
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  )
}
