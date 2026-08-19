'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { SpaceAgency, SPACE_AGENCIES, OfficialRelease, getIndianStartups } from '@/lib/agencies'
import { ResearchPaper } from '@/types'
import { fetchResearchPapers } from '@/lib/api'

interface AgencyClientProps {
  agency: SpaceAgency
}

export default function AgencyClient({ agency }: AgencyClientProps) {
  const [papers, setPapers] = useState<ResearchPaper[]>([])
  const [loadingPapers, setLoadingPapers] = useState(true)
  const [newsList, setNewsList] = useState<OfficialRelease[]>(agency.officialReleases || [])
  const [loadingNews, setLoadingNews] = useState(true)
  const [activeCategory, setActiveCategory] = useState('ALL')
  const [newsSearch, setNewsSearch] = useState('')
  const [selectedRelease, setSelectedRelease] = useState<OfficialRelease | null>(null)

  const isStartup = agency.agencyType === 'Indian Private Startup'

  // Fetch Live Real-Time News & Press Releases from dedicated endpoint
  useEffect(() => {
    let isMounted = true
    async function loadLiveAgencyNews() {
      setLoadingNews(true)
      try {
        const res = await fetch(`/api/agency/news?slug=${agency.slug}`)
        if (res.ok) {
          const data = await res.json()
          if (isMounted && data.items && Array.isArray(data.items) && data.items.length > 0) {
            setNewsList(data.items)
          }
        }
      } catch (err) {
        console.error('Error loading live agency news', err)
      } finally {
        if (isMounted) setLoadingNews(false)
      }
    }

    loadLiveAgencyNews()
    return () => {
      isMounted = false
    }
  }, [agency.slug])

  // Fetch NASA ADS / arXiv research papers
  useEffect(() => {
    let isMounted = true
    async function loadAgencyPapers() {
      setLoadingPapers(true)
      try {
        const primaryTerm = agency.acronym.split('/')[0].split(' ')[0]
        const papersRes = await fetchResearchPapers({
          query: `${primaryTerm} ${agency.country}`,
          size: 6,
        })
        if (isMounted) {
          setPapers(papersRes.items || [])
        }
      } catch (err) {
        console.error('Error loading agency papers', err)
      } finally {
        if (isMounted) setLoadingPapers(false)
      }
    }

    loadAgencyPapers()
    return () => {
      isMounted = false
    }
  }, [agency])

  const siblingAgencies = isStartup
    ? getIndianStartups().filter((a) => a.slug !== agency.slug).slice(0, 6)
    : SPACE_AGENCIES.filter(
        (a) => a.region === agency.region && a.slug !== agency.slug && a.agencyType !== 'Indian Private Startup'
      ).slice(0, 6)

  // Filter news by active category and search
  const availableCategories = ['ALL', ...Array.from(new Set(newsList.map((n) => n.category).filter(Boolean))) as string[]]
  const filteredNews = newsList.filter((item) => {
    const matchesCat = activeCategory === 'ALL' || item.category === activeCategory
    const q = newsSearch.toLowerCase().trim()
    const matchesQuery =
      !q ||
      item.title.toLowerCase().includes(q) ||
      (item.summary && item.summary.toLowerCase().includes(q)) ||
      (item.source && item.source.toLowerCase().includes(q))
    return matchesCat && matchesQuery
  })

  const releases = agency.officialReleases || []
  const hostname = agency.website
    ? new URL(agency.website).hostname.replace('www.', '')
    : isStartup
    ? 'newspace.in'
    : agency.country.toLowerCase() + '.gov'

  return (
    <div className="bg-[#fdfcf4] text-[#111111] min-h-screen">
      {/* Top Breadcrumb Bar */}
      <div className="border-b border-[#dcd8cb] bg-[#f7f6ec] px-4 sm:px-6 lg:px-10 py-2.5">
        <div className="max-w-[1340px] mx-auto flex items-center justify-between text-[11px] font-sans-editorial font-bold uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-[#777777] hover:text-[#111111] transition-colors">
              Front Page
            </Link>
            <span className="text-[#888884]">/</span>
            <Link href="/agencies" className="text-[#777777] hover:text-[#111111] transition-colors">
              Space Agencies
            </Link>
            <span className="text-[#888884]">/</span>
            <span className="text-[#777777]">
              {isStartup ? 'Indian Private Startups' : agency.region}
            </span>
            <span className="text-[#888884]">/</span>
            <span className="text-[#111111]">{agency.acronym}</span>
          </div>

          <Link
            href="/agencies"
            className="text-[10px] bg-[#111111] text-[#ffc500] px-2.5 py-1 hover:bg-[#333] transition-colors hidden sm:inline-block"
          >
            VIEW ALL {SPACE_AGENCIES.length} ORGANIZATIONS →
          </Link>
        </div>
      </div>

      {/* Agency / Startup Grand Dossier Hero */}
      <section className="border-b-2 border-[#111111] px-4 sm:px-6 lg:px-10 py-8 sm:py-12 bg-white">
        <div className="max-w-[1340px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Main Details (8 cols) */}
            <div className="lg:col-span-8">
              {/* Eyebrow badges */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-xl leading-none">{agency.flag}</span>
                <span className="bg-[#111111] text-[#ffc500] text-[10px] font-sans-editorial font-bold uppercase tracking-widest px-2 py-0.5">
                  {isStartup
                    ? 'INDIAN PRIVATE SPACE STARTUP • NEWSPACE INDIA'
                    : 'OFFICIAL GOVERNMENT SPACE AGENCY'}
                </span>
                <span className="border border-[#dcd8cb] text-[#555555] text-[10px] font-sans-editorial font-bold uppercase tracking-wider px-2 py-0.5">
                  {agency.region}
                </span>
                <span className="border border-[#dcd8cb] text-[#555555] text-[10px] font-sans-editorial font-bold uppercase tracking-wider px-2 py-0.5">
                  {agency.country}
                </span>
              </div>

              {/* Title & Acronym */}
              <h1 className="text-[32px] sm:text-[46px] lg:text-[54px] font-serif-editorial font-normal leading-[1.06] text-[#111111] tracking-[-0.01em] mb-3">
                <span className="font-bold">{agency.acronym}</span> — {agency.name}
              </h1>

              {/* Startup Specialization Banner */}
              {agency.focus && (
                <div className="mb-4 p-3 bg-[#fdfcf4] border-2 border-[#111111] shadow-[3px_3px_0px_#111111] inline-flex items-center gap-2 text-xs font-sans-editorial font-bold text-[#111111]">
                  <span className="bg-[#ffc500] text-[#111111] px-2 py-0.5 text-[10px] uppercase tracking-wider">
                    MAIN FOCUS
                  </span>
                  <span>{agency.focus}</span>
                </div>
              )}

              {/* Description */}
              <p className="text-[15px] sm:text-[17px] font-serif-editorial text-[#333333] leading-relaxed mb-6 max-w-3xl">
                {agency.description}
              </p>

              {/* Official Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                {agency.newsUrl && (
                  <a
                    href={agency.newsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#111111] text-[#ffc500] hover:bg-[#333333] text-xs font-sans-editorial font-bold uppercase tracking-wider px-4 py-2.5 transition-all shadow-xs"
                  >
                    <span>📰 Open {agency.acronym} Official Press Room on {hostname}</span>
                    <span className="text-sm">↗</span>
                  </a>
                )}
                {agency.website && (
                  <a
                    href={agency.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#f4f2e6] hover:bg-[#eae8dc] text-[#111111] border border-[#111111] text-xs font-sans-editorial font-bold uppercase tracking-wider px-3.5 py-2.5 transition-all"
                  >
                    <span>🌐 Official Website</span>
                    <span className="text-sm">↗</span>
                  </a>
                )}
              </div>
            </div>

            {/* Quick Dossier Box (4 cols) */}
            <div className="lg:col-span-4 bg-[#fdfcf4] border-2 border-[#111111] p-5 shadow-[4px_4px_0px_#111111]">
              <div className="text-[11px] font-sans-editorial font-bold uppercase tracking-widest text-[#777777] border-b border-[#111111] pb-2 mb-3">
                {isStartup ? 'NEWSPACE STARTUP DOSSIER' : 'GOVERNMENT AGENCY DOSSIER'}
              </div>
              <div className="space-y-3 text-xs font-serif-editorial">
                <div className="flex justify-between border-b border-[#e5e1d3] pb-2">
                  <span className="text-[#666666] font-sans-editorial text-[10.5px] uppercase">
                    {isStartup ? 'Sector:' : 'Jurisdiction:'}
                  </span>
                  <span className="font-bold text-[#111111] text-right">
                    {isStartup ? 'Indian Private Commercial Space' : agency.country}
                  </span>
                </div>
                {agency.focus && (
                  <div className="flex justify-between border-b border-[#e5e1d3] pb-2">
                    <span className="text-[#666666] font-sans-editorial text-[10.5px] uppercase">Core Tech:</span>
                    <span className="font-bold text-[#111111] text-right max-w-[200px] truncate">{agency.focus}</span>
                  </div>
                )}
                {agency.headquarters && (
                  <div className="flex justify-between border-b border-[#e5e1d3] pb-2">
                    <span className="text-[#666666] font-sans-editorial text-[10.5px] uppercase">Headquarters:</span>
                    <span className="font-bold text-[#111111] text-right">{agency.headquarters}</span>
                  </div>
                )}
                {agency.established && (
                  <div className="flex justify-between border-b border-[#e5e1d3] pb-2">
                    <span className="text-[#666666] font-sans-editorial text-[10.5px] uppercase">Established:</span>
                    <span className="font-bold text-[#111111] text-right">{agency.established}</span>
                  </div>
                )}
                <div className="flex justify-between border-b border-[#e5e1d3] pb-2">
                  <span className="text-[#666666] font-sans-editorial text-[10.5px] uppercase">Official Portal:</span>
                  <span className="font-bold text-[#111111] text-right truncate max-w-[170px]">
                    {hostname}
                  </span>
                </div>
              </div>

              {/* Key Flagship Missions */}
              {agency.keyMissions && agency.keyMissions.length > 0 && (
                <div className="mt-4 pt-3 border-t border-[#111111]">
                  <div className="text-[10px] font-sans-editorial font-bold uppercase tracking-wider text-[#777777] mb-2">
                    {isStartup ? 'KEY PRODUCTS & LAUNCH VEHICLES' : 'FLAGSHIP MISSIONS & PROGRAMS'}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {agency.keyMissions.map((mission, idx) => (
                      <span
                        key={idx}
                        className="bg-white border border-[#dcd8cb] text-[#222222] text-[10.5px] font-sans-editorial font-medium px-2 py-0.5"
                      >
                        {mission}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content: Official Agency / Startup News Wire & Communiqués */}
      <section className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-10 py-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b-2 border-[#111111] pb-4 mb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-sans-editorial font-bold uppercase tracking-widest text-[#111111]">
              <span className="bg-[#ffc500] text-[#111111] px-2 py-0.5">VERIFIED LIVE NEWS WIRE</span>
              <span>•</span>
              <span className="text-[#990000] flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-[#990000] animate-pulse"></span>
                <span>{isStartup ? 'AUTHENTIC NEWSPACE INDIA COVERAGE' : 'DIRECT AGENCY PRESS WIRE'}</span>
              </span>
            </div>
            <h2 className="text-[26px] sm:text-[34px] font-serif-editorial font-normal text-[#111111] mt-1">
              {agency.acronym} Live News & Official Communiqués
            </h2>
            <p className="text-xs sm:text-sm font-serif-editorial text-[#555555] mt-0.5 italic">
              Real-time verified reporting, official press releases, and mission milestones for {agency.name}.
            </p>
          </div>

          {agency.newsUrl && (
            <a
              href={agency.newsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-sans-editorial font-bold text-[#111111] hover:text-[#ffc500] hover:bg-[#111111] border-2 border-[#111111] px-3.5 py-2 transition-colors shrink-0 inline-flex items-center gap-1.5 shadow-[2px_2px_0px_#111111]"
            >
              <span>VISIT OFFICIAL {agency.acronym} NEWSROOM</span>
              <span>↗</span>
            </a>
          )}
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-[#f7f6ec] border border-[#dcd8cb] p-3 sm:p-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
            {availableCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`text-[10px] font-sans-editorial font-bold uppercase tracking-wider px-2.5 py-1 transition-all whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-[#111111] text-[#ffc500]'
                    : 'bg-white border border-[#dcd8cb] text-[#555555] hover:border-[#111111] hover:text-[#111111]'
                }`}
              >
                {cat === 'ALL' ? `ALL (${newsList.length})` : cat}
              </button>
            ))}
          </div>

          {/* Live Search Input */}
          <div className="relative min-w-[240px]">
            <input
              type="text"
              value={newsSearch}
              onChange={(e) => setNewsSearch(e.target.value)}
              placeholder={`Search ${agency.acronym} updates...`}
              className="w-full text-xs font-sans-editorial bg-white border border-[#111111] px-3 py-1.5 pl-8 focus:outline-none focus:ring-1 focus:ring-[#111111]"
            />
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[#888884]">🔍</span>
            {newsSearch && (
              <button
                type="button"
                onClick={() => setNewsSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#888884] hover:text-[#111111]"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Live News Grid */}
        {loadingNews && newsList.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white border border-[#dcd8cb] p-6 animate-pulse space-y-3">
                <div className="h-4 bg-[#e5e1d3] w-1/3"></div>
                <div className="h-6 bg-[#e5e1d3] w-5/6"></div>
                <div className="h-12 bg-[#f2efe4] w-full"></div>
                <div className="h-4 bg-[#e5e1d3] w-1/4 pt-2"></div>
              </div>
            ))}
          </div>
        ) : filteredNews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {filteredNews.map((rel) => (
              <article
                key={rel.id}
                className="bg-white border-2 border-[#111111] p-6 flex flex-col justify-between hover:shadow-[6px_6px_0px_#111111] transition-all group"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between border-b border-[#e5e1d3] pb-2 mb-3 gap-2 text-[10px] font-sans-editorial font-bold uppercase tracking-wider">
                    <div className="flex items-center gap-1.5">
                      <span className="bg-[#111111] text-[#ffc500] px-2 py-0.5">
                        {rel.category || (isStartup ? 'STARTUP MILESTONE' : 'OFFICIAL UPDATE')}
                      </span>
                      {rel.isLive && (
                        <span className="bg-[#ffebec] text-[#990000] border border-[#f5c6cb] px-1.5 py-0.5 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#990000] animate-pulse"></span>
                          <span>LIVE WIRE</span>
                        </span>
                      )}
                    </div>
                    <span className="text-[#777777]">{rel.date}</span>
                  </div>

                  <h3 className="text-[18px] sm:text-[21px] font-serif-editorial font-bold leading-snug text-[#111111] mb-3 group-hover:text-[#990000] transition-colors">
                    {rel.title}
                  </h3>

                  <p className="text-[13.5px] font-serif-editorial text-[#333333] leading-relaxed mb-4 line-clamp-3">
                    {rel.summary?.replace(/<[^>]*>/g, '')}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#e5e1d3] flex items-center justify-between gap-2">
                  <span className="text-[10px] font-sans-editorial text-[#111111] uppercase font-bold truncate max-w-[200px] bg-[#f5f4ea] px-2 py-0.5 border border-[#dcd8cb] inline-flex items-center gap-1">
                    <span className="text-[#059669]">✓</span>
                    <span>{rel.source || hostname}</span>
                  </span>
                  <a
                    href={rel.url || agency.newsUrl || agency.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-sans-editorial font-bold text-[#111111] hover:text-[#ffc500] hover:bg-[#111111] px-2.5 py-1 border border-[#111111] transition-all inline-flex items-center gap-1 shrink-0"
                  >
                    <span>Read Full Report</span>
                    <span>↗</span>
                  </a>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="bg-white border-2 border-[#111111] p-8 text-center mb-12 shadow-[4px_4px_0px_#111111]">
            <div className="text-3xl mb-2">{agency.flag}</div>
            <h3 className="text-[20px] font-serif-editorial font-bold text-[#111111] mb-2">
              No matching updates found
            </h3>
            <p className="text-xs sm:text-sm font-serif-editorial text-[#555555] max-w-md mx-auto mb-4">
              Try changing your search query or view all releases directly on the verified official newsroom.
            </p>
            <div className="flex justify-center gap-2">
              {newsSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setNewsSearch('')
                    setActiveCategory('ALL')
                  }}
                  className="bg-[#111111] text-[#ffc500] px-3 py-1.5 text-xs font-sans-editorial font-bold uppercase"
                >
                  Clear Filters
                </button>
              )}
              {agency.newsUrl && (
                <a
                  href={agency.newsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white border border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-[#ffc500] px-3 py-1.5 text-xs font-sans-editorial font-bold uppercase inline-flex items-center gap-1"
                >
                  <span>Open {agency.acronym} Newsroom ↗</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Astrophysics & Space Science Research Papers Involving Agency */}
        <div className="border-t-2 border-[#111111] pt-10 mb-14">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-2 border-b border-[#dcd8cb] gap-2">
            <div>
              <span className="text-[10px] font-sans-editorial font-bold uppercase tracking-widest text-[#777777]">
                SCIENTIFIC ARCHIVE • NASA ADS / ARXIV
              </span>
              <h3 className="text-[22px] font-serif-editorial font-bold text-[#111111]">
                Scientific Research Papers & Technical Manuscripts
              </h3>
            </div>
            <span className="text-[10.5px] font-sans-editorial text-[#666666]">
              Peer-reviewed astrophysics & aerospace engineering preprints
            </span>
          </div>

          {loadingPapers ? (
            <div className="text-xs font-serif-editorial text-[#777777] italic py-6 text-center">
              Loading research index...
            </div>
          ) : papers.length === 0 ? (
            <div className="bg-white border border-[#dcd8cb] p-6 text-center text-xs font-serif-editorial text-[#666666]">
              Aerospace preprints and mission data papers are regularly cataloged via NASA ADS and arXiv.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {papers.map((paper, idx) => (
                <div
                  key={paper.id || idx}
                  className="bg-white border border-[#111111] p-4 flex flex-col justify-between hover:bg-[#f7f6ec] transition-colors"
                >
                  <div>
                    <div className="text-[9.5px] font-sans-editorial font-bold uppercase text-[#777777] mb-1">
                      {paper.source || 'NASA ADS / arXiv'} • {paper.published_date || paper.publishedAt?.slice(0, 10) || 'Recent'}
                    </div>
                    <h4 className="text-[13.5px] font-serif-editorial font-bold text-[#111111] leading-snug line-clamp-2 mb-2">
                      {paper.title}
                    </h4>
                    <p className="text-[11.5px] font-serif-editorial text-[#555555] line-clamp-3 leading-relaxed">
                      {paper.abstract || 'Astrophysics research paper and technical report.'}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-[#e5e1d3] flex justify-between items-center text-[10px] font-sans-editorial font-bold">
                    <span className="text-[#888884]">{paper.category || 'Spaceflight'}</span>
                    <a
                      href={paper.url || paper.pdf_url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#111111] hover:text-[#ffc500] hover:bg-[#111111] px-2 py-0.5 transition-colors"
                    >
                      READ PAPER ↗
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Peer Explorer */}
        {siblingAgencies.length > 0 && (
          <div className="border-t-2 border-[#111111] pt-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-sans-editorial font-bold uppercase tracking-widest text-[#777777]">
                {isStartup ? 'MORE INDIAN PRIVATE SPACE STARTUPS' : `MORE AGENCIES IN ${agency.region.toUpperCase()}`}
              </span>
              <Link
                href="/agencies"
                className="text-[10.5px] font-sans-editorial font-bold text-[#111111] hover:underline"
              >
                VIEW ALL {SPACE_AGENCIES.length} ORGANIZATIONS →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
              {siblingAgencies.map((sib) => (
                <Link
                  key={sib.slug}
                  href={`/agency/${sib.slug}`}
                  className="bg-white border border-[#dcd8cb] hover:border-[#111111] p-3 text-center transition-all hover:bg-[#111111] group"
                >
                  <div className="text-xl mb-1">{sib.flag}</div>
                  <div className="text-xs font-sans-editorial font-bold text-[#111111] group-hover:text-[#ffc500] transition-colors truncate">
                    {sib.acronym}
                  </div>
                  <div className="text-[10px] font-serif-editorial text-[#777777] group-hover:text-[#cccccc] transition-colors truncate">
                    {sib.agencyType === 'Indian Private Startup' ? sib.headquarters?.split(',')[0] || 'India' : sib.country}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Release Detail Modal if clicked */}
      {selectedRelease && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#fdfcf4] border-2 border-[#111111] max-w-2xl w-full p-6 shadow-[10px_10px_0px_#111111]">
            <div className="flex items-center justify-between border-b border-[#111111] pb-3 mb-4">
              <span className="bg-[#111111] text-[#ffc500] text-[10px] font-sans-editorial font-bold uppercase px-2 py-0.5">
                {isStartup ? 'STARTUP COMMUNIQUÉ' : 'OFFICIAL COMMUNIQUÉ'}
              </span>
              <button
                onClick={() => setSelectedRelease(null)}
                className="w-7 h-7 flex items-center justify-center border border-[#111111] bg-white hover:bg-[#111111] hover:text-white transition-colors text-xs font-bold"
              >
                ✕
              </button>
            </div>
            <h3 className="text-xl font-serif-editorial font-bold text-[#111111] mb-3">
              {selectedRelease.title}
            </h3>
            <div className="text-xs font-sans-editorial text-[#777777] mb-4">
              {selectedRelease.date} • Published by {agency.name} ({hostname})
            </div>
            <p className="text-sm font-serif-editorial text-[#333333] leading-relaxed mb-6">
              {selectedRelease.summary}
            </p>
            <div className="flex justify-end gap-3 pt-3 border-t border-[#dcd8cb]">
              <a
                href={selectedRelease.url || agency.newsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#111111] text-[#ffc500] hover:bg-[#333] text-xs font-sans-editorial font-bold uppercase px-4 py-2"
              >
                Open Official Source on {hostname} ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

