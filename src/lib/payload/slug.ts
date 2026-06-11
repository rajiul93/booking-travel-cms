const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function normalizeSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function slugifyFromTitle(title: string): string {
  return normalizeSlug(title)
}

export function isValidSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug)
}

export function validateSlugValue(value: unknown): string | true {
  if (typeof value !== 'string' || !value.trim()) {
    return 'Slug is required.'
  }

  const normalized = normalizeSlug(value)

  if (!normalized) {
    return 'Slug is required.'
  }

  if (!isValidSlug(normalized)) {
    return 'Slug must use lowercase letters, numbers, and hyphens only. No spaces.'
  }

  return true
}

export function applySlugToData(
  data: Record<string, unknown> | undefined,
  titleField = 'title',
): Record<string, unknown> | undefined {
  if (!data) return data

  const title = data[titleField]
  const slug = data.slug

  if (typeof slug === 'string' && slug.trim()) {
    data.slug = normalizeSlug(slug)
  } else if (typeof title === 'string' && title.trim()) {
    data.slug = slugifyFromTitle(title)
  }

  return data
}

export const slugFieldAdmin = {
  description: 'Lowercase only. Spaces are converted to hyphens automatically.',
}
