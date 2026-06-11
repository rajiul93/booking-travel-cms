import type { Metadata } from 'next'
import { getSiteUrl } from '@/lib/env'

const SITE_NAME = 'Dream Tourism'
const DEFAULT_DESCRIPTION =
  'Discover unforgettable tours and experiences across Italy with Dream Tourism. Book adventures, cultural tours, and day trips with live availability and instant confirmation.'

interface SeoOptions {
  title: string
  description?: string
  path?: string
  ogImage?: string | null
  noIndex?: boolean
}

export function buildMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '',
  ogImage,
  noIndex = false,
}: SeoOptions): Metadata {
  const siteUrl = getSiteUrl()
  const canonical = `${siteUrl}${path}`
  const image = ogImage ?? `${siteUrl}/og-default.jpg`

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical,
    },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: 'en_IE',
      type: 'website',
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [image],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  }
}

export function buildTourJsonLd(tour: {
  title: string
  description: string
  slug: string
  rating?: number | null
  reviewCount?: number | null
  coverImageUrl?: string | null
  price?: number | null
}) {
  const siteUrl = getSiteUrl()

  return {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: tour.title,
    description: tour.description,
    url: `${siteUrl}/tours/${tour.slug}`,
    image: tour.coverImageUrl,
    provider: {
      '@type': 'TravelAgency',
      name: SITE_NAME,
      url: siteUrl,
    },
    ...(tour.rating && tour.reviewCount
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: tour.rating,
            reviewCount: tour.reviewCount,
          },
        }
      : {}),
    ...(tour.price
      ? {
          offers: {
            '@type': 'Offer',
            price: tour.price,
            priceCurrency: 'EUR',
            availability: 'https://schema.org/InStock',
          },
        }
      : {}),
  }
}

export function buildOrganizationJsonLd() {
  const siteUrl = getSiteUrl()

  return {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: SITE_NAME,
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    sameAs: [],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'info@dreamtourism.it',
      availableLanguage: ['English', 'Italian'],
    },
  }
}
