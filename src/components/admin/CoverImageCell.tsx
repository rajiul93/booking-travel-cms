'use client'

import type { DefaultCellComponentProps } from 'payload'
import { Thumbnail } from '@payloadcms/ui'
import React from 'react'

type MediaDoc = {
  filename?: string
  mimeType?: string
  url?: string | null
  thumbnailURL?: string | null
  sizes?: {
    thumbnail?: { url?: string | null }
    card?: { url?: string | null }
  }
  updatedAt?: string
}

function resolveMedia(cellData: unknown, rowData: Record<string, unknown> | undefined): MediaDoc | null {
  if (cellData && typeof cellData === 'object') {
    return cellData as MediaDoc
  }

  const coverImage = rowData?.coverImage
  if (coverImage && typeof coverImage === 'object') {
    return coverImage as MediaDoc
  }

  return null
}

function getImageSrc(media: MediaDoc): string | undefined {
  return (
    media.sizes?.thumbnail?.url ||
    media.thumbnailURL ||
    media.url ||
    undefined
  ) ?? undefined
}

export const CoverImageCell: React.FC<DefaultCellComponentProps> = ({ cellData, rowData }) => {
  const media = resolveMedia(cellData, rowData as Record<string, unknown> | undefined)

  if (!media) {
    return <span style={{ color: '#94a3b8' }}>—</span>
  }

  const fileSrc = getImageSrc(media)

  if (!fileSrc) {
    return <span style={{ color: '#94a3b8' }}>—</span>
  }

  return (
    <Thumbnail
      className="cover-image-cell__thumb"
      collectionSlug="media"
      doc={media as Record<string, unknown>}
      fileSrc={fileSrc}
      size="small"
    />
  )
}
