'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ArticleCard from '@/components/ArticleCard'
import ArticleModal from '@/components/ArticleModal'
import { fetchArticles, fetchSources } from '@/lib/api'
import { Article, Source } from '@/types'

const CATEGORY_TABS = [
  { id: '', label: 'ALL WIRE' },
  { id: 'solar-system', label: 'SOLAR SYSTEM' },
  { id: 'exoplanets', label: 'EXOPLANETS' },
  { id: 'stars', label: 'STARS' },
  { id: 'galaxies', label: 'GALAXIES' },
  { id: 'cosmology', label: 'COSMOLOGY' },
  { id: 'launches', label: 'LAUNCHES' },
  { id: 'human-spaceflight', label: 'SPACEFLIGHT' },
  { id: 'today-in-the-history-of-astronomy', label: 'HISTORY' },
]

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedSource, setSelectedSource] = useState<number | null>(null)
  const [sources, setSources] = useState<Source[]>([])
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)

  useEffect(() => {
    loadSources()
  }, [])

  useEffect(() => {
    loadArticles()
  }, [page, query, selectedCategory, selectedSource])

  const loadSources = async () => {
    try {
      const data = await fetchSources()
      setSources(data)
    } catch {
      // Ignored
    }
  }

  const loadArticles = async () => {
    setLoading(true)
    try {
      const data = await fetchArticles({
        query: query || undefined,
        category: selectedCategory || undefined,
        sourceId: selectedSource || undefined,
        page,
        limit: 18,
      })
      setArticles(data.items || [])
      setTotal(data.total || 0)
    } catch (error) {
      console.error('Failed to load articles', error)
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / 18))

  return (
    <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-10 py-10">
      {/* Header Banner */}
      <div className="border-b-2 border-[#111111] pb-6 mb-8">
        <Link
          href="/"
          className="text-[11px] font-sans-editorial font-bold uppercase tracking-widest text-[#777777] hover:text-[#111111] transition-colors mb-3 inline-block"
        >
          ← Return to Front Page
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="eyebrow text-[#ffc500] bg-[#111111] px-2 py-0.5 inline-block mb-2">
              CONTINUOUS WIRE & ARCHIVE
            </span>
            <h1 className="text-[36px] sm:text-[46px] font-serif-editorial font-normal leading-tight text-[#111111]">
              All Headlines & Dispatches
            </h1>
            <p className="text-[14px] font-serif-editorial text-[#666] max-w-2xl mt-1">
              Real-time aggregation from Astronomy.com, Universe Today, Space.com, and international observatories.
            </p>
          </div>

          {/* Search Box */}
          <div className="w-full md:w-80">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setPage(1)
                }}
                placeholder="Search all dispatches..."
                className="w-full px-4 py-2.5 bg-white border border-[#111111] text-sm font-serif-editorial text-[#111] placeholder:text-[#888] focus:outline-none"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#888] hover:text-[#111]"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-6 scrollbar-none text-[11px] font-sans-editorial font-bold uppercase tracking-wider">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setSelectedCategory(tab.id)
                setPage(1)
              }}
              className={`px-3.5 py-1.5 border transition-all whitespace-nowrap ${
                selectedCategory === tab.id
                  ? 'bg-[#111111] text-[#ffc500] border-[#111111]'
                  : 'bg-white text-[#333333] border-[#dcd8cb] hover:border-[#111111]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Articles */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border border-[#dcd8cb] bg-white p-5 animate-pulse">
              <div className="aspect-[16/10] bg-[#eae8dc] mb-4" />
              <div className="h-3 bg-[#eae8dc] w-1/3 mb-2" />
              <div className="h-5 bg-[#eae8dc] w-5/6 mb-3" />
              <div className="h-3 bg-[#eae8dc] w-full mb-1" />
              <div className="h-3 bg-[#eae8dc] w-2/3" />
            </div>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-16 bg-[#f7f6ec] border border-[#dcd8cb]">
          <p className="font-serif-editorial text-[#666] text-lg mb-2">No articles found matching your criteria.</p>
          <button
            onClick={() => {
              setQuery('')
              setSelectedCategory('')
              setSelectedSource(null)
            }}
            className="px-4 py-2 bg-[#111] text-white text-xs font-sans-editorial font-bold uppercase tracking-widest hover:bg-[#333]"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article, i) => (
              <ArticleCard
                key={article.id || i}
                article={article}
                index={i}
                variant="bento"
                onClick={() => setSelectedArticle(article)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-12 pt-8 border-t-2 border-[#111111]">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-6 py-2.5 bg-white border border-[#111111] text-[#111111] text-[11px] font-sans-editorial font-bold uppercase tracking-widest disabled:opacity-30 hover:bg-[#111111] hover:text-white transition-colors"
              >
                ← Previous
              </button>
              <span className="text-[12px] font-mono text-[#555555]">
                PAGE {page} OF {totalPages} ({total} ARTICLES)
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-6 py-2.5 bg-white border border-[#111111] text-[#111111] text-[11px] font-sans-editorial font-bold uppercase tracking-widest disabled:opacity-30 hover:bg-[#111111] hover:text-white transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* Reader Modal */}
      <ArticleModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />
    </div>
  )
}
