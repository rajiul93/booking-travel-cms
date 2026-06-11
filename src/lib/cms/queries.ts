import type { Where } from 'payload'
import { countryCodeToFlag } from '@/lib/country'
import { buildCacheKey, withCache } from '@/lib/cache'
import { getServerEnv } from '@/lib/env'
import { CMS_CACHE_TAGS } from '@/lib/cms/revalidate'
import { getPayloadCached } from '@/lib/cms/payload'
import type { BlogPost, Country, Tour } from '@/payload-types'

export interface HomepageDestination {
  name: string
  countryCode: string
  searchQuery: string
  flag: string
}

export interface TourCategoryOption {
  slug: string
  name: string
}

export interface SiteTestimonial {
  name: string
  location: string
  text: string
  rating: number
}

export interface HeroSlideData {
  id: string
  imageUrl: string
  alt: string
}

export interface SiteSettingsData {
  heroSlides: HeroSlideData[]
  heroSliderAutoplay: boolean
  heroSliderInterval: number
  heroEyebrow: string | null
  heroTitle: string | null
  heroSubtitle: string | null
  testimonials: SiteTestimonial[]
  ctaTitle: string | null
  ctaSubtitle: string | null
}

export interface HomepageData {
  featuredTours: Awaited<ReturnType<typeof getFeaturedTours>>['docs']
  blogPosts: Awaited<ReturnType<typeof getPublishedBlogPosts>>['docs']
  destinations: HomepageDestination[]
  site: SiteSettingsData
}

const PAGE_SIZE = 12

function cmsTtl(): number {
  return getServerEnv().CACHE_TTL_SECONDS
}

const emptyTourResult = {
  docs: [] as Tour[],
  totalDocs: 0,
  totalPages: 0,
  page: 1,
  hasNextPage: false,
  hasPrevPage: false,
  limit: PAGE_SIZE,
  pagingCounter: 0,
}

const emptyBlogResult = {
  docs: [] as BlogPost[],
  totalDocs: 0,
  totalPages: 0,
  page: 1,
  hasNextPage: false,
  hasPrevPage: false,
  limit: PAGE_SIZE,
  pagingCounter: 0,
}

const tourListSelect = {
  title: true,
  slug: true,
  shortDescription: true,
  location: true,
  duration: true,
  rating: true,
  reviewCount: true,
  coverImage: true,
  featured: true,
  status: true,
  country: true,
  categories: true,
} as const

const tourDetailSelect = {
  title: true,
  slug: true,
  shortDescription: true,
  description: true,
  location: true,
  duration: true,
  rating: true,
  reviewCount: true,
  coverImage: true,
  gallery: true,
  highlights: true,
  included: true,
  excluded: true,
  itinerary: true,
  reviews: true,
  bokunActivityId: true,
  seo: true,
  status: true,
} as const

const blogListSelect = {
  title: true,
  slug: true,
  excerpt: true,
  coverImage: true,
  publishedAt: true,
  status: true,
} as const

async function findCountryCodeByQuery(query: string): Promise<string | null> {
  const trimmed = query.trim()
  if (!trimmed) return null

  if (/^[a-zA-Z]{2}$/.test(trimmed)) {
    return trimmed.toUpperCase()
  }

  try {
    const payload = await getPayloadCached()
    const result = await payload.find({
      collection: 'countries',
      where: {
        or: [
          { name: { equals: trimmed } },
          { name: { contains: trimmed } },
          { code: { equals: trimmed.toUpperCase() } },
        ],
      },
      limit: 1,
      depth: 0,
    })

    const country = result.docs[0] as Country | undefined
    return country?.code ?? null
  } catch {
    return null
  }
}

export async function getCountryNameByCode(code: string): Promise<string | undefined> {
  try {
    const cached = withCache(
      buildCacheKey('cms', 'country-name', code),
      async () => {
        const payload = await getPayloadCached()
        const result = await payload.find({
          collection: 'countries',
          where: { code: { equals: code.toUpperCase() } },
          limit: 1,
          depth: 0,
          select: { name: true },
        })
        return result.docs[0]?.name
      },
      cmsTtl(),
      [CMS_CACHE_TAGS.countries],
    )
    return await cached()
  } catch {
    return undefined
  }
}

