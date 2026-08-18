'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { SPACE_AGENCIES, REGIONS, Region } from '@/lib/agencies'

export default function AgenciesDirectoryClient() {
  const [selectedRegion, setSelectedRegion] = useState<Region | 'All'>('All')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredAgencies = useMemo(() => {
    return SPACE_AGENCIES.filter((agency) => {
      const matchesRegion =
        selectedRegion === 'All' || agency.region === selectedRegion
      const query = searchQuery.toLowerCase().trim()
      const matchesQuery =
        !query ||
        agency.acronym.toLowerCase().includes(query) ||
        agency.name.toLowerCase().includes(query) ||
        agency.country.toLowerCase().includes(query) ||
        agency.region.toLowerCase().includes(query) ||
        agency.description.toLowerCase().includes(query)

      return matchesRegion && matchesQuery
    })
  }, [selectedRegion, searchQuery])

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
          <span className="text-[#111111]">Government Agencies</span>
        </div>
      </div>

      {/* Directory Grand Header */}
      <section className="border-b-2 border-[#111111] px-4 sm:px-6 lg:px-10 py-10 sm:py-14 bg-white">
        <div className="max-w-[1340px] mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-3xl">
              <span className="bg-[#111111] text-[#ffc500] text-[10px] font-sans-editorial font-bold uppercase tracking-widest px-2.5 py-1 inline-block mb-3">
                GLOBAL SPACE REGISTRY
              </span>
              <h1 className="text-[36px] sm:text-[50px] lg:text-[60px] font-serif-editorial font-normal leading-[1.04] text-[#111111] tracking-[-0.01em] mb-3">
                Government Space Agencies
              </h1>
              <p className="text-[15px] sm:text-[17px] font-serif-editorial text-[#444444] leading-relaxed">
                Comprehensive directory and real-time news archive for 53 national space authorities, space programs, and intergovernmental agencies across 6 continents.
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-4 bg-[#fdfcf4] border border-[#111111] p-4 sm:p-5 shrink-0 shadow-xs">
              <div className="text-center px-3 border-r border-[#dcd8cb]">
                <div className="text-[28px] font-serif-editorial font-normal leading-none text-[#111111]">
                  53
                </div>
                <div className="text-[9.5px] font-sans-editorial font-bold uppercase tracking-wider text-[#777777] mt-1">
                  AGENCIES
                </div>
              </div>
              <div className="text-center px-3">
                <div className="text-[28px] font-serif-editorial font-normal leading-none text-[#111111]">
                  6
                </div>
                <div className="text-[9.5px] font-sans-editorial font-bold uppercase tracking-wider text-[#777777] mt-1">
                  CONTINENTS
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter and Search Controls Bar */}
      <section className="border-b border-[#dcd8cb] bg-[#f7f6ec] px-4 sm:px-6 lg:px-10 py-4 sticky top-[41px] z-30 shadow-xs">
        <div className="max-w-[1340px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Region Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none text-[11px] font-sans-editorial font-bold uppercase tracking-wider">
            <button
              onClick={() => setSelectedRegion('All')}
              className={`px-3 py-1.5 border transition-all whitespace-nowrap ${
                selectedRegion === 'All'
                  ? 'bg-[#111111] text-[#ffc500] border-[#111111]'
                  : 'bg-white text-[#444444] border-[#dcd8cb] hover:border-[#111111]'
              }`}
            >
              ALL ({SPACE_AGENCIES.length})
            </button>
            {REGIONS.map((region) => {
              const count = SPACE_AGENCIES.filter((a) => a.region === region).length
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

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Search agency, country, acronym..."
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
                No space agencies found matching &ldquo;{searchQuery}&rdquo;.
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
                    {/* Header: Flag, Region, Country */}
                    <div className="flex items-center justify-between border-b border-[#eae8dc] pb-3 mb-3 text-[10.5px] font-sans-editorial">
                      <div className="flex items-center gap-2 font-bold uppercase text-[#777777]">
                        <span className="text-lg leading-none">{agency.flag}</span>
                        <span>{agency.country}</span>
                      </div>
                      <span className="bg-[#f7f6ec] text-[#111111] font-bold uppercase tracking-wider px-2 py-0.5 border border-[#dcd8cb]">
                        {agency.region}
                      </span>
                    </div>

                    {/* Acronym and Name */}
                    <h2 className="text-[24px] sm:text-[26px] font-serif-editorial font-normal text-[#111111] leading-tight group-hover:text-[#111111] mb-1.5 flex items-center justify-between">
                      <span>{agency.acronym}</span>
                      <span className="text-base text-[#888884] group-hover:text-[#111111] group-hover:translate-x-1 transition-transform">
                        →
                      </span>
                    </h2>
                    <p className="text-[13px] font-serif-editorial font-medium text-[#444444] mb-3 line-clamp-2 italic">
                      {agency.name}
                    </p>

                    {/* Description preview */}
                    <p className="text-[12.5px] font-serif-editorial text-[#555555] leading-relaxed line-clamp-3 mb-4">
                      {agency.description}
                    </p>
                  </div>

                  {/* Footer Action */}
                  <div className="pt-3 border-t border-[#eae8dc] flex items-center justify-between text-[10px] font-sans-editorial font-bold uppercase tracking-wider text-[#111111]">
                    <span className="text-[#888884]">
                      {agency.established ? `Est. ${agency.established}` : 'Active Program'}
                    </span>
                    <span className="group-hover:text-[#ffc500] group-hover:bg-[#111111] px-2 py-0.5 transition-colors">
                      OPEN AGENCY WIRE →
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
