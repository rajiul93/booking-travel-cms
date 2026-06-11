import { getPayload } from 'payload'
import config from '@payload-config'
import type { Where } from 'payload'
import { countryCodeToFlag } from '@/lib/country'
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

const PAGE_SIZE = 12

async function getPayloadSafe() {
  return getPayload({ config })
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

async function findCountryCodeByQuery(query: string): Promise<string | null> {
  const trimmed = query.trim()
  if (!trimmed) return null

  if (/^[a-zA-Z]{2}$/.test(trimmed)) {
    return trimmed.toUpperCase()
  }

  try {
    const payload = await getPayloadSafe()
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
    })

    const country = result.docs[0] as Country | undefined
    return country?.code ?? null
  } catch {
    return null
  }
}

export async function getCountryNameByCode(code: string): Promise<string | undefined> {
  try {
    const payload = await getPayloadSafe()
    const result = await payload.find({
      collection: 'countries',
      where: { code: { equals: code.toUpperCase() } },
      limit: 1,
    })

    return result.docs[0]?.name
  } catch {
    return undefined
  }
}

export async function getFeaturedTours(limit = 6) {
  try {
    const payload = await getPayloadSafe()
    return payload.find({
    collection: 'tours',
    where: {
      and: [
        { status: { equals: 'published' } },
        { featured: { equals: true } },
      ],
    },
    depth: 2,
    limit,
    sort: '-updatedAt',
    })
  } catch {
    return { ...emptyTourResult, limit: limit }
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
    const payload = await getPayloadSafe()

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
    depth: 2,
    limit: PAGE_SIZE,
    page,
    sort: '-updatedAt',
    })
  } catch {
    return { ...emptyTourResult, page }
  }
}

export async function getSiteSettings(): Promise<SiteSettingsData> {
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

  try {
    const payload = await getPayloadSafe()
    const settings = (await payload.findGlobal({
      slug: 'site-settings',
      depth: 2,
    })) as {
      heroSlides?: Array<{
        id?: string | null
        image?: unknown
        alt?: string | null
      }> | null
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
  } catch {
    return empty
  }
}

export async function getTourCategories(): Promise<TourCategoryOption[]> {
  try {
    const payload = await getPayloadSafe()
    const result = await payload.find({
      collection: 'tour-categories',
      limit: 100,
      sort: 'name',
      depth: 0,
    })

    return result.docs
      .filter((category) => category.name && category.slug)
      .map((category) => ({
        name: category.name,
        slug: category.slug,
      }))
  } catch {
    return []
  }
}

export async function getHomepageDestinations(): Promise<HomepageDestination[]> {
  try {
    const payload = await getPayloadSafe()
    const result = await payload.find({
      collection: 'countries',
      limit: 100,
      sort: 'name',
      depth: 0,
    })

    return result.docs
      .filter((country) => country.name && country.code)
      .map((country) => ({
        name: country.name,
        countryCode: country.code.toUpperCase(),
        searchQuery: country.name,
        flag: countryCodeToFlag(country.code),
      }))
  } catch {
    return []
  }
}

export async function getTourLocations(): Promise<string[]> {
  try {
    const payload = await getPayloadSafe()
    const result = await payload.find({
      collection: 'tours',
      where: { status: { equals: 'published' } },
      limit: 200,
      depth: 0,
      select: {
        location: true,
      },
    })

    const locations = new Set<string>()
    for (const tour of result.docs) {
      if (tour.location?.trim()) {
        locations.add(tour.location.trim())
      }
    }

    return Array.from(locations).sort((a, b) => a.localeCompare(b))
  } catch {
    return []
  }
}

export async function getPublishedBlogPosts(limit = 3) {
  try {
    const payload = await getPayloadSafe()
    return payload.find({
    collection: 'blog-posts',
    where: { status: { equals: 'published' } },
    depth: 1,
    limit,
    sort: '-publishedAt',
    })
  } catch {
    return { ...emptyBlogResult, limit }
  }
}

export async function getPageBySlug(slug: string) {
  try {
    const payload = await getPayloadSafe()
    const result = await payload.find({
      collection: 'pages',
      where: {
        and: [
          { slug: { equals: slug } },
          { _status: { equals: 'published' } },
        ],
      },
      limit: 1,
      depth: 1,
    })
    return result.docs[0] ?? null
  } catch {
    return null
  }
}

export function getMediaUrl(
  media: unknown,
): string | null {
  if (!media || typeof media !== 'object') return null
  const m = media as { url?: string | null }
  return m.url ?? null
}
