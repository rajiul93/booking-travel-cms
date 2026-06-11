'use client'

import type { DefaultCellComponentProps } from 'payload'
import Link from 'next/link'
import { Pencil } from 'lucide-react'
import React from 'react'

export const CollectionEditLinkCell: React.FC<DefaultCellComponentProps> = ({
  collectionSlug,
  rowData,
}) => {
  const id = rowData?.id

  if (id == null) {
    return null
  }

  return (
    <Link
      href={`/admin/collections/${collectionSlug}/${id}`}
      aria-label="Edit"
      title="Edit"
      onClick={(event) => event.stopPropagation()}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
    >
      <Pencil className="h-4 w-4" />
    </Link>
  )
}
