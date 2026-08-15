'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ResearchPaper, ResearchSource } from '@/types'
import { fetchResearchPapers, fetchResearchSources } from '@/lib/api'

export default function ResearchPage() {
  const [papers, setPapers] = useState<ResearchPaper[]>([])
  const [sources, setSources] = useState<ResearchSource[]>([])
  const [totalPapers, setTotalPapers] = useState(0)
  const [selectedSource, setSelectedSource] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedPaperModal, setSelectedPaperModal] = useState<ResearchPaper | null>(null)
  const [citationModalPaper, setCitationModalPaper] = useState<ResearchPaper | null>(null)
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null)

  const categories = [
    'All Topics',
    'Exoplanets',
    'Cosmology',
    'Galaxies',
    'Stars & Stellar',
    'Solar Physics',
    'Instrumentation',
  ]

  const loadSources = async () => {
    try {
      const data = await fetchResearchSources()
      if (data && data.sources) {
        setSources(data.sources)
        setTotalPapers(data.total_papers || 84)
      }
    } catch {
      // Fallback handled
    }
  }

  const loadPapers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetchResearchPapers({
        source: selectedSource !== 'all' ? selectedSource : undefined,
        category: selectedCategory !== 'All Topics' && selectedCategory !== 'all' ? selectedCategory : undefined,
        query: searchQuery.trim() || undefined,
        size: 50,
      })
      setPapers(res.items || [])
      setTotalPapers(res.total || 0)
    } catch {
      setPapers([])
    } finally {
      setLoading(false)
    }
  }, [selectedSource, selectedCategory, searchQuery])

  useEffect(() => {
    loadSources()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPapers()
    }, 250)
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
  journal = {${p.journal_name || 'Astrophysics Journal'}},
  year = {${year}},
  doi = {${p.doi || ''}},
  url = {${p.url}}
}`
  }

  const getAPA = (p: ResearchPaper) => {
    const authorsStr = (p.authors || []).slice(0, 3).join(', ') + ((p.authors || []).length > 3 ? ', et al.' : '')
    const year = p.published_date?.slice(0, 4) || '2026'
    return `${authorsStr} (${year}). ${p.title}. ${p.journal_name || 'Astrophysics Journal'}. https://doi.org/${p.doi || p.url}`
  }

  return (
    <div className="bg-[#fdfcf4] text-[#111111] min-h-screen">
      {/* 1. ACADEMIC JOURNAL MASTHEAD */}
      <section className="px-4 sm:px-6 lg:px-10 py-10 border-b border-[#111111] bg-[#fbfaf0]">
        <div className="max-w-[1340px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-[#111111] pb-6 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="eyebrow text-[#111111]">ACADEMIC RESEARCH & PREPRINT REPOSITORY</span>
                <span className="text-[#888884]">•</span>
                <span className="text-[11px] font-sans-editorial font-bold uppercase tracking-wider text-[#d97706] bg-[#fef3c7] px-2 py-0.5 border border-[#f59e0b]">
                  OPEN ACCESS
                </span>
              </div>
              <h1 className="text-[34px] sm:text-[46px] lg:text-[54px] font-serif-editorial font-normal leading-[1.02] text-[#111111]">
                Astrophysics Research Papers
              </h1>
              <p className="text-[14px] sm:text-[15px] font-serif-editorial text-[#555555] max-w-2xl mt-2 leading-relaxed">
                Direct indexing and preprint dispatches from the world&apos;s leading astronomy archives, peer-reviewed European & international journals, and NASA astrophysics data systems.
              </p>
            </div>

            <div className="flex items-center gap-6 text-right">
              <div>
                <div className="text-[20px] font-sans-editorial font-bold text-[#111111] leading-none uppercase tracking-wider">
                  CONTINUOUS
                </div>
                <div className="text-[10px] font-sans-editorial uppercase tracking-widest text-[#777777] mt-1">
                  Research Feed
                </div>
              </div>
              <div className="h-10 w-px bg-[#dcd8cb]" />
              <div>
                <div className="text-[20px] font-sans-editorial font-bold text-[#111111] leading-none uppercase tracking-wider">
                  PEER-REVIEWED
                </div>
                <div className="text-[10px] font-sans-editorial uppercase tracking-widest text-[#777777] mt-1">
                  Preprint Portals
                </div>
              </div>
            </div>
          </div>

          {/* 4 SOURCE REPOSITORY CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {sources.map((s) => {
              const isSelected = selectedSource === s.key
              return (
                <div
                  key={s.key}
                  onClick={() => setSelectedSource(isSelected ? 'all' : s.key)}
                  className={`p-4 border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#111111] bg-white shadow-md ring-2 ring-[#111111]'
                      : 'border-[#dcd8cb] bg-white hover:border-[#111111] shadow-2xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-sans-editorial font-bold uppercase tracking-wider mb-2">
                      <span className="text-[#999999]">{s.badge}</span>
                      <span className="bg-[#f0eee0] text-[#111111] px-1.5 py-0.5 border border-[#dcd8cb]">
                        LIVE ARCHIVE
                      </span>
                    </div>
                    <h3 className="text-[15px] font-serif-editorial font-bold text-[#111111] leading-snug mb-1">
                      {s.name}
                    </h3>
                    <p className="text-[12px] font-serif-editorial text-[#666666] line-clamp-2 leading-relaxed">
                      {s.description}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-[#eee] flex items-center justify-between text-[11px] font-sans-editorial font-bold">
                    <span className="text-[#111111] uppercase tracking-wider">
                      {isSelected ? '✓ ACTIVE FILTER' : 'FILTER PAPERS'}
                    </span>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[#666] hover:text-[#111] hover:underline"
                      title={`Visit ${s.name}`}
                    >
                      VISIT ↗
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 2. SEARCH & FILTER CONTROLS */}
      <section className="px-4 sm:px-6 lg:px-10 py-6 border-b border-[#dcd8cb] sticky top-[41px] z-30 bg-[#fdfcf4]">
        <div className="max-w-[1340px] mx-auto space-y-4">
          {/* Search bar & Active Source Pills */}
          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <input
                type="text"
                placeholder="Search by title, author, keyword, DOI (e.g. 10.1051), or ADS bibcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#111111] text-[14px] font-serif-editorial text-[#111111] placeholder:text-[#888884] focus:outline-none focus:ring-1 focus:ring-[#111111]"
              />
              <svg
                className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#777] hover:text-[#111] font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Source Tab Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {[
                { key: 'all', label: 'ALL SOURCES' },
                { key: 'aanda', label: 'A&A' },
                { key: 'iaarj', label: 'IAARJ' },
                { key: 'arxiv', label: 'ARXIV' },
                { key: 'nasa_ads', label: 'NASA ADS' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedSource(tab.key)}
                  className={`px-3 py-2 text-[11px] font-sans-editorial font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                    selectedSource === tab.key
                      ? 'bg-[#111111] text-white shadow-xs'
                      : 'bg-white border border-[#dcd8cb] text-[#555555] hover:border-[#111111] hover:text-[#111111]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px] font-sans-editorial">
            <span className="font-bold text-[#888884] uppercase tracking-wider whitespace-nowrap mr-1">
              DISCIPLINE:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat === 'All Topics' ? 'all' : cat)}
                className={`px-2.5 py-1 uppercase tracking-wider rounded-none transition-colors whitespace-nowrap ${
                  (selectedCategory === 'all' && cat === 'All Topics') || selectedCategory === cat
                    ? 'bg-[#dcd8cb] text-[#111111] font-bold border border-[#b8b4a6]'
                    : 'text-[#666666] hover:text-[#111111] hover:bg-[#eae8dc]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. PAPERS LISTING */}
      <section className="px-4 sm:px-6 lg:px-10 py-10">
        <div className="max-w-[1340px] mx-auto">
          {loading ? (
            <div className="space-y-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white border border-[#dcd8cb] p-6 animate-pulse space-y-3">
                  <div className="h-4 bg-[#eae8dc] w-1/4" />
                  <div className="h-6 bg-[#eae8dc] w-3/4" />
                  <div className="h-4 bg-[#eae8dc] w-full" />
                  <div className="h-4 bg-[#eae8dc] w-1/2" />
                </div>
              ))}
            </div>
          ) : papers.length === 0 ? (
            <div className="text-center py-20 bg-white border border-[#dcd8cb] p-8">
              <div className="text-[32px] mb-3">🔭</div>
              <h3 className="text-[20px] font-serif-editorial font-bold text-[#111111] mb-2">
                No Research Papers Found
              </h3>
              <p className="text-[14px] font-serif-editorial text-[#666666] max-w-md mx-auto mb-6">
                No matching research papers found for your active search or filter criteria. Try searching for broader terms like &quot;exoplanet&quot;, &quot;dark matter&quot;, or clearing the source filter.
              </p>
              <button
                onClick={() => {
                  setSelectedSource('all')
                  setSelectedCategory('all')
                  setSearchQuery('')
                }}
                className="px-4 py-2 bg-[#111111] text-white text-[11px] font-sans-editorial font-bold uppercase tracking-widest hover:bg-[#333]"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {papers.map((paper, idx) => (
                <article
                  key={paper.id || idx}
                  className="bg-white border border-[#dcd8cb] hover:border-[#111111] p-6 transition-all group shadow-2xs hover:shadow-sm"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-2.5 flex-1">
                      {/* Eyebrow & Badges */}
                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-sans-editorial font-bold uppercase tracking-wider">
                        <span className="bg-[#111111] text-white px-2 py-0.5">
                          {paper.source_key?.toUpperCase() || 'RESEARCH'}
                        </span>
                        <span className="text-[#666666]">•</span>
                        <span className="text-[#111111] font-serif-editorial italic font-normal">
                          {paper.journal_name}
                        </span>
                        {paper.category && (
                          <>
                            <span className="text-[#666666]">•</span>
                            <span className="text-[#777777]">{paper.category}</span>
                          </>
                        )}
                        {paper.published_date && (
                          <>
                            <span className="text-[#666666]">•</span>
                            <span className="text-[#888884]">{paper.published_date}</span>
                          </>
                        )}
                      </div>

                      {/* Paper Title */}
                      <h2
                        onClick={() => setSelectedPaperModal(paper)}
                        className="text-[20px] sm:text-[23px] font-serif-editorial font-normal text-[#111111] leading-tight hover:text-[#555555] cursor-pointer transition-colors"
                      >
                        {paper.title}
                      </h2>

                      {/* Authors List */}
                      <div className="text-[12px] font-sans-editorial text-[#555555]">
                        <span className="font-bold text-[#111111]">Authors: </span>
                        {(paper.authors || []).slice(0, 5).join(', ')}
                        {(paper.authors || []).length > 5 && ' et al.'}
                      </div>

                      {/* Abstract Snippet */}
                      <p className="text-[14px] font-serif-editorial text-[#444444] leading-relaxed line-clamp-3">
                        {paper.abstract}
                      </p>

                      {/* DOI & Bibcode Info */}
                      <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] font-mono text-[#777777]">
                        {paper.doi && (
                          <span className="bg-[#f7f6ec] px-2 py-0.5 border border-[#e5e3d7]">
                            DOI: {paper.doi}
                          </span>
                        )}
                        {paper.bibcode && (
                          <span className="bg-[#f7f6ec] px-2 py-0.5 border border-[#e5e3d7]">
                            BIBCODE: {paper.bibcode}
                          </span>
                        )}
                        {paper.citation_count !== undefined && paper.citation_count > 0 && (
                          <span className="text-[#111111] font-sans-editorial font-bold">
                            ★ {paper.citation_count} CITATIONS
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right Action Buttons */}
                    <div className="flex flex-row md:flex-col items-center md:items-end gap-2 shrink-0 pt-2 md:pt-0">
                      <button
                        onClick={() => setSelectedPaperModal(paper)}
                        className="px-3.5 py-1.5 bg-[#111111] text-white text-[11px] font-sans-editorial font-bold uppercase tracking-wider hover:bg-[#333] transition-colors w-full sm:w-auto text-center"
                      >
                        READ ABSTRACT
                      </button>

                      {paper.pdf_url && (
                        <a
                          href={paper.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-1.5 bg-white border border-[#111111] text-[#111111] text-[11px] font-sans-editorial font-bold uppercase tracking-wider hover:bg-[#f5f4ea] transition-colors flex items-center justify-center gap-1 w-full sm:w-auto"
                        >
                          <span>PDF</span>
                          <span>↓</span>
                        </a>
                      )}

                      <a
                        href={paper.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-1.5 bg-[#f0eee0] text-[#111111] text-[11px] font-sans-editorial font-bold uppercase tracking-wider hover:bg-[#e2e0d0] transition-colors flex items-center justify-center gap-1 w-full sm:w-auto"
                      >
                        <span>SOURCE</span>
                        <span>↗</span>
                      </a>

                      <button
                        onClick={() => setCitationModalPaper(paper)}
                        className="text-[11px] font-sans-editorial font-bold uppercase tracking-wider text-[#666] hover:text-[#111] underline py-1"
                      >
                        CITE
                      </button>
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
            <div className="border-b border-[#111111] pb-4 mb-6">
              <div className="flex items-center gap-2 text-[11px] font-sans-editorial font-bold uppercase tracking-wider text-[#666666] mb-2">
                <span className="bg-[#111111] text-white px-2 py-0.5">
                  {selectedPaperModal.source_key?.toUpperCase()}
                </span>
                <span>•</span>
                <span>{selectedPaperModal.journal_name}</span>
                {selectedPaperModal.category && (
                  <>
                    <span>•</span>
                    <span>{selectedPaperModal.category}</span>
                  </>
                )}
              </div>
              <h2 className="text-[24px] sm:text-[28px] font-serif-editorial font-normal text-[#111111] leading-tight">
                {selectedPaperModal.title}
              </h2>
              <div className="mt-3 text-[12px] font-sans-editorial text-[#555555]">
                <span className="font-bold text-[#111111]">Authors: </span>
                {(selectedPaperModal.authors || []).join(', ')}
              </div>
              {selectedPaperModal.published_date && (
                <div className="text-[11px] font-sans-editorial text-[#777777] mt-1">
                  Published: {selectedPaperModal.published_date}
                </div>
              )}
            </div>

            {/* Abstract Body */}
            <div className="space-y-4 mb-6">
              <h3 className="text-[13px] font-sans-editorial font-bold uppercase tracking-wider text-[#111111]">
                SCIENTIFIC ABSTRACT
              </h3>
              <p className="text-[15px] font-serif-editorial text-[#222222] leading-relaxed">
                {selectedPaperModal.abstract}
              </p>
            </div>

            {/* Identifiers */}
            <div className="bg-white border border-[#dcd8cb] p-3 text-[12px] font-mono text-[#555555] space-y-1 mb-6">
              {selectedPaperModal.doi && <div>DOI: {selectedPaperModal.doi}</div>}
              {selectedPaperModal.bibcode && <div>ADS BIBCODE: {selectedPaperModal.bibcode}</div>}
              {selectedPaperModal.arxiv_id && <div>ARXIV ID: {selectedPaperModal.arxiv_id}</div>}
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#111111]">
              <button
                onClick={() => {
                  setCitationModalPaper(selectedPaperModal)
                  setSelectedPaperModal(null)
                }}
                className="px-4 py-2 bg-[#f0eee0] text-[#111111] text-[11px] font-sans-editorial font-bold uppercase tracking-wider hover:bg-[#e2e0d0]"
              >
                CITE PAPER
              </button>

              <div className="flex items-center gap-3">
                {selectedPaperModal.pdf_url && (
                  <a
                    href={selectedPaperModal.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-[#ffc500] text-[#111111] text-[11px] font-sans-editorial font-bold uppercase tracking-wider hover:bg-[#f0ba00]"
                  >
                    DOWNLOAD PDF →
                  </a>
                )}
                <a
                  href={selectedPaperModal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#111111] text-white text-[11px] font-sans-editorial font-bold uppercase tracking-wider hover:bg-[#333]"
                >
                  OPEN ON {selectedPaperModal.source_key?.toUpperCase()} ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. CITATION EXPORT MODAL */}
      {citationModalPaper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4">
          <div className="bg-[#fdfcf4] border-2 border-[#111111] max-w-xl w-full p-6 sm:p-8 relative shadow-2xl animate-in">
            <button
              onClick={() => setCitationModalPaper(null)}
              className="absolute top-4 right-4 text-[#111111] hover:text-[#777] text-lg font-bold p-2"
            >
              ✕
            </button>

            <h3 className="text-[20px] font-serif-editorial font-bold text-[#111111] mb-1">
              Cite This Research Paper
            </h3>
            <p className="text-[12px] font-serif-editorial text-[#666666] mb-6">
              {citationModalPaper.title}
            </p>

            {/* BibTeX */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-sans-editorial font-bold uppercase tracking-wider text-[#111111]">
                    BibTeX Format
                  </span>
                  <button
                    onClick={() => copyToClipboard(getBibtex(citationModalPaper), 'bibtex')}
                    className="text-[10px] font-sans-editorial font-bold uppercase tracking-wider text-[#d97706] hover:underline"
                  >
                    {copiedFormat === 'bibtex' ? '✓ COPIED' : 'COPY BIBTEX'}
                  </button>
                </div>
                <pre className="bg-white border border-[#dcd8cb] p-3 text-[11px] font-mono text-[#333333] overflow-x-auto whitespace-pre-wrap">
                  {getBibtex(citationModalPaper)}
                </pre>
              </div>

              {/* APA */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-sans-editorial font-bold uppercase tracking-wider text-[#111111]">
                    APA 7th Edition
                  </span>
                  <button
                    onClick={() => copyToClipboard(getAPA(citationModalPaper), 'apa')}
                    className="text-[10px] font-sans-editorial font-bold uppercase tracking-wider text-[#d97706] hover:underline"
                  >
                    {copiedFormat === 'apa' ? '✓ COPIED' : 'COPY APA'}
                  </button>
                </div>
                <div className="bg-white border border-[#dcd8cb] p-3 text-[12px] font-serif-editorial text-[#333333]">
                  {getAPA(citationModalPaper)}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#dcd8cb] text-right">
              <button
                onClick={() => setCitationModalPaper(null)}
                className="px-4 py-2 bg-[#111111] text-white text-[11px] font-sans-editorial font-bold uppercase tracking-widest hover:bg-[#333]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
