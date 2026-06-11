import { s3Storage } from '@payloadcms/storage-s3'

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
    collections: {
      media: {
        disableLocalStorage: true,
        disablePayloadAccessControl: true,
        prefix: 'media',
        generateFileURL: ({ filename, prefix }) => {
          const key = prefix ? `${prefix}/${filename}` : filename
          return `${publicUrl}/${key}`
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
