import { getPayload } from 'payload'
import config from '@payload-config'
import type { Where } from 'payload'
import type { BlogPost, Tour } from '@/payload-types'

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
  category?: string
  page?: number
}) {
  const page = params.page ?? 1

  try {
    const payload = await getPayloadSafe()

  const conditions: Where[] = [{ status: { equals: 'published' } }]

  if (params.q) {
    conditions.push({
      or: [
        { title: { contains: params.q } },
        { shortDescription: { contains: params.q } },
        { location: { contains: params.q } },
      ],
    })
  }

  if (params.category) {
    conditions.push({ categories: { contains: params.category } })
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