export async function getFeaturedTours(limit = 6) {
  try {
    const cached = withCache(
      buildCacheKey('cms', 'featured-tours', limit),
      async () => {
        const payload = await getPayloadCached()
        return payload.find({
          collection: 'tours',
          where: {
            and: [{ status: { equals: 'published' } }, { featured: { equals: true } }],
          },
          depth: 1,
          limit,
          sort: '-updatedAt',
          select: tourListSelect,
        })
      },
      cmsTtl(),
      [CMS_CACHE_TAGS.featuredTours, CMS_CACHE_TAGS.tours],
    )
    return await cached()
  } catch {
    return { ...emptyTourResult, limit }
  }
}

export async function getTours(params: {
  q?: string
  country?: string
  category?: string
  page?: number
}) {
  const page = params.page ?? 1

  try {
    const cached = withCache(
      buildCacheKey('cms', 'tours-list', params.q ?? '', params.country ?? '', params.category ?? '', page),
      async () => {
        const payload = await getPayloadCached()
        const conditions: Where[] = [{ status: { equals: 'published' } }]

        if (params.country) {
          conditions.push({ 'country.code': { equals: params.country.toUpperCase() } })
        } else if (params.q) {
          const countryCode = await findCountryCodeByQuery(params.q)
          const orConditions: Where[] = [
            { title: { contains: params.q } },
            { shortDescription: { contains: params.q } },
            { location: { contains: params.q } },
          ]
          if (countryCode) {
            orConditions.push({ 'country.code': { equals: countryCode } })
          }
          conditions.push({ or: orConditions })
        }

        if (params.category) {
          conditions.push({ 'categories.slug': { equals: params.category } })
        }

        return payload.find({
          collection: 'tours',
          where: { and: conditions },
          depth: 1,
          limit: PAGE_SIZE,
          page,
          sort: '-updatedAt',
          select: tourListSelect,
        })
      },
      cmsTtl(),
      [CMS_CACHE_TAGS.tours],
    )
    return await cached()
  } catch {
    return { ...emptyTourResult, page }
  }
}

const fetchSiteSettings = withCache(
  buildCacheKey('cms', 'site-settings'),
  async (): Promise<SiteSettingsData> => {
    const empty: SiteSettingsData = {
      heroSlides: [],
      heroSliderAutoplay: true,
      heroSliderInterval: 5,
      heroEyebrow: null,
      heroTitle: null,
      heroSubtitle: null,
      testimonials: [],
      ctaTitle: null,
      ctaSubtitle: null,
    }

    const payload = await getPayloadCached()
    const settings = (await payload.findGlobal({
      slug: 'site-settings',
      depth: 1,
    })) as {
      heroSlides?: Array<{ id?: string | null; image?: unknown; alt?: string | null }> | null
      heroSliderAutoplay?: boolean | null
      heroSliderInterval?: number | null
      heroEyebrow?: string | null
      heroTitle?: string | null
      heroSubtitle?: string | null
      ctaTitle?: string | null
      ctaSubtitle?: string | null
      testimonials?: Array<{
        name?: string | null
        location?: string | null
        text?: string | null
        rating?: number | null
      }> | null
    }

    const heroSlides = (settings.heroSlides ?? [])
      .map((slide, index) => {
        const imageUrl = getMediaUrl(slide.image)
        if (!imageUrl) return null
        return {
          id: slide.id ?? `slide-${index}`,
          imageUrl,
          alt: slide.alt?.trim() || 'Hero slide',
        }
      })
      .filter((slide): slide is HeroSlideData => slide !== null)

    const testimonials = (settings.testimonials ?? [])
      .filter(
        (item): item is { name: string; location: string; text: string; rating: number } =>
          Boolean(item?.name && item?.location && item?.text && typeof item.rating === 'number'),
      )
      .map((item) => ({
        name: item.name,
        location: item.location,
        text: item.text,
        rating: item.rating,
      }))

    return {
      heroSlides,
      heroSliderAutoplay: settings.heroSliderAutoplay ?? true,
      heroSliderInterval:
        typeof settings.heroSliderInterval === 'number' ? settings.heroSliderInterval : 5,
      heroEyebrow: settings.heroEyebrow ?? null,
      heroTitle: settings.heroTitle ?? null,
      heroSubtitle: settings.heroSubtitle ?? null,
      testimonials,
      ctaTitle: settings.ctaTitle ?? null,
      ctaSubtitle: settings.ctaSubtitle ?? null,
    }
  },
  cmsTtl(),
  [CMS_CACHE_TAGS.siteSettings, CMS_CACHE_TAGS.homepage],
)

