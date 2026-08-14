'use client'

import { Category } from '@/types'

interface FilterPanelProps {
  categories: Category[]
  sources: { id: number; name: string }[]
  selectedCategory: string
  selectedSource: number | null
  onCategoryChange: (category: string) => void
  onSourceChange: (sourceId: number | null) => void
}

export default function FilterPanel({
  categories,
  sources,
  selectedCategory,
  selectedSource,
  onCategoryChange,
  onSourceChange,
}: FilterPanelProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="eyebrow mb-3">Category</h3>
        <div className="space-y-0">
          <button
            onClick={() => onCategoryChange('')}
            className={`block w-full text-left py-1.5 text-sm border-b border-rule-gray transition-colors ${
              selectedCategory === ''
                ? 'text-folio-black font-bold'
                : 'text-caption-gray hover:text-folio-black'
            }`}
            style={{ fontFamily: 'var(--font-plantin)' }}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.slug)}
              className={`block w-full text-left py-1.5 text-sm border-b border-rule-gray transition-colors ${
                selectedCategory === cat.slug
                  ? 'text-folio-black font-bold'
                  : 'text-caption-gray hover:text-folio-black'
              }`}
              style={{ fontFamily: 'var(--font-plantin)' }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="eyebrow mb-3">Source</h3>
        <div className="space-y-0">
          <button
            onClick={() => onSourceChange(null)}
            className={`block w-full text-left py-1.5 text-sm border-b border-rule-gray transition-colors ${
              selectedSource === null
                ? 'text-folio-black font-bold'
                : 'text-caption-gray hover:text-folio-black'
            }`}
            style={{ fontFamily: 'var(--font-plantin)' }}
          >
            All Sources
          </button>
          {sources.map((source) => (
            <button
              key={source.id}
              onClick={() => onSourceChange(source.id)}
              className={`block w-full text-left py-1.5 text-sm border-b border-rule-gray transition-colors ${
                selectedSource === source.id
                  ? 'text-folio-black font-bold'
                  : 'text-caption-gray hover:text-folio-black'
              }`}
              style={{ fontFamily: 'var(--font-plantin)' }}
            >
              {source.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
