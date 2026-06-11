export function sanitizeOptionalDate(value: unknown): string | null | undefined {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const date = new Date(String(value))

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return date.toISOString()
}

export function isDocumentPublished(
  data?: Partial<unknown>,
  siblingData?: Partial<unknown>,
  statusKey = 'status',
): boolean {
  const payloadData = data as { _status?: 'draft' | 'published' } | undefined
  const sibling = siblingData as Record<string, unknown> | undefined

  return (
    payloadData?._status === 'published' ||
    sibling?.[statusKey] === 'published'
  )
}