export async function getSiteSettings(): Promise<SiteSettingsData> {
  try {
    return await fetchSiteSettings()
  } catch {
    return {
      heroSlides: [],
      heroSliderAutoplay: true,
      heroSliderInterval: 5,
      heroEyebrow: null,
      heroTitle: null,
      heroSubtitle: null,
      testimonials: [],
      ctaTitle: null,
      ctaSubtitle: null,
    }
  }
}

const fetchTourCategories = withCache(
  buildCacheKey('cms', 'tour-categories'),
  async (): Promise<TourCategoryOption[]> => {
    const payload = await getPayloadCached()
    const result = await payload.find({
      collection: 'tour-categories',
      limit: 100,
      sort: 'name',
      depth: 0,
      select: { name: true, slug: true },
    })

    return result.docs
      .filter((category) => category.name && category.slug)
      .map((category) => ({
        name: category.name,
        slug: category.slug,
      }))
  },
  cmsTtl(),
  [CMS_CACHE_TAGS.tourCategories],
)

export async function getTourCategories(): Promise<TourCategoryOption[]> {
  try {
    return await fetchTourCategories()
  } catch {
    return []
  }
}

const fetchHomepageDestinations = withCache(
  buildCacheKey('cms', 'homepage-destinations'),
  async (): Promise<HomepageDestination[]> => {
    const payload = await getPayloadCached()
    const result = await payload.find({
      collection: 'countries',
      limit: 100,
      sort: 'name',
      depth: 0,
      select: { name: true, code: true },
    })

    return result.docs
      .filter((country) => country.name && country.code)
      .map((country) => ({
        name: country.name,
        countryCode: country.code.toUpperCase(),
        searchQuery: country.name,
        flag: countryCodeToFlag(country.code),
      }))
  },
  cmsTtl(),
  [CMS_CACHE_TAGS.countries, CMS_CACHE_TAGS.homepage],
)

export async function getHomepageDestinations(): Promise<HomepageDestination[]> {
  try {
    return await fetchHomepageDestinations()
  } catch {
    return []
  }
}

const fetchHomepageData = withCache(
  buildCacheKey('cms', 'homepage-data'),
  async (): Promise<HomepageData> => {
    const [featuredResult, blogResult, destinations, site] = await Promise.all([
      getFeaturedTours(6),
      getPublishedBlogPosts(3),
      getHomepageDestinations(),
      getSiteSettings(),
    ])

    return {
      featuredTours: featuredResult.docs,
      blogPosts: blogResult.docs,
      destinations,
      site,
    }
  },
  cmsTtl(),
  [CMS_CACHE_TAGS.homepage],
)

export async function getHomepageData(): Promise<HomepageData> {
  try {
    return await fetchHomepageData()
  } catch {
    return {
      featuredTours: [],
      blogPosts: [],
      destinations: [],
      site: await getSiteSettings(),
    }
  }
}

export async function getPublishedBlogPosts(limit = 3) {
  try {
    const cached = withCache(
      buildCacheKey('cms', 'blog-posts', limit),
      async () => {
        const payload = await getPayloadCached()
        return payload.find({
          collection: 'blog-posts',
          where: { status: { equals: 'published' } },
          depth: 1,
          limit,
          sort: '-publishedAt',
          select: blogListSelect,
        })
      },
      cmsTtl(),
      [CMS_CACHE_TAGS.blog],
    )
    return await cached()
  } catch {
    return { ...emptyBlogResult, limit }
  }
}

