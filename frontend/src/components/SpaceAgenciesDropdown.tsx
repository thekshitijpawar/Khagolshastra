'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  SPACE_AGENCIES,
  REGIONS,
  Region,
  AgencyType,
  getGovernmentAgencies,
  getIndianStartups,
} from '@/lib/agencies'

interface SpaceAgenciesDropdownProps {
  isOpen: boolean
  onClose: () => void
}

type SubsectionTab = 'all' | 'government' | 'startups'

export default function SpaceAgenciesDropdown({ isOpen, onClose }: SpaceAgenciesDropdownProps) {
  const [activeSubsection, setActiveSubsection] = useState<SubsectionTab>('government')
  const [selectedRegion, setSelectedRegion] = useState<Region | 'All'>('All')
  const [filterQuery, setFilterQuery] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)

  const govAgencies = useMemo(() => getGovernmentAgencies(), [])
  const indianStartups = useMemo(() => getIndianStartups(), [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

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

      const query = filterQuery.toLowerCase().trim()
      const matchesQuery =
        !query ||
        agency.acronym.toLowerCase().includes(query) ||
        agency.name.toLowerCase().includes(query) ||
        agency.country.toLowerCase().includes(query) ||
        (agency.focus && agency.focus.toLowerCase().includes(query))

      return matchesRegion && matchesQuery
    })
  }, [activeSubsection, selectedRegion, filterQuery, govAgencies, indianStartups])

  if (!isOpen) return null

  return (
    <div
      ref={menuRef}
      className="absolute top-full left-0 w-[96vw] max-w-[1240px] bg-[#fdfcf4] border-2 border-[#111111] shadow-[0_20px_40px_rgba(0,0,0,0.18)] z-50 animate-in mt-1 p-5 sm:p-6"
      style={{ left: 'clamp(-20px, calc(50% - 620px), 0px)' }}
    >
      {/* Top Header & Subsection Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b-2 border-[#111111] pb-3 mb-4 gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-sans-editorial font-bold tracking-widest uppercase">
            <span className="bg-[#111111] text-[#ffc500] px-2 py-0.5">SECTION: SPACE AGENCY</span>
            <span className="text-[#888884]">▸</span>
            <span className="bg-[#eae8dc] text-[#111111] px-2 py-0.5 border border-[#dcd8cb]">
              {activeSubsection === 'startups'
                ? 'SUBSECTION: INDIAN PRIVATE STARTUPS (17)'
                : activeSubsection === 'government'
                ? 'SUBSECTION: GOVERNMENT AGENCIES (78)'
                : 'SUBSECTION: ALL GLOBAL AGENCIES & STARTUPS (95)'}
            </span>
          </div>

          <div className="text-[13.5px] font-serif-editorial text-[#333333] mt-1 italic">
            {activeSubsection === 'startups'
              ? 'Select any Indian private space startup to view official launch milestones, 3D engines, Earth observation payloads, and official press releases.'
              : 'Select any national space agency to access its dedicated live news dispatches, mission updates, and research archive.'}
          </div>
        </div>

        {/* Quick Filter Input & Close */}
        <div className="flex items-center gap-2">
          <div className="relative w-48 sm:w-64">
            <input
              type="text"
              placeholder={`Filter ${
                activeSubsection === 'startups'
                  ? '17 Indian startups...'
                  : activeSubsection === 'government'
                  ? '78 gov agencies...'
                  : '95 organizations...'
              }`}
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full pl-7 pr-2 py-1.5 bg-white border border-[#111111] text-xs font-serif-editorial text-[#111] placeholder:text-[#888] focus:outline-none"
            />
            <svg
              className="w-3.5 h-3.5 text-[#888] absolute left-2 top-1/2 -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center border border-[#111111] bg-white hover:bg-[#111111] hover:text-white transition-colors text-xs font-bold shrink-0"
            title="Close dropdown"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Subsection Primary Tabs */}
      <div className="flex flex-wrap items-center gap-2 pb-3 mb-3 border-b-2 border-[#111111]">
        <button
          onClick={() => {
            setActiveSubsection('government')
            setSelectedRegion('All')
          }}
          className={`px-3.5 py-1.5 text-[11px] font-sans-editorial font-bold uppercase tracking-wider transition-all border ${
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
          className={`px-3.5 py-1.5 text-[11px] font-sans-editorial font-bold uppercase tracking-wider transition-all border ${
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
          className={`px-3 py-1.5 text-[11px] font-sans-editorial font-bold uppercase tracking-wider transition-all border ${
            activeSubsection === 'all'
              ? 'bg-[#111111] text-[#ffc500] border-[#111111]'
              : 'bg-white text-[#555555] border-[#dcd8cb] hover:border-[#111111]'
          }`}
        >
          ALL ({SPACE_AGENCIES.length})
        </button>
      </div>

      {/* Secondary Filter: Region Bar (for Government & All) or Category Hint (for Startups) */}
      {activeSubsection !== 'startups' ? (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none text-[10px] font-sans-editorial font-bold uppercase tracking-wider border-b border-[#e2ded2]">
          <button
            onClick={() => setSelectedRegion('All')}
            className={`px-2.5 py-1 border transition-all whitespace-nowrap ${
              selectedRegion === 'All'
                ? 'bg-[#111111] text-[#ffc500] border-[#111111]'
                : 'bg-white text-[#444444] border-[#dcd8cb] hover:border-[#111111]'
            }`}
          >
            ALL REGIONS ({activeSubsection === 'government' ? govAgencies.length : SPACE_AGENCIES.length})
          </button>
          {REGIONS.map((reg) => {
            const count = (activeSubsection === 'government' ? govAgencies : SPACE_AGENCIES).filter(
              (a) => a.region === reg
            ).length
            return (
              <button
                key={reg}
                onClick={() => setSelectedRegion(reg)}
                className={`px-2.5 py-1 border transition-all whitespace-nowrap ${
                  selectedRegion === reg
                    ? 'bg-[#111111] text-[#ffc500] border-[#111111]'
                    : 'bg-white text-[#444444] border-[#dcd8cb] hover:border-[#111111]'
                }`}
              >
                {reg.toUpperCase()} ({count})
              </button>
            )
          })}
        </div>
      ) : (
        <div className="flex items-center justify-between pb-2 mb-3 text-[10px] font-sans-editorial font-bold uppercase tracking-wider text-[#666] border-b border-[#e2ded2]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#138808]" />
            <span>NEWSPACE INDIA ECOSYSTEM • LAUNCH VEHICLES, PROPULSION, HYPERSPECTRAL & SSA SATELLITES</span>
          </span>
          <span className="text-[#888884]">{indianStartups.length} ACCREDITED VENTURES</span>
        </div>
      )}

      {/* Agencies & Startups Grid */}
      <div className="max-h-[50vh] overflow-y-auto pr-1">
        {filteredAgencies.length === 0 ? (
          <div className="text-center py-8 text-sm font-serif-editorial text-[#666]">
            No organizations matching &ldquo;{filterQuery}&rdquo;.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {filteredAgencies.map((agency) => (
              <Link
                key={agency.slug}
                href={`/agency/${agency.slug}`}
                onClick={onClose}
                className="group flex flex-col justify-between p-2.5 bg-white hover:bg-[#111111] border border-[#dcd8cb] hover:border-[#111111] transition-all"
              >
                <div className="flex items-start justify-between gap-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base shrink-0">{agency.flag}</span>
                    <div className="min-w-0">
                      <div className="text-[12px] font-sans-editorial font-bold text-[#111111] group-hover:text-[#ffc500] transition-colors truncate">
                        {agency.acronym}
                      </div>
                      <div className="text-[10px] font-serif-editorial text-[#666666] group-hover:text-[#cccccc] transition-colors truncate">
                        {agency.agencyType === 'Indian Private Startup'
                          ? agency.headquarters || 'India'
                          : agency.country}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[#888884] group-hover:text-[#ffc500] shrink-0">
                    →
                  </span>
                </div>

                {agency.focus && (
                  <div className="mt-2 pt-1.5 border-t border-[#f0ede4] group-hover:border-[#333333] text-[9.5px] font-sans-editorial text-[#444444] group-hover:text-[#dddddd] truncate">
                    <span className="font-bold text-[#888884] group-hover:text-[#ffc500]">FOCUS: </span>
                    {agency.focus}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Footer Bar */}
      <div className="mt-4 pt-3 border-t border-[#dcd8cb] flex flex-col sm:flex-row sm:items-center justify-between text-[11px] font-sans-editorial font-bold uppercase tracking-wider gap-2">
        <span className="text-[#777777] text-[10px]">
          {SPACE_AGENCIES.length} Space Organizations • 78 Government Agencies + 17 Indian Startups
        </span>
        <Link
          href="/agencies"
          onClick={onClose}
          className="text-[#111111] hover:text-[#ffc500] hover:bg-[#111111] px-3 py-1 transition-colors inline-flex items-center gap-1"
        >
          <span>OPEN FULL GLOBAL SPACE DIRECTORY ({SPACE_AGENCIES.length})</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  )
}

