'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  SPACE_AGENCIES,
  REGIONS,
  Region,
  getGovernmentAgencies,
  getIndianStartups,
} from '@/lib/agencies'

type SubsectionFilter = 'all' | 'government' | 'startups'

export default function AgenciesDirectoryClient() {
  const [activeSubsection, setActiveSubsection] = useState<SubsectionFilter>('government')
  const [selectedRegion, setSelectedRegion] = useState<Region | 'All'>('All')
  const [searchQuery, setSearchQuery] = useState('')

  const govAgencies = useMemo(() => getGovernmentAgencies(), [])
  const indianStartups = useMemo(() => getIndianStartups(), [])

  const filteredAgencies = useMemo(() => {
    let pool = SPACE_AGENCIES
    if (activeSubsection === 'government') {
      pool = govAgencies
    } else if (activeSubsection === 'startups') {
      pool = indianStartups
    }

    return pool.filter((agency) => {
      const matchesRegion =
        activeSubsection === 'startups' ||
        selectedRegion === 'All' ||
        agency.region === selectedRegion
      const query = searchQuery.toLowerCase().trim()
      const matchesQuery =
        !query ||
        agency.acronym.toLowerCase().includes(query) ||
        agency.name.toLowerCase().includes(query) ||
        agency.country.toLowerCase().includes(query) ||
        agency.region.toLowerCase().includes(query) ||
        agency.description.toLowerCase().includes(query) ||
        (agency.focus && agency.focus.toLowerCase().includes(query))

      return matchesRegion && matchesQuery
    })
  }, [activeSubsection, selectedRegion, searchQuery, govAgencies, indianStartups])

  return (
    <div className="bg-[#fdfcf4] text-[#111111] min-h-screen">
      {/* Top Breadcrumb */}
      <div className="border-b border-[#dcd8cb] bg-[#f7f6ec] px-4 sm:px-6 lg:px-10 py-2.5">
        <div className="max-w-[1340px] mx-auto flex items-center gap-2 text-[11px] font-sans-editorial font-bold uppercase tracking-wider">
          <Link href="/" className="text-[#777777] hover:text-[#111111] transition-colors">
            Front Page
          </Link>
          <span className="text-[#888884]">/</span>
          <span className="text-[#111111]">Space Agencies</span>
          <span className="text-[#888884]">/</span>
          <span className="text-[#111111]">
            {activeSubsection === 'startups'
              ? 'Indian Private Startups'
              : activeSubsection === 'government'
              ? 'Government Agencies'
              : 'All Space Agencies & Startups'}
          </span>
        </div>
      </div>

      {/* Directory Grand Header */}
      <section className="border-b-2 border-[#111111] px-4 sm:px-6 lg:px-10 py-10 sm:py-14 bg-white">
        <div className="max-w-[1340px] mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="bg-[#111111] text-[#ffc500] text-[10px] font-sans-editorial font-bold uppercase tracking-widest px-2.5 py-1">
                  GLOBAL SPACE REGISTRY
                </span>
                <span className="border border-[#dcd8cb] text-[#555555] text-[10px] font-sans-editorial font-bold uppercase tracking-wider px-2 py-0.5">
                  {activeSubsection === 'startups'
                    ? 'NEWSPACE INDIA • 17 STARTUPS'
                    : activeSubsection === 'government'
                    ? '78 NATIONAL AUTHORITIES'
                    : '95 SPACE ORGANIZATIONS'}
                </span>
              </div>

              <h1 className="text-[36px] sm:text-[50px] lg:text-[60px] font-serif-editorial font-normal leading-[1.04] text-[#111111] tracking-[-0.01em] mb-3">
                {activeSubsection === 'startups'
                  ? 'Indian Private Space Startups'
                  : activeSubsection === 'government'
                  ? 'Government Space Agencies'
                  : 'World Space Agencies & NewSpace Startups'}
              </h1>
              <p className="text-[15px] sm:text-[17px] font-serif-editorial text-[#444444] leading-relaxed">
                {activeSubsection === 'startups'
                  ? 'Accredited registry of India’s pioneering private aerospace and satellite startups leading orbital rocketry, 3D-printed semi-cryo engines, hyperspectral constellations, space situational awareness, and in-orbit refuelling.'
                  : `Comprehensive directory and official newsroom access for ${
                      activeSubsection === 'government' ? '78' : '95'
                    } national space authorities, space programs, and intergovernmental bodies worldwide.`}
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-4 bg-[#fdfcf4] border border-[#111111] p-4 sm:p-5 shrink-0 shadow-xs">
              <div className="text-center px-3 border-r border-[#dcd8cb]">
                <div className="text-[28px] font-serif-editorial font-normal leading-none text-[#111111]">
                  {govAgencies.length}
                </div>
                <div className="text-[9px] font-sans-editorial font-bold uppercase tracking-wider text-[#777777] mt-1">
                  GOV AGENCIES
                </div>
              </div>
              <div className="text-center px-3 border-r border-[#dcd8cb]">
                <div className="text-[28px] font-serif-editorial font-normal leading-none text-[#111111]">
                  {indianStartups.length}
                </div>
                <div className="text-[9px] font-sans-editorial font-bold uppercase tracking-wider text-[#777777] mt-1">
                  INDIAN STARTUPS
                </div>
              </div>
              <div className="text-center px-3">
                <div className="text-[28px] font-serif-editorial font-normal leading-none text-[#111111]">
                  {REGIONS.length}
                </div>
                <div className="text-[9px] font-sans-editorial font-bold uppercase tracking-wider text-[#777777] mt-1">
                  REGIONS
                </div>
              </div>
            </div>
          </div>

          {/* Subsection Filter Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2 mt-8 pt-6 border-t border-[#eae8dc]">
            <button
              onClick={() => {
                setActiveSubsection('government')
                setSelectedRegion('All')
              }}
              className={`px-4 py-2 text-[11px] font-sans-editorial font-bold uppercase tracking-wider transition-all border ${
                activeSubsection === 'government'
                  ? 'bg-[#111111] text-[#ffc500] border-[#111111] shadow-2xs'
                  : 'bg-white text-[#111111] border-[#dcd8cb] hover:border-[#111111]'
              }`}
            >
              🏛️ GOVERNMENT AGENCIES ({govAgencies.length})
            </button>

            <button
              onClick={() => {
                setActiveSubsection('startups')
                setSelectedRegion('All')
              }}
              className={`px-4 py-2 text-[11px] font-sans-editorial font-bold uppercase tracking-wider transition-all border ${
                activeSubsection === 'startups'
                  ? 'bg-[#111111] text-[#ffc500] border-[#111111] shadow-2xs'
                  : 'bg-white text-[#111111] border-[#dcd8cb] hover:border-[#111111]'
              }`}
            >
              🇮🇳 INDIAN PRIVATE STARTUPS ({indianStartups.length})
            </button>

            <button
              onClick={() => {
                setActiveSubsection('all')
                setSelectedRegion('All')
              }}
              className={`px-4 py-2 text-[11px] font-sans-editorial font-bold uppercase tracking-wider transition-all border ${
                activeSubsection === 'all'
                  ? 'bg-[#111111] text-[#ffc500] border-[#111111]'
                  : 'bg-white text-[#555555] border-[#dcd8cb] hover:border-[#111111]'
              }`}
            >
              ALL ORGANIZATIONS ({SPACE_AGENCIES.length})
            </button>
          </div>
        </div>
      </section>

      {/* Filter and Search Controls Bar */}
      <section className="border-b border-[#dcd8cb] bg-[#f7f6ec] px-4 sm:px-6 lg:px-10 py-4 sticky top-[41px] z-30 shadow-xs">
        <div className="max-w-[1340px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Region Tabs (if government or all active) */}
          {activeSubsection !== 'startups' ? (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none text-[11px] font-sans-editorial font-bold uppercase tracking-wider">
              <button
                onClick={() => setSelectedRegion('All')}
                className={`px-3 py-1.5 border transition-all whitespace-nowrap ${
                  selectedRegion === 'All'
                    ? 'bg-[#111111] text-[#ffc500] border-[#111111]'
                    : 'bg-white text-[#444444] border-[#dcd8cb] hover:border-[#111111]'
                }`}
              >
                ALL ({activeSubsection === 'government' ? govAgencies.length : SPACE_AGENCIES.length})
              </button>
              {REGIONS.map((region) => {
                const count = (activeSubsection === 'government' ? govAgencies : SPACE_AGENCIES).filter(
                  (a) => a.region === region
                ).length
                return (
                  <button
                    key={region}
                    onClick={() => setSelectedRegion(region)}
                    className={`px-3 py-1.5 border transition-all whitespace-nowrap ${
                      selectedRegion === region
                        ? 'bg-[#111111] text-[#ffc500] border-[#111111]'
                        : 'bg-white text-[#444444] border-[#dcd8cb] hover:border-[#111111]'
                    }`}
                  >
                    {region.toUpperCase()} ({count})
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="text-[11px] font-sans-editorial font-bold text-[#444444] uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#138808]" />
              <span>17 PIONEERING INDIAN NEWSPACE COMPANIES (AUTONOMOUS / IN-SPACe REGISTERED)</span>
            </div>
          )}

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder={
                activeSubsection === 'startups'
                  ? 'Search startup, propulsion, satellites...'
                  : 'Search agency, country, acronym...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-white border border-[#111111] text-xs font-serif-editorial text-[#111] placeholder:text-[#888] focus:outline-none"
            />
            <svg
              className="w-3.5 h-3.5 text-[#888] absolute left-3 top-1/2 -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#888] hover:text-[#111]"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Directory Grid */}
      <section className="px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
        <div className="max-w-[1340px] mx-auto">
          {filteredAgencies.length === 0 ? (
            <div className="text-center py-20 bg-white border border-[#dcd8cb]">
              <p className="font-serif-editorial text-lg text-[#555] mb-2">
                No organizations found matching &ldquo;{searchQuery}&rdquo;.
              </p>
              <button
                onClick={() => {
                  setSelectedRegion('All')
                  setSearchQuery('')
                }}
                className="mt-3 px-4 py-2 bg-[#111111] text-white text-[11px] font-sans-editorial font-bold uppercase tracking-wider hover:bg-[#333]"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAgencies.map((agency) => (
                <Link
                  key={agency.slug}
                  href={`/agency/${agency.slug}`}
                  className="group flex flex-col justify-between bg-white border border-[#dcd8cb] p-6 hover:border-[#111111] hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)] transition-all duration-200"
                >
                  <div>
                    {/* Header: Flag, Region / Category */}
                    <div className="flex items-center justify-between border-b border-[#eae8dc] pb-3 mb-3 text-[10.5px] font-sans-editorial">
                      <div className="flex items-center gap-2 font-bold uppercase text-[#777777]">
                        <span className="text-lg leading-none">{agency.flag}</span>
                        <span>{agency.country}</span>
                      </div>
                      <span
                        className={`font-bold uppercase tracking-wider px-2 py-0.5 border ${
                          agency.agencyType === 'Indian Private Startup'
                            ? 'bg-[#111111] text-[#ffc500] border-[#111111]'
                            : 'bg-[#f7f6ec] text-[#111111] border-[#dcd8cb]'
                        }`}
                      >
                        {agency.agencyType === 'Indian Private Startup'
                          ? 'NEWSPACE STARTUP'
                          : agency.region}
                      </span>
                    </div>

                    {/* Acronym and Name */}
                    <h2 className="text-[22px] sm:text-[24px] font-serif-editorial font-normal text-[#111111] leading-tight group-hover:text-[#111111] mb-1 flex items-center justify-between">
                      <span className="font-bold">{agency.acronym}</span>
                      <span className="text-base text-[#888884] group-hover:text-[#111111] group-hover:translate-x-1 transition-transform">
                        →
                      </span>
                    </h2>
                    <p className="text-[13px] font-serif-editorial font-medium text-[#444444] mb-3 line-clamp-2 italic">
                      {agency.name}
                    </p>

                    {/* Startup Specialization Focus */}
                    {agency.focus && (
                      <div className="mb-3 p-2 bg-[#fdfcf4] border border-[#dcd8cb] text-[11px] font-sans-editorial font-bold text-[#111111]">
                        <span className="text-[#ff9900] mr-1">⚡ FOCUS:</span> {agency.focus}
                      </div>
                    )}

                    {/* Description preview */}
                    <p className="text-[12.5px] font-serif-editorial text-[#555555] leading-relaxed line-clamp-3 mb-4">
                      {agency.description}
                    </p>
                  </div>

                  {/* Footer Action */}
                  <div className="pt-3 border-t border-[#eae8dc] flex items-center justify-between text-[10px] font-sans-editorial font-bold uppercase tracking-wider text-[#111111]">
                    <span className="text-[#888884]">
                      {agency.headquarters || (agency.established ? `Est. ${agency.established}` : 'Active')}
                    </span>
                    <span className="group-hover:text-[#ffc500] group-hover:bg-[#111111] px-2 py-0.5 transition-colors">
                      OPEN OFFICIAL WIRE →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

