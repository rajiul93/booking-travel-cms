import Link from 'next/link'
import Image from 'next/image'
import {
  getFeaturedTours,
  getPublishedBlogPosts,
  getMediaUrl,
  getHomepageDestinations,
  getSiteSettings,
} from '@/lib/cms/queries'
import { TourCard } from '@/components/tours/TourCard'
import { HeroBookingSearch } from '@/components/home/HeroBookingSearch'
import { HeroImageSlider } from '@/components/home/HeroImageSlider'
import { ArrowRight, Star } from 'lucide-react'

export const revalidate = 60

export default async function HomePage() {
  const [featuredTours, blogPosts, destinations, site] = await Promise.all([
    getFeaturedTours(6),
    getPublishedBlogPosts(3),
    getHomepageDestinations(),
    getSiteSettings(),
  ])

  return (
    <>
      <section className="relative isolate min-h-[520px] overflow-hidden bg-slate-900 text-white sm:min-h-[600px]">
        <div className="pointer-events-none absolute inset-0 z-0">
          <HeroImageSlider
            slides={site.heroSlides}
            autoplay={site.heroSliderAutoplay}
            interval={site.heroSliderInterval}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/25" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[520px] max-w-7xl flex-col justify-end px-4 pb-10 pt-24 sm:min-h-[600px] sm:px-6 sm:pb-14 lg:px-8">
          {(site.heroEyebrow || site.heroTitle || site.heroSubtitle) && (
            <div className="max-w-3xl">
              {site.heroEyebrow && (
                <p className="text-sm font-semibold uppercase tracking-widest text-amber-300">
                  {site.heroEyebrow}
                </p>
              )}
              {site.heroTitle && (
                <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                  {site.heroTitle}
                </h1>
              )}
              {site.heroSubtitle && (
                <p className="mt-4 max-w-xl text-base leading-relaxed text-white/90 sm:text-lg">
                  {site.heroSubtitle}
                </p>
              )}
            </div>
          )}

          <HeroBookingSearch destinations={destinations} className="mt-8 sm:mt-10" />
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

      {site.testimonials.length > 0 && (
        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-3xl font-bold text-slate-900">What Travelers Say</h2>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {site.testimonials.map((t) => (
                <blockquote
                  key={`${t.name}-${t.location}`}
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
      )}

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

      {(site.ctaTitle || site.ctaSubtitle) && (
        <section className="bg-sky-600 py-16 text-white">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            {site.ctaTitle && <h2 className="text-3xl font-bold">{site.ctaTitle}</h2>}
            {site.ctaSubtitle && (
              <p className="mx-auto mt-4 max-w-xl text-sky-100">{site.ctaSubtitle}</p>
            )}
            <Link
              href="/tours"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-50"
            >
              Start Exploring
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}
    </>
  )
}
