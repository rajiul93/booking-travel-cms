import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getSiteUrl } from '@/lib/env'

export const revalidate = 60
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl()

  let tours: { docs: Array<{ slug: string; updatedAt?: string | null }> } = { docs: [] }
  let blogPosts: { docs: Array<{ slug: string; updatedAt?: string | null }> } = { docs: [] }

  try {
    const payload = await getPayload({ config })
    ;[tours, blogPosts] = await Promise.all([
      payload.find({
        collection: 'tours',
        where: { status: { equals: 'published' } },
        limit: 1000,
        select: { slug: true, updatedAt: true },
      }),
      payload.find({
        collection: 'blog-posts',
        where: { status: { equals: 'published' } },
        limit: 1000,
        select: { slug: true, updatedAt: true },
      }),
    ])
  } catch {
    // Database unavailable at build time — return static pages only
  }

  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${siteUrl}/tours`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${siteUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${siteUrl}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${siteUrl}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ]

  const tourPages: MetadataRoute.Sitemap = tours.docs.map((tour) => ({
    url: `${siteUrl}/tours/${tour.slug}`,
    lastModified: tour.updatedAt ? new Date(tour.updatedAt) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const blogPages: MetadataRoute.Sitemap = blogPosts.docs.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...tourPages, ...blogPages]
}