export async function getPageBySlug(slug: string) {
  try {
    const cached = withCache(
      buildCacheKey('cms', 'page', slug),
      async () => {
        const payload = await getPayloadCached()
        const result = await payload.find({
          collection: 'pages',
          where: {
            and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }],
          },
          limit: 1,
          depth: 1,
        })
        return result.docs[0] ?? null
      },
      cmsTtl(),
      [CMS_CACHE_TAGS.pages],
    )
    return await cached()
  } catch {
    return null
  }
}

export async function getPublishedTourSlugs(): Promise<string[]> {
  try {
    const cached = withCache(
      buildCacheKey('cms', 'tour-slugs'),
      async () => {
        const payload = await getPayloadCached()
        const result = await payload.find({
          collection: 'tours',
          where: { status: { equals: 'published' } },
          limit: 1000,
          depth: 0,
          select: { slug: true },
        })
        return result.docs.map((t) => t.slug).filter(Boolean) as string[]
      },
      cmsTtl(),
      [CMS_CACHE_TAGS.tours, CMS_CACHE_TAGS.sitemap],
    )
    return await cached()
  } catch {
    return []
  }
}

export async function getPublishedBlogSlugs(): Promise<string[]> {
  try {
    const cached = withCache(
      buildCacheKey('cms', 'blog-slugs'),
      async () => {
        const payload = await getPayloadCached()
        const result = await payload.find({
          collection: 'blog-posts',
          where: { status: { equals: 'published' } },
          limit: 1000,
          depth: 0,
          select: { slug: true },
        })
        return result.docs.map((p) => p.slug).filter(Boolean) as string[]
      },
      cmsTtl(),
      [CMS_CACHE_TAGS.blog, CMS_CACHE_TAGS.sitemap],
    )
    return await cached()
  } catch {
    return []
  }
}

const fetchSitemapEntries = withCache(
  buildCacheKey('cms', 'sitemap-entries'),
  async () => {
    const payload = await getPayloadCached()
    const [tours, blogPosts, pages] = await Promise.all([
      payload.find({
        collection: 'tours',
        where: { status: { equals: 'published' } },
        limit: 1000,
        depth: 0,
        select: { slug: true, updatedAt: true },
      }),
      payload.find({
        collection: 'blog-posts',
        where: { status: { equals: 'published' } },
        limit: 1000,
        depth: 0,
        select: { slug: true, updatedAt: true },
      }),
      payload.find({
        collection: 'pages',
        where: { _status: { equals: 'published' } },
        limit: 1000,
        depth: 0,
        select: { slug: true, updatedAt: true },
      }),
    ])
    return { tours: tours.docs, blogPosts: blogPosts.docs, pages: pages.docs }
  },
  cmsTtl(),
  [CMS_CACHE_TAGS.sitemap],
)

export async function getSitemapEntries() {
  try {
    return await fetchSitemapEntries()
  } catch {
    return { tours: [], blogPosts: [], pages: [] }
  }
}

export async function getTourBySlugCached(slug: string) {
  try {
    const cached = withCache(
      buildCacheKey('cms', 'tour-detail', slug),
      async () => {
        const payload = await getPayloadCached()
        const result = await payload.find({
          collection: 'tours',
          where: {
            and: [{ slug: { equals: slug } }, { status: { equals: 'published' } }],
          },
          depth: 1,
          limit: 1,
          select: tourDetailSelect,
        })
        return result.docs[0] ?? null
      },
      cmsTtl(),
      [CMS_CACHE_TAGS.tours],
    )
    return await cached()
  } catch {
    return null
  }
}

export async function getBlogPostBySlug(slug: string) {
  try {
    const cached = withCache(
      buildCacheKey('cms', 'blog-post', slug),
      async () => {
        const payload = await getPayloadCached()
        const result = await payload.find({
          collection: 'blog-posts',
          where: {
            and: [{ slug: { equals: slug } }, { status: { equals: 'published' } }],
          },
          depth: 1,
          limit: 1,
        })
        return result.docs[0] ?? null
      },
      cmsTtl(),
      [CMS_CACHE_TAGS.blog],
    )
    return await cached()
  } catch {
    return null
  }
}

export function getMediaUrl(media: unknown): string | null {
  if (!media || typeof media !== 'object') return null
  const m = media as { url?: string | null }
  return m.url ?? null
}
