export function hasRichTextContent(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false

  const root = (value as { root?: { children?: unknown[] } }).root
  if (!root?.children?.length) return false

  const hasText = (nodes: unknown[]): boolean => {
    for (const node of nodes) {
      if (!node || typeof node !== 'object') continue

      const n = node as Record<string, unknown>

      if (typeof n.text === 'string' && n.text.trim().length > 0) {
        return true
      }

      if (Array.isArray(n.children) && hasText(n.children)) {
        return true
      }
    }

    return false
  }

  return hasText(root.children)
}
