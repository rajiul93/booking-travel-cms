import type { MetadataRoute } from 'next'
import { getSitemapEntries } from '@/lib/cms/queries'
import { getSiteUrl } from '@/lib/env'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl()
  const { tours, blogPosts, pages } = await getSitemapEntries()

  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${siteUrl}/tours`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${siteUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${siteUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${siteUrl}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${siteUrl}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ]

  const tourPages: MetadataRoute.Sitemap = tours.map((tour) => ({
    url: `${siteUrl}/tours/${tour.slug}`,
    lastModified: tour.updatedAt ? new Date(tour.updatedAt) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  const cmsPages: MetadataRoute.Sitemap = pages.map((page) => ({
    url: `${siteUrl}/${page.slug}`,
    lastModified: page.updatedAt ? new Date(page.updatedAt) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }))

  return [...staticPages, ...tourPages, ...blogPages, ...cmsPages]
}
