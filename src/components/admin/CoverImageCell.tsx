'use client'

import type { DefaultCellComponentProps } from 'payload'
import { Thumbnail, useConfig, useListRelationships } from '@payloadcms/ui'
import { getBestFitFromSizes, isImage } from 'payload/shared'
import React, { useEffect, useMemo } from 'react'

const RELATION_TO = 'media'

type MediaDoc = {
  id?: number | string
  filename?: string
  mimeType?: string
  url?: string | null
  thumbnailURL?: string | null
  sizes?: Record<string, { url?: string | null; filename?: string }>
  updatedAt?: string
  width?: number
}

function resolveMediaRef(
  cellData: unknown,
  rowData: Record<string, unknown> | undefined,
): MediaDoc | number | string | null {
  const candidate = cellData ?? rowData?.coverImage

  if (candidate == null) return null

  if (typeof candidate === 'object') {
    return candidate as MediaDoc
  }

  if (typeof candidate === 'number' || typeof candidate === 'string') {
    return candidate
  }

  return null
}

function getMediaId(mediaRef: MediaDoc | number | string): number | string | null {
  if (typeof mediaRef === 'number' || typeof mediaRef === 'string') {
    return mediaRef
  }

  return mediaRef.id ?? null
}

function hasRenderableSrc(media: MediaDoc): boolean {
  return Boolean(
    media.thumbnailURL ||
      media.url ||
      media.sizes?.thumbnail?.url ||
      media.sizes?.card?.url,
  )
}

function getFileSrc(media: MediaDoc): string | undefined {
  const isFileImage = isImage(media.mimeType ?? '')

  if (isFileImage) {
    const url = media.url ?? media.thumbnailURL ?? ''
    if (!url) return undefined

    return (
      getBestFitFromSizes({
        sizes: media.sizes as Record<string, { url?: string; width?: number }> | undefined,
        thumbnailURL: media.thumbnailURL ?? undefined,
        url,
        width: media.width,
      }) ?? undefined
    )
  }

  return media.thumbnailURL ?? media.url ?? undefined
}

export const CoverImageCell: React.FC<DefaultCellComponentProps> = ({ cellData, rowData }) => {
  const { getEntityConfig } = useConfig()
  const { documents, getRelationships } = useListRelationships()

  const mediaRef = useMemo(
    () => resolveMediaRef(cellData, rowData as Record<string, unknown> | undefined),
    [cellData, rowData],
  )

  const mediaId = mediaRef != null ? getMediaId(mediaRef) : null

  useEffect(() => {
    if (mediaId == null) return

    if (mediaRef != null && typeof mediaRef === 'object' && hasRenderableSrc(mediaRef)) {
      return
    }

    getRelationships([{ relationTo: RELATION_TO, value: mediaId }])
  }, [mediaId, mediaRef, getRelationships])

  if (mediaRef == null) {
    return <span style={{ color: '#94a3b8' }}>—</span>
  }

  let media: MediaDoc | null = null

  if (typeof mediaRef === 'object' && hasRenderableSrc(mediaRef)) {
    media = mediaRef
  } else if (mediaId != null) {
    const fetched = documents[RELATION_TO]?.[mediaId]

    if (fetched === null) {
      return <span style={{ color: '#94a3b8' }}>…</span>
    }

    if (fetched === false) {
      return <span style={{ color: '#94a3b8' }}>—</span>
    }

    if (fetched && typeof fetched === 'object') {
      media = fetched as MediaDoc
    }
  }

  if (!media) {
    return <span style={{ color: '#94a3b8' }}>—</span>
  }

  const fileSrc = getFileSrc(media)

  if (!fileSrc) {
    return <span style={{ color: '#94a3b8' }}>—</span>
  }

  const collectionConfig = getEntityConfig({ collectionSlug: RELATION_TO })
  const uploadConfig = collectionConfig?.upload

  return (
    <Thumbnail
      className="cover-image-cell__thumb"
      collectionSlug={RELATION_TO}
      doc={media as Record<string, unknown>}
      fileSrc={fileSrc}
      imageCacheTag={
        uploadConfig?.cacheTags && media.updatedAt ? String(media.updatedAt) : undefined
      }
      size="small"
      uploadConfig={uploadConfig}
    />
  )
}
