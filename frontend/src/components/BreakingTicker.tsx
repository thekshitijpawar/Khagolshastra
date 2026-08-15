'use client'

import { useState, useMemo } from 'react'
import { Article } from '@/types'
import { getArticlePrimaryCategory } from '@/lib/api'

interface BreakingTickerProps {
  articles: Article[]
  onOpenArticle: (article: Article) => void
}

const FILTER_TAGS = [
  { id: 'all', label: 'ALL WIRE' },
  { id: 'solar-system', label: 'SOLAR SYSTEM' },
  { id: 'exoplanets', label: 'EXOPLANETS' },
  { id: 'stars', label: 'STARS' },
  { id: 'galaxies', label: 'GALAXIES' },
  { id: 'cosmology', label: 'COSMOLOGY' },
  { id: 'launches', label: 'LAUNCHES' },
  { id: 'human-spaceflight', label: 'SPACEFLIGHT' },
  { id: 'history', label: 'HISTORY' },
]

export default function BreakingTicker({ articles = [], onOpenArticle }: BreakingTickerProps) {
  const [selectedTag, setSelectedTag] = useState('all')
  const [searchFilter, setSearchFilter] = useState('')
  const [visibleCount, setVisibleCount] = useState(12)

  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      const primary = getArticlePrimaryCategory(art)

      // Strict exact category matching - no cross contamination
      let matchesCategory = false
      if (selectedTag === 'all') {
        matchesCategory = true
      } else if (selectedTag === 'history') {
        matchesCategory = primary === 'today-in-the-history-of-astronomy'
      } else if (selectedTag === 'human-spaceflight') {
        matchesCategory = primary === 'human-spaceflight' || primary === 'robotic-spaceflight'
      } else {
        matchesCategory = primary === selectedTag
      }

      // Search keyword check
      const matchesSearch =
        !searchFilter ||
        art.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
        (art.summary && art.summary.toLowerCase().includes(searchFilter.toLowerCase()))

      return matchesCategory && matchesSearch
    })
  }, [articles, selectedTag, searchFilter])

  const displayedArticles = filteredArticles.slice(0, visibleCount)

  return (
    <section id="all-headlines-section" className="border-y-2 border-[#111111] bg-[#f7f6ec] py-8 px-4 sm:px-6 lg:px-10">
      <div className="max-w-[1340px] mx-auto">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#dcd8cb] mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 bg-[#ffc500] border border-[#111]" />
              <h2 className="eyebrow text-[#111111] text-[13px]">
                ALL HEADLINES & CONTINUOUS WIRE
              </h2>
            </div>
            <p className="text-[12px] font-serif-editorial text-[#666666]">
              Complete live index of incoming dispatches from Astronomy.com, Universe Today, and Space.com
            </p>
          </div>

          {/* Search Box */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Filter headlines..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-52 sm:w-64 px-3 py-1.5 text-[11px] font-serif-editorial bg-white border border-[#111111] text-[#111111] placeholder:text-[#888] focus:outline-none focus:ring-1 focus:ring-[#111]"
              />
              {searchFilter && (
                <button
                  onClick={() => setSearchFilter('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#888] hover:text-[#111]"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-4 mb-6 text-[10px] font-sans-editorial font-bold uppercase tracking-wider scrollbar-none">
          {FILTER_TAGS.map((tag) => (
            <button
              key={tag.id}
              onClick={() => {
                setSelectedTag(tag.id)
                setVisibleCount(12)
              }}
              className={`px-3 py-1.5 border transition-all whitespace-nowrap ${
                selectedTag === tag.id
                  ? 'bg-[#111111] text-[#ffc500] border-[#111111] shadow-2xs'
                  : 'bg-white text-[#333333] border-[#dcd8cb] hover:border-[#111111]'
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>

        {/* Headlines 3-Column Newspaper Grid */}
        {displayedArticles.length === 0 ? (
          <div className="text-center py-12 bg-white border border-[#dcd8cb]">
            <p className="font-serif-editorial text-[#666]">No headlines match this section filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedArticles.map((art, idx) => {
              const primaryCat = getArticlePrimaryCategory(art)
              const date = art.publishedAt ? new Date(art.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''
              const source = art.sourceName || (art.url.includes('astronomy.com') ? 'Astronomy.com' : art.url.includes('universetoday.com') ? 'Universe Today' : 'Space.com')
              const img = art.imageUrl || 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=600&q=80'

              const displayLabel = primaryCat === 'today-in-the-history-of-astronomy' ? 'HISTORY' : primaryCat.replace('-', ' ').toUpperCase()

              return (
                <div
                  key={art.id || idx}
                  onClick={() => onOpenArticle(art)}
                  className="group cursor-pointer bg-white border border-[#dcd8cb] p-4 hover:border-[#111111] hover:-translate-y-1.5 hover:shadow-[0_14px_30px_rgba(0,0,0,0.10)] transition-all duration-300 ease-out transform flex flex-col shadow-2xs"
                >
                  <div className="flex gap-3 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-[9px] font-sans-editorial font-bold uppercase tracking-wider text-[#888884] mb-1.5">
                        <span className="text-[#111111] bg-[#ffc500]/40 px-1.5 py-0.5 font-bold">{displayLabel}</span>
                        <span>•</span>
                        <span>{source}</span>
                      </div>

                      <h3 className="text-[15px] font-serif-editorial text-[#111111] font-normal leading-[1.25] line-clamp-3">
                        {art.title}
                      </h3>
                    </div>

                    <div className="w-20 h-16 bg-[#eae8dc] border border-[#dcd8cb] shrink-0 overflow-hidden">
                      <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#f0eee4] flex items-center justify-between text-[10px] font-sans-editorial text-[#888884] uppercase tracking-wider mt-auto">
                    <span suppressHydrationWarning>{date}</span>
                    <span className="font-bold text-[#111111] group-hover:text-[#ffc500] transition-colors">READ BRIEF →</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Load More Button */}
        {filteredArticles.length > visibleCount && (
          <div className="mt-8 text-center">
            <button
              onClick={() => setVisibleCount((prev) => prev + 12)}
              className="px-8 py-3 bg-[#111111] text-white hover:bg-[#333333] text-[11px] font-sans-editorial font-bold uppercase tracking-[0.14em] transition-colors shadow-xs"
            >
              LOAD MORE HEADLINES ↓
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
