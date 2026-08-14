'use client'

import { Source } from '@/types'

interface SourceBadgeProps {
  source: Source
}

export default function SourceBadge({ source }: SourceBadgeProps) {
  return (
    <span className="text-text-faint text-sm">
      {source.name}
    </span>
  )
}
