import type { CollectionConfig } from 'payload'
import { normalizeSlug } from '@/lib/payload/slug'

function getR2PublicBaseUrl(): string | null {
  const url = process.env.R2_PUBLIC_URL?.replace(/\/$/, '')
  return url || null
}

function buildR2PublicUrl(filename: string, prefix = 'media'): string | null {
  const base = getR2PublicBaseUrl()
  if (!base) return null

  const key = prefix ? `${prefix}/${filename}` : filename
  const encodedKey = key
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')

  return `${base}/${encodedKey}`
}

function sanitizeUploadFilename(filename: string): string {
  const extension = filename.includes('.') ? filename.slice(filename.lastIndexOf('.')) : ''
  const baseName = extension ? filename.slice(0, -extension.length) : filename
  const safeBase = normalizeSlug(baseName) || 'upload'
  return `${safeBase}${extension.toLowerCase()}`
}

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  hooks: {
    afterRead: [
      ({ doc }) => {
        if (!doc) return doc

        const filename = typeof doc.filename === 'string' ? doc.filename : null
        const prefix = typeof doc.prefix === 'string' ? doc.prefix : 'media'

        if (filename) {
          const publicUrl = buildR2PublicUrl(filename, prefix)
          if (publicUrl) {
            doc.url = publicUrl
          }
        }

        if (doc.sizes && typeof doc.sizes === 'object') {
          for (const size of Object.values(doc.sizes)) {
            if (
              size &&
              typeof size === 'object' &&
              'filename' in size &&
              typeof size.filename === 'string'
            ) {
              const sizeUrl = buildR2PublicUrl(size.filename, prefix)
              if (sizeUrl) {
                ;(size as { url?: string }).url = sizeUrl
              }
            }
          }
        }

        if (doc.filename) {
          const thumbnail = doc.sizes?.thumbnail
          const thumbnailFilename =
            thumbnail && typeof thumbnail === 'object' && 'filename' in thumbnail
              ? thumbnail.filename
              : typeof doc.filename === 'string'
                ? doc.filename
                : null

          if (thumbnailFilename) {
            doc.thumbnailURL = buildR2PublicUrl(String(thumbnailFilename), prefix) ?? doc.thumbnailURL
          }
        }

        return doc
      },
    ],
    beforeChange: [
      ({ data }) => {
        if (!data) return data

        if (typeof data.filename === 'string') {
          data.filename = sanitizeUploadFilename(data.filename)
        }

        if (data.sizes && typeof data.sizes === 'object') {
          for (const size of Object.values(data.sizes)) {
            if (
              size &&
              typeof size === 'object' &&
              'filename' in size &&
              typeof size.filename === 'string'
            ) {
              size.filename = sanitizeUploadFilename(size.filename)
            }
          }
        }

        return data
      },
    ],
  },
  upload: {
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: 512,
        position: 'centre',
      },
      {
        name: 'hero',
        width: 1920,
        height: 1080,
        position: 'centre',
      },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'caption',
      type: 'text',
    },
  ],
}
