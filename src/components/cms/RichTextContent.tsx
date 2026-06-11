import { RichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

interface RichTextContentProps {
  content: SerializedEditorState
  className?: string
}

export function RichTextContent({ content, className }: RichTextContentProps) {
  return (
    <div className={className}>
      <RichText data={content} />
    </div>
  )
}
