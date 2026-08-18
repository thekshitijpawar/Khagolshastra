'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { SpaceAgency, SPACE_AGENCIES } from '@/lib/agencies'
import { Article, ResearchPaper } from '@/types'
import { fetchArticles, fetchResearchPapers } from '@/lib/api'
import ArticleCard from '@/components/ArticleCard'
import ArticleModal from '@/components/ArticleModal'

interface AgencyClientProps {
  agency: SpaceAgency
}

export default function AgencyClient({ agency }: AgencyClientProps) {
  const [articles, setArticles] = useState<Article[]>([])
  const [papers, setPapers] = useState<ResearchPaper[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [activeTab, setActiveTab] = useState<'news' | 'papers'>('news')

  useEffect(() => {
    async function loadAgencyContent() {
      setLoading(true)
      try {
        // Search articles with agency acronym and name
        const primaryTerm = agency.acronym.split('/')[0].split(' ')[0]
        const newsRes = await fetchArticles({
          query: primaryTerm,
          limit: 30,
        })

        // If specific keyword yielded few results, fallback to broader query or searchTerms
        let finalArticles = newsRes.items || []
        if (finalArticles.length < 3) {
          const allRes = await fetchArticles({ limit: 60 })
          const matched = (allRes.items || []).filter((a) => {
            const full = `${a.title} ${a.summary} ${a.content || ''}`.toLowerCase()
            return agency.searchTerms.some((t) => full.includes(t.toLowerCase()))
          })
          if (matched.length > 0) {
            finalArticles = matched
          } else {
            // General spaceflight and exploration dispatches
            finalArticles = allRes.items.slice(0, 12)
          }
        }
        setArticles(finalArticles)

        // Load research papers matching agency
        try {
          const papersRes = await fetchResearchPapers({
            query: `${agency.acronym} astrophysics space`,
            size: 8,
          })
          setPapers(papersRes.items || [])
        } catch {
          // Handled silently
        }
      } catch (err) {
        console.error('Error loading agency data', err)
      } finally {
        setLoading(false)
      }
    }

    loadAgencyContent()
  }, [agency])

  const siblingAgencies = SPACE_AGENCIES.filter(
    (a) => a.region === agency.region && a.slug !== agency.slug
  ).slice(0, 6)

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
            <span className="text-[#111111]">{agency.region}</span>
            <span className="text-[#888884]">/</span>
            <span className="text-[#111111]">{agency.acronym}</span>
          </div>

          <Link
            href="/agencies"
            className="text-[10px] bg-[#111111] text-[#ffc500] px-2.5 py-1 hover:bg-[#333] transition-colors hidden sm:inline-block"
          >
            VIEW ALL 53 AGENCIES →
          </Link>
        </div>
      </div>

      {/* Agency Grand Dossier Hero */}
      <section className="border-b-2 border-[#111111] px-4 sm:px-6 lg:px-10 py-8 sm:py-12 bg-white">
        <div className="max-w-[1340px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Main Details (8 cols) */}
            <div className="lg:col-span-8">
              {/* Eyebrow badge */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-xl leading-none">{agency.flag}</span>
                <span className="bg-[#111111] text-[#ffc500] text-[10px] font-sans-editorial font-bold uppercase tracking-widest px-2 py-0.5">
                  GOVERNMENT SPACE AGENCY
                </span>
                <span className="border border-[#dcd8cb] text-[#555555] text-[10px] font-sans-editorial font-bold uppercase tracking-wider px-2 py-0.5">
                  {agency.region}
                </span>
                <span className="border border-[#dcd8cb] text-[#555555] text-[10px] font-sans-editorial font-bold uppercase tracking-wider px-2 py-0.5">
                  {agency.country}
                </span>
              </div>

              {/* Acronym and Full Name */}
              <h1 className="text-[38px] sm:text-[52px] lg:text-[62px] font-serif-editorial font-normal leading-[1.04] text-[#111111] tracking-[-0.01em] mb-2">
                {agency.acronym}
              </h1>
              <p className="text-[18px] sm:text-[22px] font-serif-editorial text-[#444444] leading-snug mb-5 italic">
                {agency.name}
              </p>

              {/* Agency Narrative Description */}
              <p className="text-[15px] sm:text-[16px] font-serif-editorial text-[#222222] leading-relaxed max-w-3xl mb-6">
                {agency.description}
              </p>

              {/* Key Missions Pills */}
              {agency.keyMissions && agency.keyMissions.length > 0 && (
                <div className="pt-4 border-t border-[#eae8dc]">
                  <div className="text-[10px] font-sans-editorial font-bold uppercase tracking-widest text-[#888884] mb-2">
                    FLAGSHIP MISSIONS & STRATEGIC FOCUS
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {agency.keyMissions.map((m) => (
                      <span
                        key={m}
                        className="bg-[#f7f6ec] border border-[#dcd8cb] text-[#111111] text-[11px] font-sans-editorial font-semibold px-2.5 py-1"
                      >
                        ⚡ {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Facts Card (4 cols) */}
            <div className="lg:col-span-4 bg-[#fdfcf4] border border-[#111111] p-5 sm:p-6 shadow-xs">
              <div className="border-b border-[#111111] pb-2.5 mb-4 flex items-center justify-between">
                <span className="text-[11px] font-sans-editorial font-bold uppercase tracking-widest text-[#111111]">
                  OFFICIAL DOSSIER
                </span>
                <span className="text-sm">{agency.flag}</span>
              </div>

              <div className="space-y-3.5 text-[12px] font-sans-editorial">
                <div>
                  <div className="text-[9.5px] font-bold text-[#888884] uppercase tracking-wider">
                    HEADQUARTERS
                  </div>
                  <div className="font-bold text-[#111111] text-[13px] mt-0.5">
                    {agency.headquarters || `${agency.country}`}
                  </div>
                </div>

                {agency.established && (
                  <div>
                    <div className="text-[9.5px] font-bold text-[#888884] uppercase tracking-wider">
                      ESTABLISHED
                    </div>
                    <div className="font-bold text-[#111111] text-[13px] mt-0.5">
                      {agency.established}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-[9.5px] font-bold text-[#888884] uppercase tracking-wider">
                    JURISDICTION & CONTINENT
                  </div>
                  <div className="font-bold text-[#111111] text-[13px] mt-0.5">
                    {agency.country} • {agency.region}
                  </div>
                </div>

                {agency.website && (
                  <div className="pt-3 border-t border-[#dcd8cb]">
                    <a
                      href={agency.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 bg-[#111111] hover:bg-[#ffc500] hover:text-[#111111] text-white text-[11px] font-sans-editorial font-bold uppercase tracking-wider py-2.5 px-4 transition-colors"
                    >
                      <span>OFFICIAL AGENCY PORTAL</span>
                      <span>↗</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Feed Section */}
      <section className="px-4 sm:px-6 lg:px-10 py-8 sm:py-12">
        <div className="max-w-[1340px] mx-auto">
          {/* Section Header & Sub-tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#111111] pb-3 mb-8 gap-4">
            <div className="flex items-center gap-4">
              <h2 className="text-[22px] sm:text-[26px] font-serif-editorial font-normal text-[#111111]">
                {agency.acronym} Intelligence & Dispatches
              </h2>
              <span className="bg-[#111111] text-white text-[10px] font-sans-editorial font-bold px-2 py-0.5">
                {articles.length} DISPATCHES
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-sans-editorial font-bold uppercase tracking-wider">
              <button
                onClick={() => setActiveTab('news')}
                className={`px-3.5 py-1.5 border transition-colors ${
                  activeTab === 'news'
                    ? 'bg-[#111111] text-[#ffc500] border-[#111111]'
                    : 'bg-white text-[#555] border-[#dcd8cb] hover:border-[#111111]'
                }`}
              >
                NEWS DISPATCHES ({articles.length})
              </button>
              {papers.length > 0 && (
                <button
                  onClick={() => setActiveTab('papers')}
                  className={`px-3.5 py-1.5 border transition-colors ${
                    activeTab === 'papers'
                      ? 'bg-[#111111] text-[#ffc500] border-[#111111]'
                      : 'bg-white text-[#555] border-[#dcd8cb] hover:border-[#111111]'
                  }`}
                >
                  SCIENTIFIC PAPERS ({papers.length})
                </button>
              )}
            </div>
          </div>

          {/* Main Grid: Articles + Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Articles Column (8 cols) */}
            <div className="lg:col-span-8">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="border border-[#dcd8cb] bg-white p-5 animate-pulse">
                      <div className="aspect-[16/10] bg-[#eae8dc] mb-4" />
                      <div className="h-4 bg-[#eae8dc] w-3/4 mb-2" />
                      <div className="h-3 bg-[#eae8dc] w-full mb-1" />
                      <div className="h-3 bg-[#eae8dc] w-2/3" />
                    </div>
                  ))}
                </div>
              ) : activeTab === 'news' ? (
                articles.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {articles.map((art, idx) => (
                      <ArticleCard
                        key={art.id || idx}
                        article={art}
                        index={idx}
                        variant={idx === 0 ? 'stacked' : 'compact'}
                        onClick={() => setSelectedArticle(art)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white border border-[#dcd8cb] p-8">
                    <p className="font-serif-editorial text-lg text-[#555] mb-4">
                      No recent dispatches matching &ldquo;{agency.acronym}&rdquo; at this moment.
                    </p>
                    <Link
                      href="/articles"
                      className="inline-block bg-[#111111] text-white px-5 py-2.5 text-[11px] font-sans-editorial font-bold uppercase tracking-wider hover:bg-[#333]"
                    >
                      Browse All News Headlines →
                    </Link>
                  </div>
                )
              ) : (
                /* Research Papers Tab */
                <div className="space-y-4">
                  {papers.map((p) => (
                    <div
                      key={p.id}
                      className="bg-white border border-[#dcd8cb] p-5 hover:border-[#111111] transition-colors"
                    >
                      <div className="flex items-center gap-2 text-[10px] font-sans-editorial font-bold uppercase text-[#888884] mb-1.5">
                        <span className="text-[#111111] bg-[#f7f6ec] border border-[#dcd8cb] px-1.5 py-0.5">
                          {p.source || p.source_key || 'arXiv'}
                        </span>
                        <span>•</span>
                        <span>{p.published_date || p.publishedAt || 'Preprint'}</span>
                        {p.category && (
                          <>
                            <span>•</span>
                            <span className="text-[#555]">{p.category}</span>
                          </>
                        )}
                      </div>
                      <h3 className="text-[17px] font-serif-editorial font-bold text-[#111111] leading-snug mb-2">
                        {p.title}
                      </h3>
                      <p className="text-[13px] font-serif-editorial text-[#444444] leading-relaxed mb-3 line-clamp-3">
                        {p.abstract}
                      </p>
                      <div className="flex items-center justify-between pt-3 border-t border-[#eae8dc]">
                        <span className="text-[11px] font-serif-editorial italic text-[#777]">
                          {(p.authors || []).slice(0, 3).join(', ')} {(p.authors || []).length > 3 && 'et al.'}
                        </span>
                        {(p.url || p.pdf_url) && (
                          <a
                            href={p.url || p.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-sans-editorial font-bold uppercase tracking-wider text-[#111111] hover:underline"
                          >
                            Read Paper ↗
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar: Regional Peers & Explorer (4 cols) */}
            <div className="lg:col-span-4 space-y-8">
              {/* Regional Peers Box */}
              <div className="bg-white border border-[#dcd8cb] p-5">
                <div className="border-b border-[#111111] pb-2 mb-4">
                  <div className="text-[9.5px] font-sans-editorial font-bold uppercase tracking-widest text-[#888884]">
                    REGIONAL EXPLORATION
                  </div>
                  <h3 className="text-[16px] font-serif-editorial font-bold text-[#111111]">
                    Other Agencies in {agency.region}
                  </h3>
                </div>

                <div className="space-y-2.5">
                  {siblingAgencies.map((peer) => (
                    <Link
                      key={peer.slug}
                      href={`/agency/${peer.slug}`}
                      className="group flex items-center justify-between p-2.5 bg-[#fdfcf4] hover:bg-[#111111] border border-[#dcd8cb] hover:border-[#111111] transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-base shrink-0">{peer.flag}</span>
                        <div className="min-w-0">
                          <div className="text-[12px] font-sans-editorial font-bold text-[#111111] group-hover:text-[#ffc500] transition-colors truncate">
                            {peer.acronym}
                          </div>
                          <div className="text-[10.5px] font-serif-editorial text-[#666666] group-hover:text-[#dddddd] transition-colors truncate">
                            {peer.country}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-[#888884] group-hover:text-[#ffc500] shrink-0 font-bold">
                        →
                      </span>
                    </Link>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-[#eae8dc] text-center">
                  <Link
                    href="/agencies"
                    className="text-[10px] font-sans-editorial font-bold uppercase tracking-widest text-[#111111] hover:underline"
                  >
                    View All 53 Global Space Agencies →
                  </Link>
                </div>
              </div>

              {/* Research Archive Banner */}
              <div className="bg-[#111111] text-white p-6 border border-[#333]">
                <div className="text-[9.5px] font-sans-editorial font-bold uppercase tracking-widest text-[#ffc500] mb-2">
                  ACADEMIC PREPRINTS & ADS
                </div>
                <h3 className="text-[18px] font-serif-editorial font-normal leading-tight text-white mb-2">
                  NASA/ADS & arXiv Index
                </h3>
                <p className="text-[12.5px] font-serif-editorial text-[#cccccc] leading-relaxed mb-4">
                  Search millions of astrophysics publications, peer-reviewed European astronomical journals, and observatory telemetry papers.
                </p>
                <Link
                  href={`/research?query=${encodeURIComponent(agency.acronym)}`}
                  className="inline-block w-full text-center bg-[#ffc500] hover:bg-white text-[#111111] font-sans-editorial text-[10.5px] font-bold uppercase tracking-widest py-2.5 px-4 transition-colors"
                >
                  SEARCH {agency.acronym} PAPERS →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Article Detail Modal */}
      {selectedArticle && (
        <ArticleModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}
    </div>
  )
}
