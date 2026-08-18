'use client'

import Link from 'next/link'
import { useState } from 'react'
import WebbLiveTracker from './WebbLiveTracker'
import SpaceAgenciesDropdown from './SpaceAgenciesDropdown'
import { SPACE_AGENCIES } from '@/lib/agencies'

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileAgenciesOpen, setMobileAgenciesOpen] = useState(false)
  const [agenciesOpen, setAgenciesOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const utilityNav = [
    { href: '/', label: 'MAGAZINE' },
    { href: '#radio-section', label: 'RADIO' },
    { href: '#launches-section', label: 'LAUNCHES' },
    { href: '#sunspots-section', label: 'SUNSPOTS' },
    { href: '/research', label: 'RESEARCH' },
    { href: '/articles', label: 'ALL HEADLINES' },
  ]

  const sectionsNav = [
    { href: '/section/solar-system', label: 'SOLAR SYSTEM' },
    { href: '#sunspots-section', label: 'SUNSPOTS' },
    { href: '/section/exoplanets', label: 'EXOPLANETS' },
    { href: '/section/stars', label: 'STARS' },
    { href: '/section/milky-way', label: 'MILKY WAY' },
    { href: '/section/galaxies', label: 'GALAXIES' },
    { href: '/section/exotic-objects', label: 'EXOTIC OBJECTS' },
    { href: '/section/cosmology', label: 'COSMOLOGY' },
    { href: '/section/this-week-in-astronomy', label: 'THIS WEEK' },
    { href: '/section/launches', label: 'LAUNCHES' },
    { href: '/section/human-spaceflight', label: 'SPACEFLIGHT' },
    { href: '/section/today-in-the-history-of-astronomy', label: 'HISTORY' },
  ]

  return (
    <header className="border-b border-[#111111] bg-[#fdfcf4] sticky top-0 z-40">
      {/* Topmost Utility Bar */}
      <div className="border-b border-[#dcd8cb] bg-[#fdfcf4] px-4 sm:px-6 lg:px-10">
        <div className="max-w-[1340px] mx-auto flex items-center justify-between h-10 text-[11px] font-sans-editorial font-bold tracking-[0.12em] uppercase text-[#111111]">
          {/* Left Menu Items */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden flex items-center gap-1.5 hover:text-[#555] transition-colors"
              aria-label="Toggle navigation"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span>MENU</span>
            </button>

            <nav className="hidden lg:flex items-center gap-5">
              {utilityNav.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="hover:text-[#555555] transition-colors relative py-1"
                >
                  {item.label}
                </Link>
              ))}

              {/* SPACE AGENCY MEGA DROPDOWN BUTTON */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setAgenciesOpen(!agenciesOpen)}
                  className={`flex items-center gap-1 transition-all py-1 px-1.5 uppercase tracking-[0.12em] font-bold ${
                    agenciesOpen
                      ? 'bg-[#111111] text-[#ffc500]'
                      : 'hover:text-[#555555]'
                  }`}
                >
                  <span>SPACE AGENCIES</span>
                  <svg
                    className={`w-3 h-3 transition-transform duration-200 ${agenciesOpen ? 'rotate-180 text-[#ffc500]' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <SpaceAgenciesDropdown
                  isOpen={agenciesOpen}
                  onClose={() => setAgenciesOpen(false)}
                />
              </div>
            </nav>
          </div>

          {/* Right Action Items */}
          <div className="flex items-center gap-5">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="flex items-center gap-1 hover:text-[#555555] transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="hidden sm:inline">SEARCH</span>
            </button>

            <Link href="/articles" className="hidden sm:inline hover:text-[#555555] transition-colors">
              WIRE
            </Link>

            <Link
              href="#subscribe-dispatch"
              className="bg-[#ffc500] hover:bg-[#f0ba00] text-[#111111] px-3.5 py-1.5 font-bold transition-colors shadow-xs"
            >
              SUBSCRIBE
            </Link>

            <div className="hidden md:flex items-center gap-2 pl-2 border-l border-[#dcd8cb] text-[#555555]">
              <span className="text-[12px]">🌍</span>
              <span className="text-[10px] tracking-wider text-[#111111]">GLOBAL</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar Dropdown */}
      {searchOpen && (
        <div className="bg-[#f7f6ec] border-b border-[#dcd8cb] px-4 py-3 animate-in">
          <div className="max-w-[1340px] mx-auto flex items-center gap-3">
            <svg className="w-4 h-4 text-[#555555]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search astronomy dispatches, exoplanets, rocket launches, or astrophysics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  window.location.href = `/articles?query=${encodeURIComponent(searchQuery)}`
                }
              }}
              className="flex-1 bg-transparent border-none outline-none text-sm text-[#111111] placeholder:text-[#888884] font-serif-editorial"
              autoFocus
            />
            <button
              onClick={() => {
                if (searchQuery.trim()) {
                  window.location.href = `/articles?query=${encodeURIComponent(searchQuery)}`
                }
              }}
              className="px-3 py-1 bg-[#111111] text-white text-[11px] font-sans-editorial font-bold uppercase tracking-widest hover:bg-[#333]"
            >
              Search
            </button>
            <button
              onClick={() => setSearchOpen(false)}
              className="text-xs text-[#666] hover:text-[#111] font-bold px-2"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Masthead Banner */}
      <div className="px-4 sm:px-6 lg:px-10 py-5 sm:py-7 border-b border-[#dcd8cb] bg-[#fdfcf4]">
        <div className="max-w-[1340px] mx-auto grid grid-cols-1 md:grid-cols-12 items-center gap-4">
          {/* Left Column: Live James Webb Space Telescope Tracker */}
          <div className="hidden md:flex md:col-span-3 items-center">
            <WebbLiveTracker variant="masthead" />
          </div>

          {/* Center Column: Grand Serif Masthead Logo */}
          <div className="col-span-12 md:col-span-6 text-center">
            <Link href="/" className="inline-flex flex-col items-center justify-center group">
              {/* Row with Logo and Title aligned at same height */}
              <div className="inline-flex items-center justify-center gap-3 sm:gap-4">
                <img
                  src="/khagolshastra-logo-tight.png"
                  alt="खगोलशास्त्र"
                  className="h-9 sm:h-12 lg:h-14 w-auto object-contain shrink-0 group-hover:scale-105 transition-transform duration-300 drop-shadow-xs"
                />
                <h1
                  className="text-[34px] sm:text-[48px] lg:text-[58px] font-normal tracking-[-0.01em] text-[#111111] leading-none uppercase hover:opacity-90 transition-opacity font-serif-editorial flex items-center"
                  style={{ letterSpacing: '0.04em' }}
                >
                  KHAGOLSHASTRA
                </h1>
              </div>

              {/* Centered Gray Tagline */}
              <div className="mt-2 text-center text-[10px] sm:text-[11px] font-sans-editorial tracking-[0.22em] uppercase text-[#666666] font-medium w-full">
                ASTRONOMY & SPACE NEWS • SCIENTIFIC RESEARCH PAPERS
              </div>
            </Link>
          </div>

          {/* Right Column: Spacer for Perfect Symmetry */}
          <div className="hidden md:block md:col-span-3" aria-hidden="true" />
        </div>
      </div>

      {/* Mobile JWST Live Observation Ribbon */}
      <div className="md:hidden bg-[#f7f6ec] border-b border-[#dcd8cb] px-4 py-1.5 shadow-2xs">
        <WebbLiveTracker variant="compact-bar" />
      </div>

      {/* Primary Section Navigation Ribbon with Pipes */}
      <div className="hidden lg:block bg-[#fdfcf4] px-4 sm:px-6 lg:px-10 border-b border-[#111111]">
        <div className="max-w-[1340px] mx-auto flex items-center justify-between h-11 text-[11px] font-sans-editorial font-bold tracking-[0.10em] uppercase text-[#111111] overflow-x-auto whitespace-nowrap">
          {sectionsNav.map((sec, i) => (
            <div key={sec.href} className="flex items-center">
              <Link
                href={sec.href}
                className="hover:text-[#ffc500] hover:bg-[#111111] px-3 py-1.5 transition-all"
              >
                {sec.label}
              </Link>
              {i < sectionsNav.length - 1 && (
                <span className="text-[#dcd8cb] select-none">|</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#fdfcf4] border-b-2 border-[#111111] px-6 py-5 space-y-4 animate-in">
          {/* Live JWST Card in Mobile Drawer */}
          <div className="p-3 bg-[#f7f6ec] border border-[#dcd8cb]">
            <div className="text-[9px] font-sans-editorial font-bold uppercase tracking-widest text-[#888884] mb-2">
              JWST RECORDING
            </div>
            <WebbLiveTracker variant="masthead" />
          </div>

          {/* Space Agencies Mobile Section */}
          <div className="border border-[#111111] bg-white p-3.5">
            <button
              type="button"
              onClick={() => setMobileAgenciesOpen(!mobileAgenciesOpen)}
              className="w-full flex items-center justify-between text-[11px] font-sans-editorial font-bold uppercase tracking-wider text-[#111111]"
            >
              <span className="flex items-center gap-2">
                <span>🛰️</span>
                <span>SPACE AGENCIES & STARTUPS ({SPACE_AGENCIES.length})</span>
              </span>
              <span className="text-xs">{mobileAgenciesOpen ? '▲' : '▼'}</span>
            </button>

            {mobileAgenciesOpen && (
              <div className="mt-3 pt-3 border-t border-[#e2e0d8] space-y-3">
                {/* Indian Startups Section */}
                <div>
                  <div className="text-[9.5px] font-sans-editorial font-bold text-[#111111] bg-[#ffc500] px-2 py-0.5 uppercase tracking-wider inline-block mb-1.5">
                    🇮🇳 INDIAN PRIVATE STARTUPS (17):
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px] font-sans-editorial max-h-36 overflow-y-auto pr-1">
                    {SPACE_AGENCIES.filter((a) => a.agencyType === 'Indian Private Startup').map((agency) => (
                      <Link
                        key={agency.slug}
                        href={`/agency/${agency.slug}`}
                        onClick={() => setMobileOpen(false)}
                        className="p-1.5 bg-[#fdfcf4] border border-[#dcd8cb] hover:border-[#111111] flex items-center gap-1.5 truncate"
                      >
                        <span className="shrink-0">{agency.flag}</span>
                        <span className="font-bold truncate">{agency.acronym}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Government Agencies Section */}
                <div>
                  <div className="text-[9.5px] font-sans-editorial font-bold text-[#888884] uppercase tracking-wider mb-1.5">
                    🏛️ GOVERNMENT SPACE AGENCIES (78):
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px] font-sans-editorial max-h-40 overflow-y-auto pr-1">
                    {SPACE_AGENCIES.filter((a) => (a.agencyType || 'Government Agency') === 'Government Agency').map((agency) => (
                      <Link
                        key={agency.slug}
                        href={`/agency/${agency.slug}`}
                        onClick={() => setMobileOpen(false)}
                        className="p-1.5 bg-[#fdfcf4] border border-[#dcd8cb] hover:border-[#111111] flex items-center gap-1.5 truncate"
                      >
                        <span className="shrink-0">{agency.flag}</span>
                        <span className="font-bold truncate">{agency.acronym}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="pt-2 text-center border-t border-[#eae8dc]">
                  <Link
                    href="/agencies"
                    onClick={() => setMobileOpen(false)}
                    className="text-[10px] font-sans-editorial font-bold text-[#111111] hover:underline uppercase tracking-wider"
                  >
                    View All {SPACE_AGENCIES.length} Space Organizations →
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-[12px] font-sans-editorial font-bold tracking-wider uppercase">
            {sectionsNav.map((sec) => (
              <Link
                key={sec.href}
                href={sec.href}
                onClick={() => setMobileOpen(false)}
                className="py-1.5 px-2 hover:bg-[#ffc500] text-[#111111] border-b border-[#e2e0d8] transition-colors"
              >
                {sec.label}
              </Link>
            ))}
          </div>
          <div className="pt-3 border-t border-[#111111] flex items-center justify-between text-[11px] font-bold">
            <Link href="/agencies" onClick={() => setMobileOpen(false)}>SPACE AGENCIES</Link>
            <Link href="/research" onClick={() => setMobileOpen(false)}>RESEARCH</Link>
            <Link href="/articles" onClick={() => setMobileOpen(false)}>ALL HEADLINES</Link>
          </div>
        </div>
      )}
    </header>
  )
}


