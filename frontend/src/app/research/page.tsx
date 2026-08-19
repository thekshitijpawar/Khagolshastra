'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ResearchPaper, ResearchSource } from '@/types'
import { fetchResearchSources } from '@/lib/api'

export default function ResearchPage() {
  const [papers, setPapers] = useState<ResearchPaper[]>([])
  const [sources, setSources] = useState<ResearchSource[]>([])
  const [totalPapers, setTotalPapers] = useState(0)
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({})
  const [dateCounts, setDateCounts] = useState<Record<string, number>>({})
  const [selectedSource, setSelectedSource] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'timeline' | 'grid'>('timeline')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedPaperModal, setSelectedPaperModal] = useState<ResearchPaper | null>(null)
  const [citationModalPaper, setCitationModalPaper] = useState<ResearchPaper | null>(null)
  const [activeCitationTab, setActiveCitationTab] = useState<'bibtex' | 'apa' | 'mla'>('bibtex')
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null)

  const categories = [
    { key: 'all', label: 'All Topics', icon: '🌌' },
    { key: 'Exoplanets', label: 'Exoplanets', icon: '🪐' },
    { key: 'Cosmology', label: 'Cosmology', icon: '🔭' },
    { key: 'Galaxies', label: 'Galaxies', icon: '🌀' },
    { key: 'High-Energy', label: 'High-Energy & Black Holes', icon: '⚡' },
    { key: 'Stars & Solar', label: 'Stars & Solar Physics', icon: '☀️' },
    { key: 'Instrumentation', label: 'Instrumentation & Methods', icon: '📡' },
  ]

  const dateFilters = [
    { key: 'all', label: 'All Dates' },
    { key: 'today', label: 'Today’s Dispatch' },
    { key: 'yesterday', label: 'Yesterday' },
    { key: 'week', label: 'Past 7 Days' },
    { key: 'month', label: 'Past 30 Days' },
  ]

  const loadSources = async () => {
    try {
      const data = await fetchResearchSources()
      if (data && data.sources) {
        setSources(data.sources)
      }
    } catch {
      // Handled
    }
  }

  const loadPapers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedSource !== 'all') params.set('source', selectedSource)
      if (selectedCategory !== 'all') params.set('category', selectedCategory)
      if (selectedDateFilter !== 'all') params.set('date', selectedDateFilter)
      if (searchQuery.trim()) params.set('query', searchQuery.trim())
      params.set('size', '100')

      const res = await fetch(`/api/research/papers?${params.toString()}`, { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setPapers(data.items || [])
        setTotalPapers(data.total || 0)
        if (data.category_counts) setCategoryCounts(data.category_counts)
        if (data.date_counts) setDateCounts(data.date_counts)
      }
    } catch {
      setPapers([])
    } finally {
      setLoading(false)
    }
  }, [selectedSource, selectedCategory, selectedDateFilter, searchQuery])

  useEffect(() => {
    loadSources()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPapers()
    }, 200)
    return () => clearTimeout(timer)
  }, [loadPapers])

  const copyToClipboard = (text: string, format: string) => {
    navigator.clipboard.writeText(text)
    setCopiedFormat(format)
    setTimeout(() => setCopiedFormat(null), 2500)
  }

  const getBibtex = (p: ResearchPaper) => {
    const authorLast = p.authors?.[0]?.split(' ').pop() || 'Astronomer'
    const year = p.published_date?.slice(0, 4) || '2026'
    const key = `${authorLast}${year}${p.title.slice(0, 8).replace(/[^a-zA-Z]/g, '')}`
    return `@article{${key},
  title = {${p.title}},
  author = {${(p.authors || []).join(' and ')}},
  journal = {${p.journal_name || 'arXiv Astrophysics'}},
  year = {${year}},
  eprint = {${p.arxiv_id || ''}},
  archivePrefix = {arXiv},
  primaryClass = {astro-ph},
  url = {${p.url}}
}`
  }

  const getAPA = (p: ResearchPaper) => {
    const authorsStr = (p.authors || []).slice(0, 3).join(', ') + ((p.authors || []).length > 3 ? ', et al.' : '')
    const year = p.published_date?.slice(0, 4) || '2026'
    return `${authorsStr} (${year}). ${p.title}. ${p.journal_name || 'arXiv Astrophysics'}. ${p.url}`
  }

  const getMLA = (p: ResearchPaper) => {
    const authorFirst = p.authors?.[0] || 'Astrophysics Collaboration'
    const year = p.published_date?.slice(0, 4) || '2026'
    return `${authorFirst}, et al. "${p.title}." ${p.journal_name || 'arXiv Astrophysics'}, ${year}, ${p.url}.`
  }

  // Group papers neatly by publication day
  const groupedByDate: Record<string, ResearchPaper[]> = {}
  for (const p of papers) {
    const d = p.published_date || 'Recent'
    if (!groupedByDate[d]) groupedByDate[d] = []
    groupedByDate[d].push(p)
  }
  const sortedDates = Object.keys(groupedByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  const todayStr = new Date().toISOString().slice(0, 10)
  const todayCount = dateCounts[todayStr] || (groupedByDate[todayStr] ? groupedByDate[todayStr].length : 0)

  function formatDayHeader(dateStr: string): string {
    try {
      const d = new Date(dateStr)
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
      const isToday = dateStr === todayStr
      const isYesterday = dateStr === yesterday
      const formatted = d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
      if (isToday) return `TODAY • ${formatted.toUpperCase()}`
      if (isYesterday) return `YESTERDAY • ${formatted.toUpperCase()}`
      return formatted.toUpperCase()
    } catch {
      return dateStr
    }
  }

  return (
    <div className="bg-[#fdfcf4] text-[#111111] min-h-screen">
      {/* 1. ACADEMIC JOURNAL MASTHEAD WITH DAILY TICKER */}
      <section className="px-4 sm:px-6 lg:px-10 py-8 border-b-2 border-[#111111] bg-[#fbfaf0]">
        <div className="max-w-[1340px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-[#111111] pb-6 mb-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="bg-[#111111] text-[#ffc500] text-[10px] font-sans-editorial font-bold uppercase tracking-widest px-2 py-0.5">
                  DAILY ACADEMIC REPOSITORY
                </span>
                <span className="text-[#888884]">•</span>
                <span className="text-[10.5px] font-sans-editorial font-bold uppercase tracking-wider text-[#990000] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#990000] animate-pulse"></span>
                  <span>UPDATED DAILY FROM ARXIV & NASA ADS</span>
                </span>
              </div>
              <h1 className="text-[32px] sm:text-[46px] lg:text-[52px] font-serif-editorial font-normal leading-[1.02] text-[#111111]">
                Daily Astrophysics Research Papers
              </h1>
              <p className="text-[14px] sm:text-[15px] font-serif-editorial text-[#555555] max-w-3xl mt-2 leading-relaxed">
                Direct daily indexing of peer-reviewed preprints, planetary discoveries, cosmology datasets, and astronomical instrumentation submitted across global astrophysical archives.
              </p>
            </div>

            {/* Daily Metric Tickers */}
            <div className="flex items-center gap-5 text-right shrink-0">
              <div className="bg-white border-2 border-[#111111] px-4 py-2 shadow-[3px_3px_0px_#111111]">
                <div className="text-[22px] font-sans-editorial font-extrabold text-[#111111] leading-none">
                  {todayCount || totalPapers}
                </div>
                <div className="text-[9.5px] font-sans-editorial font-bold uppercase tracking-widest text-[#777777] mt-1">
                  TODAY&apos;S PREPRINTS
                </div>
              </div>
              <div className="bg-white border-2 border-[#111111] px-4 py-2 shadow-[3px_3px_0px_#111111]">
                <div className="text-[22px] font-sans-editorial font-extrabold text-[#111111] leading-none">
                  {totalPapers}
                </div>
                <div className="text-[9.5px] font-sans-editorial font-bold uppercase tracking-widest text-[#777777] mt-1">
                  INDEXED PAPERS
                </div>
              </div>
            </div>
          </div>

          {/* Sub-Discipline Live Counters Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {categories.filter((c) => c.key !== 'all').map((cat) => {
              const isSelected = selectedCategory === cat.key
              const count = categoryCounts[cat.key] || 0
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setSelectedCategory(isSelected ? 'all' : cat.key)}
                  className={`p-2.5 border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#111111] text-[#ffc500] border-[#111111] shadow-[3px_3px_0px_#ffc500]'
                      : 'bg-white border-[#dcd8cb] hover:border-[#111111] text-[#111111] shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span>{cat.icon}</span>
                    <span className={`text-[10px] font-sans-editorial font-bold px-1.5 py-0.2 ${
                      isSelected ? 'bg-[#ffc500] text-[#111111]' : 'bg-[#f0eee0] text-[#555]'
                    }`}>
                      {count}
                    </span>
                  </div>
                  <div className="text-[11.5px] font-sans-editorial font-bold uppercase tracking-wider leading-tight truncate">
                    {cat.label.split('&')[0]}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* 2. SEARCH & DAILY FILTER CONTROLS */}
      <section className="px-4 sm:px-6 lg:px-10 py-5 border-b border-[#dcd8cb] sticky top-[41px] z-30 bg-[#fdfcf4] shadow-xs">
        <div className="max-w-[1340px] mx-auto space-y-3.5">
          {/* Row 1: Search & Date Filter Tabs */}
          <div className="flex flex-col lg:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <input
                type="text"
                placeholder="Search by paper title, author, exoplanet, dark matter, DOI, or arXiv ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 bg-white border-2 border-[#111111] text-[13.5px] font-serif-editorial text-[#111111] placeholder:text-[#888884] focus:outline-none focus:ring-1 focus:ring-[#111111]"
              />
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#777777]">🔍</span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#777] hover:text-[#111] font-bold p-1"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Date Range Selector */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0 scrollbar-thin">
              {dateFilters.map((df) => (
                <button
                  key={df.key}
                  onClick={() => setSelectedDateFilter(df.key)}
                  className={`px-3 py-2 text-[10.5px] font-sans-editorial font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                    selectedDateFilter === df.key
                      ? 'bg-[#111111] text-[#ffc500] shadow-[2px_2px_0px_#111111]'
                      : 'bg-white border border-[#dcd8cb] text-[#555555] hover:border-[#111111] hover:text-[#111111]'
                  }`}
                >
                  {df.label}
                </button>
              ))}
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center border border-[#111111] bg-white p-0.5 shrink-0 hidden sm:flex">
              <button
                type="button"
                onClick={() => setViewMode('timeline')}
                className={`px-2.5 py-1.5 text-[10px] font-sans-editorial font-bold uppercase tracking-wider transition-all ${
                  viewMode === 'timeline' ? 'bg-[#111111] text-[#ffc500]' : 'text-[#666] hover:text-[#111]'
                }`}
                title="Timeline View (Grouped neatly by date)"
              >
                📅 TIMELINE
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`px-2.5 py-1.5 text-[10px] font-sans-editorial font-bold uppercase tracking-wider transition-all ${
                  viewMode === 'grid' ? 'bg-[#111111] text-[#ffc500]' : 'text-[#666] hover:text-[#111]'
                }`}
                title="Compact Grid View"
              >
                📋 GRID
              </button>
            </div>
          </div>

          {/* Row 2: Sub-discipline Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-sans-editorial scrollbar-thin">
            <span className="font-bold text-[#888884] uppercase tracking-wider whitespace-nowrap mr-1 text-[10px]">
              SUB-DISCIPLINE:
            </span>
            {categories.map((cat) => {
              const count = cat.key === 'all' ? totalPapers : categoryCounts[cat.key] || 0
              return (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-2.5 py-1 uppercase tracking-wider transition-all whitespace-nowrap text-[10.5px] font-bold ${
                    selectedCategory === cat.key
                      ? 'bg-[#111111] text-[#ffc500]'
                      : 'bg-white border border-[#dcd8cb] text-[#555555] hover:border-[#111111] hover:text-[#111111]'
                  }`}
                >
                  {cat.label} ({count})
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* 3. PAPERS LISTING (TIMELINE OR GRID VIEW) */}
      <section className="px-4 sm:px-6 lg:px-10 py-10">
        <div className="max-w-[1340px] mx-auto">
          {loading ? (
            <div className="space-y-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white border-2 border-[#dcd8cb] p-6 animate-pulse space-y-3">
                  <div className="h-4 bg-[#eae8dc] w-1/4" />
                  <div className="h-6 bg-[#eae8dc] w-3/4" />
                  <div className="h-12 bg-[#f4f2e8] w-full" />
                  <div className="h-4 bg-[#eae8dc] w-1/3" />
                </div>
              ))}
            </div>
          ) : papers.length === 0 ? (
            <div className="text-center py-20 bg-white border-2 border-[#111111] p-8 shadow-[4px_4px_0px_#111111]">
              <div className="text-[36px] mb-3">🔭</div>
              <h3 className="text-[22px] font-serif-editorial font-bold text-[#111111] mb-2">
                No Research Papers Found
              </h3>
              <p className="text-[14px] font-serif-editorial text-[#666666] max-w-md mx-auto mb-6">
                No matching research preprints found for your active search or date criteria. Try resetting filters to explore today&apos;s full arXiv index.
              </p>
              <button
                onClick={() => {
                  setSelectedSource('all')
                  setSelectedCategory('all')
                  setSelectedDateFilter('all')
                  setSearchQuery('')
                }}
                className="px-5 py-2.5 bg-[#111111] text-[#ffc500] text-[11px] font-sans-editorial font-bold uppercase tracking-widest hover:bg-[#333] shadow-[2px_2px_0px_#111111]"
              >
                Reset All Filters
              </button>
            </div>
          ) : viewMode === 'timeline' ? (
            /* TIMELINE VIEW (Grouped neatly by day) */
            <div className="space-y-12">
              {sortedDates.map((dateStr) => {
                const dayPapers = groupedByDate[dateStr] || []
                const isToday = dateStr === todayStr
                return (
                  <div key={dateStr} className="space-y-5">
                    {/* Day Header Banner */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-[#111111] pb-2 gap-2 bg-[#f5f4ea] px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">📅</span>
                        <h2 className="text-[14px] sm:text-[16px] font-sans-editorial font-extrabold uppercase tracking-wider text-[#111111]">
                          {formatDayHeader(dateStr)}
                        </h2>
                        {isToday && (
                          <span className="bg-[#990000] text-white text-[9.5px] font-sans-editorial font-bold uppercase tracking-widest px-2 py-0.5 animate-pulse">
                            NEW TODAY
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-sans-editorial font-bold uppercase tracking-wider text-[#666666]">
                        {dayPapers.length} PAPERS INDEXED
                      </span>
                    </div>

                    {/* Papers for this day */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {dayPapers.map((paper, idx) => (
                        <article
                          key={paper.id || `${dateStr}-${idx}`}
                          className="bg-white border-2 border-[#111111] p-6 flex flex-col justify-between hover:shadow-[6px_6px_0px_#111111] transition-all group"
                        >
                          <div>
                            {/* Card Header & Badges */}
                            <div className="flex flex-wrap items-center justify-between border-b border-[#e5e1d3] pb-2 mb-3 gap-1.5 text-[10px] font-sans-editorial font-bold uppercase tracking-wider">
                              <div className="flex items-center gap-1.5">
                                <span className="bg-[#111111] text-[#ffc500] px-2 py-0.5">
                                  {paper.category || 'ASTROPHYSICS'}
                                </span>
                                <span className="text-[#888884]">
                                  {paper.source_key?.toUpperCase() || 'ARXIV'}
                                </span>
                              </div>
                              <span className="text-[#666666]">{paper.published_date}</span>
                            </div>

                            {/* Title */}
                            <h3
                              onClick={() => setSelectedPaperModal(paper)}
                              className="text-[18px] sm:text-[20px] font-serif-editorial font-bold leading-snug text-[#111111] mb-2.5 cursor-pointer group-hover:text-[#990000] transition-colors"
                            >
                              {paper.title}
                            </h3>

                            {/* Authors */}
                            <div className="text-[11.5px] font-sans-editorial text-[#666666] mb-3">
                              <span className="font-bold text-[#111111]">AUTHORS: </span>
                              {(paper.authors || []).slice(0, 4).join(', ')}
                              {(paper.authors || []).length > 4 && ' et al.'}
                            </div>

                            {/* Abstract Preview */}
                            <p className="text-[13px] font-serif-editorial text-[#444444] leading-relaxed line-clamp-3 mb-4">
                              {paper.abstract}
                            </p>
                          </div>

                          {/* Action Footer */}
                          <div className="pt-3 border-t border-[#e5e1d3] flex flex-wrap items-center justify-between gap-2 text-[10.5px] font-sans-editorial font-bold uppercase">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setSelectedPaperModal(paper)}
                                className="text-[#111111] hover:underline"
                              >
                                Read Abstract
                              </button>
                              <span className="text-[#dcd8cb]">•</span>
                              <button
                                onClick={() => {
                                  setCitationModalPaper(paper)
                                  setActiveCitationTab('bibtex')
                                }}
                                className="text-[#666666] hover:text-[#111111] hover:underline"
                              >
                                Cite Paper
                              </button>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {paper.pdf_url && (
                                <a
                                  href={paper.pdf_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2 py-1 bg-white border border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-[#ffc500] transition-colors inline-flex items-center gap-1"
                                >
                                  <span>PDF</span>
                                  <span>↓</span>
                                </a>
                              )}
                              <a
                                href={paper.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-1 bg-[#111111] text-[#ffc500] hover:bg-[#333] transition-colors inline-flex items-center gap-1"
                              >
                                <span>arXiv</span>
                                <span>↗</span>
                              </a>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            /* COMPACT GRID VIEW */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {papers.map((paper, idx) => (
                <article
                  key={paper.id || idx}
                  className="bg-white border-2 border-[#111111] p-5 flex flex-col justify-between hover:shadow-[5px_5px_0px_#111111] transition-all group"
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-[#e5e1d3] pb-2 mb-2.5 text-[9.5px] font-sans-editorial font-bold uppercase tracking-wider">
                      <span className="bg-[#111111] text-[#ffc500] px-2 py-0.5">
                        {paper.category || 'ASTROPHYSICS'}
                      </span>
                      <span className="text-[#777777]">{paper.published_date}</span>
                    </div>

                    <h3
                      onClick={() => setSelectedPaperModal(paper)}
                      className="text-[17px] font-serif-editorial font-bold leading-snug text-[#111111] mb-2 cursor-pointer group-hover:text-[#990000] transition-colors"
                    >
                      {paper.title}
                    </h3>

                    <div className="text-[11px] font-sans-editorial text-[#666666] mb-2.5 line-clamp-1">
                      <span className="font-bold text-[#111111]">Authors: </span>
                      {(paper.authors || []).join(', ')}
                    </div>

                    <p className="text-[12.5px] font-serif-editorial text-[#444444] leading-relaxed line-clamp-3 mb-4">
                      {paper.abstract}
                    </p>
                  </div>

                  <div className="pt-2.5 border-t border-[#e5e1d3] flex items-center justify-between text-[10px] font-sans-editorial font-bold uppercase">
                    <button
                      onClick={() => setSelectedPaperModal(paper)}
                      className="text-[#111111] hover:underline"
                    >
                      Abstract ↗
                    </button>
                    <div className="flex items-center gap-1.5">
                      {paper.pdf_url && (
                        <a
                          href={paper.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-0.5 border border-[#111111] hover:bg-[#111111] hover:text-[#ffc500]"
                        >
                          PDF ↓
                        </a>
                      )}
                      <a
                        href={paper.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-0.5 bg-[#111111] text-[#ffc500] hover:bg-[#333]"
                      >
                        arXiv ↗
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. ABSTRACT DETAIL MODAL */}
      {selectedPaperModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-[#fdfcf4] border-2 border-[#111111] max-w-3xl w-full p-6 sm:p-8 relative shadow-2xl my-8 animate-in">
            {/* Close Button */}
            <button
              onClick={() => setSelectedPaperModal(null)}
              className="absolute top-4 right-4 text-[#111111] hover:text-[#777] text-lg font-bold p-2"
            >
              ✕
            </button>

            {/* Header */}
            <div className="border-b border-[#111111] pb-4 mb-5">
              <div className="flex flex-wrap items-center gap-2 text-[10.5px] font-sans-editorial font-bold uppercase tracking-wider text-[#666666] mb-2">
                <span className="bg-[#111111] text-[#ffc500] px-2 py-0.5">
                  {selectedPaperModal.category || 'ASTROPHYSICS'}
                </span>
                <span>•</span>
                <span>{selectedPaperModal.journal_name}</span>
                <span>•</span>
                <span className="text-[#111111]">{selectedPaperModal.published_date}</span>
              </div>
              <h2 className="text-[22px] sm:text-[26px] font-serif-editorial font-bold text-[#111111] leading-tight">
                {selectedPaperModal.title}
              </h2>
            </div>

            {/* Authors */}
            <div className="mb-4">
              <span className="text-[11px] font-sans-editorial font-bold uppercase tracking-wider text-[#777777] block mb-1">
                AUTHORS & COLLABORATORS:
              </span>
              <p className="text-[13px] font-sans-editorial text-[#222222]">
                {(selectedPaperModal.authors || []).join(', ')}
              </p>
            </div>

            {/* Abstract */}
            <div className="mb-6">
              <span className="text-[11px] font-sans-editorial font-bold uppercase tracking-wider text-[#777777] block mb-1.5">
                ABSTRACT:
              </span>
              <div className="bg-white border border-[#dcd8cb] p-4 sm:p-5 text-[14px] font-serif-editorial text-[#333333] leading-relaxed max-h-72 overflow-y-auto">
                {selectedPaperModal.abstract}
              </div>
            </div>

            {/* Identifiers */}
            <div className="flex flex-wrap gap-2 mb-6 text-[11px] font-mono text-[#555555]">
              {selectedPaperModal.arxiv_id && (
                <span className="bg-[#f0eee0] px-2 py-1 border border-[#dcd8cb]">
                  arXiv:{selectedPaperModal.arxiv_id}
                </span>
              )}
              {selectedPaperModal.doi && (
                <span className="bg-[#f0eee0] px-2 py-1 border border-[#dcd8cb]">
                  DOI:{selectedPaperModal.doi}
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#dcd8cb]">
              <button
                onClick={() => {
                  setCitationModalPaper(selectedPaperModal)
                  setActiveCitationTab('bibtex')
                }}
                className="px-4 py-2 bg-white border border-[#111111] text-[#111111] text-xs font-sans-editorial font-bold uppercase tracking-wider hover:bg-[#f0eee0] transition-colors"
              >
                Cite This Manuscript
              </button>

              <div className="flex items-center gap-2">
                {selectedPaperModal.pdf_url && (
                  <a
                    href={selectedPaperModal.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-white border-2 border-[#111111] text-[#111111] text-xs font-sans-editorial font-bold uppercase tracking-wider hover:bg-[#111111] hover:text-[#ffc500] transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>Download Full PDF</span>
                    <span>↓</span>
                  </a>
                )}
                <a
                  href={selectedPaperModal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#111111] text-[#ffc500] text-xs font-sans-editorial font-bold uppercase tracking-wider hover:bg-[#333] transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Open on arXiv.org</span>
                  <span>↗</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. CITATION GENERATOR MODAL */}
      {citationModalPaper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4">
          <div className="bg-[#fdfcf4] border-2 border-[#111111] max-w-xl w-full p-6 sm:p-8 relative shadow-2xl">
            <button
              onClick={() => setCitationModalPaper(null)}
              className="absolute top-4 right-4 text-[#111111] hover:text-[#777] text-lg font-bold p-2"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">📑</span>
              <h3 className="text-[18px] font-serif-editorial font-bold text-[#111111]">
                Cite Research Paper
              </h3>
            </div>
            <p className="text-xs font-serif-editorial text-[#555555] line-clamp-1 mb-4 italic">
              {citationModalPaper.title}
            </p>

            {/* Citation Tabs */}
            <div className="flex border-b border-[#111111] mb-4">
              {(['bibtex', 'apa', 'mla'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveCitationTab(tab)}
                  className={`px-4 py-1.5 text-xs font-sans-editorial font-bold uppercase tracking-wider transition-all border-b-2 -mb-px ${
                    activeCitationTab === tab
                      ? 'border-[#111111] text-[#111111] bg-white'
                      : 'border-transparent text-[#777] hover:text-[#111]'
                  }`}
                >
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Code Box */}
            <div className="relative">
              <pre className="bg-[#111111] text-[#fdfcf4] p-4 text-[12px] font-mono overflow-x-auto max-h-56 leading-relaxed">
                {activeCitationTab === 'bibtex' && getBibtex(citationModalPaper)}
                {activeCitationTab === 'apa' && getAPA(citationModalPaper)}
                {activeCitationTab === 'mla' && getMLA(citationModalPaper)}
              </pre>
            </div>

            {/* Copy Action */}
            <div className="mt-4 flex justify-between items-center">
              <span className="text-[11px] font-sans-editorial text-[#777777]">
                {copiedFormat ? `✓ Copied ${copiedFormat.toUpperCase()} citation to clipboard!` : 'Copy and paste into your manuscript bibliography.'}
              </span>
              <button
                onClick={() => {
                  const text =
                    activeCitationTab === 'bibtex'
                      ? getBibtex(citationModalPaper)
                      : activeCitationTab === 'apa'
                      ? getAPA(citationModalPaper)
                      : getMLA(citationModalPaper)
                  copyToClipboard(text, activeCitationTab)
                }}
                className="px-4 py-2 bg-[#111111] text-[#ffc500] text-xs font-sans-editorial font-bold uppercase tracking-wider hover:bg-[#333] transition-colors"
              >
                {copiedFormat === activeCitationTab ? 'COPIED!' : `COPY ${activeCitationTab.toUpperCase()}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
