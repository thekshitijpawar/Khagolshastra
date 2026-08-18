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
  const [selectedRelease, setSelectedRelease] = useState<OfficialRelease | null>(null)

  const isStartup = agency.agencyType === 'Indian Private Startup'

  useEffect(() => {
    async function loadAgencyPapers() {
      setLoadingPapers(true)
      try {
        const primaryTerm = agency.acronym.split('/')[0].split(' ')[0]
        const papersRes = await fetchResearchPapers({
          query: `${primaryTerm} ${agency.country}`,
          size: 6,
        })
        setPapers(papersRes.items || [])
      } catch (err) {
        console.error('Error loading agency papers', err)
      } finally {
        setLoadingPapers(false)
      }
    }

    loadAgencyPapers()
  }, [agency])

  const siblingAgencies = isStartup
    ? getIndianStartups().filter((a) => a.slug !== agency.slug).slice(0, 6)
    : SPACE_AGENCIES.filter(
        (a) => a.region === agency.region && a.slug !== agency.slug && a.agencyType !== 'Indian Private Startup'
      ).slice(0, 6)

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
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b-2 border-[#111111] pb-3 mb-8 gap-3">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-sans-editorial font-bold uppercase tracking-widest text-[#111111]">
              <span className="bg-[#ffc500] text-[#111111] px-2 py-0.5">OFFICIAL SOURCE VERIFIED</span>
              <span>•</span>
              <span className="text-[#777777]">
                {isStartup ? 'AUTHENTIC COMPANY NEWSROOM' : 'DIRECT AGENCY PRESS RELEASES'}
              </span>
            </div>
            <h2 className="text-[26px] sm:text-[34px] font-serif-editorial font-normal text-[#111111] mt-1">
              {agency.acronym} Official Updates & Press Releases
            </h2>
            <p className="text-xs sm:text-sm font-serif-editorial text-[#555555] mt-0.5 italic">
              Official press releases, mission milestones, and technical communiqués published directly on {hostname}.
            </p>
          </div>

          {agency.newsUrl && (
            <a
              href={agency.newsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-sans-editorial font-bold text-[#111111] hover:text-[#ffc500] hover:bg-[#111111] border border-[#111111] px-3 py-1.5 transition-colors shrink-0 inline-flex items-center gap-1.5"
            >
              <span>OPEN LIVE {agency.acronym} NEWSROOM</span>
              <span>↗</span>
            </a>
          )}
        </div>

        {/* Official Releases Grid */}
        {releases.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {releases.map((rel) => (
              <article
                key={rel.id}
                className="bg-white border-2 border-[#111111] p-6 flex flex-col justify-between hover:shadow-[6px_6px_0px_#111111] transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-[#e5e1d3] pb-2 mb-3 text-[10px] font-sans-editorial font-bold uppercase tracking-wider">
                    <span className="bg-[#111111] text-[#ffc500] px-2 py-0.5">
                      {rel.category || (isStartup ? 'STARTUP MILESTONE' : 'OFFICIAL PRESS RELEASE')}
                    </span>
                    <span className="text-[#777777]">{rel.date} • {hostname}</span>
                  </div>

                  <h3 className="text-[19px] sm:text-[22px] font-serif-editorial font-bold leading-snug text-[#111111] mb-3 group-hover:text-[#990000] transition-colors">
                    {rel.title}
                  </h3>

                  <p className="text-[13.5px] font-serif-editorial text-[#444444] leading-relaxed mb-4">
                    {rel.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#e5e1d3] flex items-center justify-between">
                  <span className="text-[10px] font-sans-editorial text-[#888884] uppercase font-semibold">
                    SOURCE: {hostname}
                  </span>
                  <a
                    href={rel.url || agency.newsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-sans-editorial font-bold text-[#111111] hover:text-[#ffc500] hover:bg-[#111111] px-2.5 py-1 border border-[#111111] transition-all inline-flex items-center gap-1"
                  >
                    <span>Read on {agency.acronym} Portal</span>
                    <span>↗</span>
                  </a>
                </div>
              </article>
            ))}
          </div>
        ) : (
          /* Clean Official Newsroom Feed Banner */
          <div className="bg-white border-2 border-[#111111] p-8 text-center mb-12 shadow-[4px_4px_0px_#111111]">
            <div className="text-3xl mb-2">{agency.flag}</div>
            <h3 className="text-[22px] font-serif-editorial font-bold text-[#111111] mb-2">
              {agency.name} Official Newsroom
            </h3>
            <p className="text-sm font-serif-editorial text-[#555555] max-w-xl mx-auto mb-5 leading-relaxed">
              Official press releases, product updates, and technical mission briefings are published directly on the {agency.name} official domain ({hostname}).
            </p>
            {agency.newsUrl ? (
              <a
                href={agency.newsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#111111] text-[#ffc500] hover:bg-[#333333] text-xs font-sans-editorial font-bold uppercase tracking-wider px-5 py-3 transition-all"
              >
                <span>Browse Live {agency.acronym} Official Updates on {hostname}</span>
                <span className="text-sm">↗</span>
              </a>
            ) : (
              <a
                href={agency.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#111111] text-[#ffc500] hover:bg-[#333333] text-xs font-sans-editorial font-bold uppercase tracking-wider px-5 py-3 transition-all"
              >
                <span>Visit {agency.acronym} Official Website</span>
                <span className="text-sm">↗</span>
              </a>
            )}
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

