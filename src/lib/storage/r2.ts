import { s3Storage } from '@payloadcms/storage-s3'
import { normalizeSlug } from '@/lib/payload/slug'

function encodeObjectKey(key: string): string {
  return key
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')
}

function getR2Endpoint(): string {
  const accountId = process.env.R2_ACCOUNT_ID
  if (accountId) {
    return `https://${accountId}.r2.cloudflarestorage.com`
  }
  return process.env.R2_ENDPOINT ?? ''
}

export function isR2Enabled(): boolean {
  return Boolean(
    process.env.R2_BUCKET_NAME &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      (process.env.R2_ACCOUNT_ID || process.env.R2_ENDPOINT) &&
      process.env.R2_PUBLIC_URL,
  )
}

export function r2StoragePlugin() {
  const publicUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, '') ?? ''

  return s3Storage({
    enabled: isR2Enabled(),
    alwaysInsertFields: true,
    acl: 'public-read',
    collections: {
      media: {
        disableLocalStorage: true,
        prefix: 'media',
        // Keep Payload file proxy for admin thumbnails (/api/media/file/...).
        // staticHandler streams from R2 when disablePayloadAccessControl is false.
        generateFileURL: ({ filename, prefix }) => {
          const key = prefix ? `${prefix}/${filename}` : filename
          return `${publicUrl}/${encodeObjectKey(key)}`
        },
      },
    },
    bucket: process.env.R2_BUCKET_NAME!,
    config: {
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
      region: 'auto',
      endpoint: getR2Endpoint(),
      forcePathStyle: true,
    },
  })
}
