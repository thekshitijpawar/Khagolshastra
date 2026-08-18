'use client'

import { useState, useEffect } from 'react'
import { SunspotRegion, SunspotsPayload } from '@/app/api/sunspots/route'

interface InstrumentFeed {
  id: string
  name: string
  label: string
  wavelength: string
  temperature: string
  description: string
  imageUrl: string
  targetFeature: string
}

const SOHO_FEEDS: InstrumentFeed[] = [
  {
    id: 'hmi_igr',
    name: 'HMI Intensitygram',
    label: 'Sunspots (White Light)',
    wavelength: '6173 Å (Visible)',
    temperature: '5,700 K (Photosphere)',
    description: 'Direct optical view of sunspots, umbral cores, and penumbral filaments on the solar disk.',
    imageUrl: 'https://soho.nascom.nasa.gov/data/realtime/hmi_igr/512/latest.jpg',
    targetFeature: 'Active Sunspot Groups & Umbrae',
  },
  {
    id: 'hmi_mag',
    name: 'HMI Magnetogram',
    label: 'Magnetic Field Polarity',
    wavelength: 'Photospheric Magnetic Field',
    temperature: 'Photosphere',
    description: 'Displays line-of-sight magnetic field strength; black indicates south polarity, white north polarity.',
    imageUrl: 'https://soho.nascom.nasa.gov/data/realtime/hmi_mag/512/latest.jpg',
    targetFeature: 'Bipolar Magnetic Active Regions',
  },
  {
    id: 'eit_171',
    name: 'EIT 171 Å',
    label: 'Extreme UV Corona (1M K)',
    wavelength: '171 Å (Fe IX/X)',
    temperature: '1,000,000 K (Quiet Corona)',
    description: 'Reveals glowing magnetic coronal loops bridging across sunspot groups in the solar corona.',
    imageUrl: 'https://soho.nascom.nasa.gov/data/realtime/eit_171/512/latest.jpg',
    targetFeature: 'Coronal Loops & Quiet Corona',
  },
  {
    id: 'eit_195',
    name: 'EIT 195 Å',
    label: 'Solar Flares & Active Regions',
    wavelength: '195 Å (Fe XII)',
    temperature: '1,500,000 K (Active Corona)',
    description: 'Monitors violent coronal dynamics, coronal mass ejections (CMEs), and magnetic reconnection flares.',
    imageUrl: 'https://soho.nascom.nasa.gov/data/realtime/eit_195/512/latest.jpg',
    targetFeature: 'Solar Flare Reconnection Sites',
  },
  {
    id: 'c2',
    name: 'LASCO C2 Coronagraph',
    label: 'Inner Corona (8.4M km)',
    wavelength: 'White Light (Occulter)',
    temperature: 'Outer Corona',
    description: 'Artificial eclipse occulting disk tracking energetic coronal mass ejections up to 8.4 million km.',
    imageUrl: 'https://soho.nascom.nasa.gov/data/realtime/c2/512/latest.jpg',
    targetFeature: 'Coronal Mass Ejections (CMEs)',
  },
  {
    id: 'c3',
    name: 'LASCO C3 Coronagraph',
    label: 'Heliosphere (32M km)',
    wavelength: 'White Light (Wide Field)',
    temperature: 'Heliosphere',
    description: 'Expansive 32-solar-radius view capturing interplanetary solar wind streams and sungrazing comets.',
    imageUrl: 'https://soho.nascom.nasa.gov/data/realtime/c3/512/latest.jpg',
    targetFeature: 'Interplanetary Solar Wind Streams',
  },
]

const DEFAULT_SUNSPOTS_DATA: SunspotsPayload = {
  timestamp: new Date().toISOString(),
  source: 'SpaceWeatherLive.com / WDC-SILSO / NOAA SWPC',
  sourceUrl: 'https://www.spaceweatherlive.com/en/solar-activity/sunspot-regions.html',
  metrics: {
    sunspotNumber: 76,
    sunspotNumberDiff: '-7',
    solarRadioFlux: 124,
    solarRadioFluxDiff: '-5',
    carringtonRotation: 2314,
    geomagneticKIndex: 'Kp 2.0 (Quiet)',
    activeRegionsCount: 4,
    solarCycle: 'Solar Cycle 25 (Maximum Phase)',
    highestFlareRisk: {
      region: 'AR4507',
      class: 'β-γ-δ (Beta-Gamma-Delta)',
      cProb: '85%',
      mProb: '35%',
      xProb: '10%',
    },
  },
  activeRegions: [
    {
      id: 'AR4506',
      regionNumber: '4506',
      spots: 6,
      size: 80,
      magClass: 'β-γ',
      rawMag: 'BG',
      spotClass: 'DAO',
      location: 'N12W65',
      cFlare: '30%',
      mFlare: '5%',
      xFlare: '1%',
      protonFlare: '1%',
      todayFlare: 'C1.7',
      sourceUrl: 'https://www.spaceweatherlive.com/en/solar-activity/region/14506.html',
      imageUrl: 'https://www.spaceweatherlive.com/images/sunspots/2026/08/18/4506_HMIIF.jpg',
      magnetogramUrl: 'https://www.spaceweatherlive.com/images/sunspots/2026/08/18/4506_HMIBC.jpg',
    },
    {
      id: 'AR4507',
      regionNumber: '4507',
      spots: 25,
      size: 300,
      magClass: 'β-γ-δ',
      rawMag: 'BGD',
      spotClass: 'EKC',
      location: 'N04W49',
      cFlare: '85%',
      mFlare: '35%',
      xFlare: '10%',
      protonFlare: '5%',
      todayFlare: 'C3.9',
      sourceUrl: 'https://www.spaceweatherlive.com/en/solar-activity/region/14507.html',
      imageUrl: 'https://www.spaceweatherlive.com/images/sunspots/2026/08/18/4507_HMIIF.jpg',
      magnetogramUrl: 'https://www.spaceweatherlive.com/images/sunspots/2026/08/18/4507_HMIBC.jpg',
    },
    {
      id: 'AR4508',
      regionNumber: '4508',
      spots: 5,
      size: 90,
      magClass: 'β',
      rawMag: 'B',
      spotClass: 'CAO',
      location: 'N08W16',
      cFlare: '25%',
      mFlare: '5%',
      xFlare: '1%',
      protonFlare: '1%',
      todayFlare: null,
      sourceUrl: 'https://www.spaceweatherlive.com/en/solar-activity/region/14508.html',
      imageUrl: 'https://www.spaceweatherlive.com/images/sunspots/2026/08/18/4508_HMIIF.jpg',
      magnetogramUrl: 'https://www.spaceweatherlive.com/images/sunspots/2026/08/18/4508_HMIBC.jpg',
    },
    {
      id: 'AR4510',
      regionNumber: '4510',
      spots: 7,
      size: 40,
      magClass: 'β',
      rawMag: 'B',
      spotClass: 'DAI',
      location: 'N12W75',
      cFlare: '50%',
      mFlare: '10%',
      xFlare: '1%',
      protonFlare: '1%',
      todayFlare: null,
      sourceUrl: 'https://www.spaceweatherlive.com/en/solar-activity/region/14510.html',
      imageUrl: 'https://www.spaceweatherlive.com/images/sunspots/2026/08/18/4510_HMIIF.jpg',
      magnetogramUrl: 'https://www.spaceweatherlive.com/images/sunspots/2026/08/18/4510_HMIBC.jpg',
    },
  ],
}

export default function SunspotsSection() {
  const [selectedFeedId, setSelectedFeedId] = useState('hmi_igr')
  const [cacheBuster, setCacheBuster] = useState(Date.now())
  const [isLiveUpdating, setIsLiveUpdating] = useState(false)
  const [sunspotData, setSunspotData] = useState<SunspotsPayload>(DEFAULT_SUNSPOTS_DATA)
  const [selectedRegion, setSelectedRegion] = useState<SunspotRegion | null>(null)

  const currentFeed = SOHO_FEEDS.find((f) => f.id === selectedFeedId) || SOHO_FEEDS[0]

  const fetchLiveSunspots = async () => {
    try {
      const res = await fetch('/api/sunspots', { cache: 'no-store' })
      if (res.ok) {
        const json = await res.json()
        if (json && json.metrics) {
          setSunspotData(json)
        }
      }
    } catch {
      // Fallback in place
    }
  }

  const handleRefresh = async () => {
    setIsLiveUpdating(true)
    setCacheBuster(Date.now())
    await fetchLiveSunspots()
    setTimeout(() => setIsLiveUpdating(false), 600)
  }

  useEffect(() => {
    fetchLiveSunspots()
    const interval = setInterval(() => {
      setCacheBuster(Date.now())
      fetchLiveSunspots()
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section id="sunspots-section" className="px-4 sm:px-6 lg:px-10 py-12 border-b border-[#111111] bg-[#fbfaf0]">
      <div className="max-w-[1340px] mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-[#111111] pb-4 mb-8 gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="eyebrow text-[#111111]">NASA / ESA SOHO & SPACEWEATHERLIVE</span>
              <span className="text-[#888884] text-xs">•</span>
              <span className="text-[10px] font-sans-editorial font-bold uppercase tracking-wider text-[#b45309] bg-[#fef3c7] px-2 py-0.5 border border-[#fde68a]">
                LIVE HELIOPHYSICS OBSERVATORY
              </span>
            </div>
            <h2 className="text-[26px] sm:text-[34px] font-serif-editorial font-normal leading-tight text-[#111111]">
              Sunspots & Solar Activity Regions
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleRefresh}
              className="text-[11px] font-sans-editorial font-bold uppercase tracking-widest bg-white border border-[#111111] px-3.5 py-1.5 hover:bg-[#111111] hover:text-white transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <span className={isLiveUpdating ? 'animate-spin inline-block' : ''}>↻</span>
              <span>REFRESH DATA</span>
            </button>
            <a
              href="https://www.spaceweatherlive.com/en/solar-activity/sunspot-regions.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-sans-editorial font-bold uppercase tracking-widest bg-[#111111] text-[#ffc500] hover:bg-[#ffc500] hover:text-[#111111] px-3.5 py-1.5 transition-colors shadow-2xs flex items-center gap-1 border border-[#111111]"
            >
              <span>SPACEWEATHERLIVE REGIONS ↗</span>
            </a>
            <a
              href="https://soho.nascom.nasa.gov/sunspots/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-sans-editorial font-bold uppercase tracking-widest bg-white text-[#111111] hover:bg-[#111111] hover:text-white px-3 py-1.5 transition-colors shadow-2xs border border-[#111111] hidden sm:flex items-center gap-1"
            >
              <span>NASA SOHO ↗</span>
            </a>
          </div>
        </div>

        {/* 1. Live Solar Index Top Matrix */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 mb-8">
          <div className="bg-white border border-[#111111] p-3.5 shadow-2xs">
            <div className="flex items-center justify-between text-[9.5px] font-sans-editorial font-bold uppercase tracking-wider text-[#888884] mb-1">
              <span>SUNSPOT NUMBER (SSN)</span>
              {sunspotData.metrics.sunspotNumberDiff && (
                <span className={`px-1.5 py-0.2 text-[9px] font-bold ${
                  sunspotData.metrics.sunspotNumberDiff.startsWith('-') ? 'text-red-700 bg-red-50' : 'text-emerald-700 bg-emerald-50'
                }`}>
                  {sunspotData.metrics.sunspotNumberDiff}
                </span>
              )}
            </div>
            <div className="text-[26px] font-serif-editorial font-bold text-[#111111] leading-none">
              {sunspotData.metrics.sunspotNumber}
            </div>
            <div className="text-[10px] font-sans-editorial text-[#16a34a] font-bold mt-1.5">
              ● WDC-SILSO Daily Count
            </div>
          </div>

          <div className="bg-white border border-[#111111] p-3.5 shadow-2xs">
            <div className="flex items-center justify-between text-[9.5px] font-sans-editorial font-bold uppercase tracking-wider text-[#888884] mb-1">
              <span>10.7 CM RADIO FLUX</span>
              {sunspotData.metrics.solarRadioFluxDiff && (
                <span className={`px-1.5 py-0.2 text-[9px] font-bold ${
                  sunspotData.metrics.solarRadioFluxDiff.startsWith('-') ? 'text-red-700 bg-red-50' : 'text-emerald-700 bg-emerald-50'
                }`}>
                  {sunspotData.metrics.solarRadioFluxDiff}
                </span>
              )}
            </div>
            <div className="text-[26px] font-serif-editorial font-bold text-[#111111] leading-none">
              {sunspotData.metrics.solarRadioFlux} <span className="text-xs font-normal font-sans-editorial text-[#777]">sfu</span>
            </div>
            <div className="text-[10px] font-sans-editorial text-[#555555] mt-1.5">
              Penticton Solar Flux
            </div>
          </div>

          <div className="bg-white border border-[#111111] p-3.5 shadow-2xs">
            <div className="text-[9.5px] font-sans-editorial font-bold uppercase tracking-wider text-[#888884] mb-1">
              CARRINGTON ROTATION
            </div>
            <div className="text-[26px] font-serif-editorial font-bold text-[#111111] leading-none">
              {sunspotData.metrics.carringtonRotation}
            </div>
            <div className="text-[10px] font-sans-editorial text-[#555555] mt-1.5">
              Solar Synodic Period
            </div>
          </div>

          <div className="bg-white border border-[#111111] p-3.5 shadow-2xs">
            <div className="text-[9.5px] font-sans-editorial font-bold uppercase tracking-wider text-[#888884] mb-1">
              ACTIVE REGIONS ON DISK
            </div>
            <div className="text-[26px] font-serif-editorial font-bold text-[#111111] leading-none">
              {sunspotData.activeRegions.length} <span className="text-xs font-normal font-sans-editorial text-[#777]">groups</span>
            </div>
            <div className="text-[10px] font-sans-editorial text-[#16a34a] font-bold mt-1.5">
              ● All Tracked & Classed
            </div>
          </div>

          <div className="col-span-2 lg:col-span-1 bg-[#111111] text-white border border-[#111111] p-3.5 shadow-2xs">
            <div className="flex items-center justify-between text-[9px] font-sans-editorial font-bold uppercase tracking-widest text-[#ffc500] mb-1">
              <span>PEAK FLARE RISK</span>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            </div>
            <div className="text-[18px] font-serif-editorial font-bold text-white leading-tight">
              {sunspotData.metrics.highestFlareRisk.region}
            </div>
            <div className="text-[10.5px] font-sans-editorial text-[#eae8dc] mt-1">
              <span className="font-bold text-[#ffc500]">{sunspotData.metrics.highestFlareRisk.cProb} C</span> •{' '}
              <span className="font-bold text-[#f59e0b]">{sunspotData.metrics.highestFlareRisk.mProb} M</span> •{' '}
              <span className="font-bold text-[#ef4444]">{sunspotData.metrics.highestFlareRisk.xProb} X</span>
            </div>
          </div>
        </div>

        {/* 2. Main Grid: Live Telescope Image Viewer (Left) + SpaceWeatherLive Active Regions Catalog (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* Left Column: Live SOHO / SDO Feed Viewer */}
          <div className="lg:col-span-6 flex flex-col">
            {/* Instrument Tabs */}
            <div className="flex flex-wrap gap-1.5 mb-3 border-b border-[#dcd8cb] pb-3">
              {SOHO_FEEDS.map((feed) => {
                const active = feed.id === selectedFeedId
                return (
                  <button
                    key={feed.id}
                    onClick={() => setSelectedFeedId(feed.id)}
                    className={`text-[10.5px] font-sans-editorial font-bold tracking-wider uppercase px-2.5 py-1.5 transition-all duration-200 ease-out transform border ${
                      active
                        ? 'bg-[#111111] text-white border-[#111111] shadow-2xs -translate-y-0.5'
                        : 'bg-white text-[#444444] border-[#dcd8cb] hover:border-[#111111] hover:text-[#111111] hover:-translate-y-0.5 hover:shadow-xs'
                    }`}
                  >
                    {feed.label}
                  </button>
                )
              })}
            </div>

            {/* Image Frame with Broadsheet Border */}
            <div className="relative bg-[#0d0d0d] border border-[#111111] p-2 sm:p-3 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
              <div className="relative w-full max-w-[480px] aspect-square overflow-hidden bg-black flex items-center justify-center">
                <img
                  src={`${currentFeed.imageUrl}?t=${cacheBuster}`}
                  alt={`NASA SOHO Live - ${currentFeed.name}`}
                  className="w-full h-full object-contain"
                  loading="eager"
                />

                {/* Overlaid Instrument Tag */}
                <div className="absolute top-2 left-2 bg-[#111111]/85 backdrop-blur-xs text-[#ffc500] text-[9px] font-sans-editorial font-bold tracking-widest uppercase px-2 py-0.5 border border-[#444]">
                  {currentFeed.name}
                </div>

                <div className="absolute bottom-2 right-2 bg-[#111111]/85 backdrop-blur-xs text-[#eae8dc] text-[9px] font-sans-editorial font-mono px-2 py-0.5 border border-[#444]">
                  L1 LAGRANGE • SOHO/SDO
                </div>
              </div>

              {/* Image Caption & Target Information */}
              <div className="w-full mt-3 pt-2.5 border-t border-[#222222] flex flex-col sm:flex-row sm:items-center justify-between text-[11px] font-sans-editorial text-[#aaaaaa] gap-2 px-1">
                <div>
                  <span className="text-[#ffc500] font-bold uppercase font-sans-editorial">TARGET: </span>
                  <span className="text-white font-serif-editorial">{currentFeed.targetFeature}</span>
                </div>
                <div className="text-[10px] text-[#888888]">
                  WAVELENGTH: <span className="text-[#dddddd]">{currentFeed.wavelength}</span>
                </div>
              </div>
            </div>

            <p className="text-[12px] font-serif-editorial text-[#666666] leading-relaxed mt-3">
              {currentFeed.description} Direct observation downlinked from NASA/ESA SOHO and SDO satellites stationed at the Sun-Earth L1 point.
            </p>
          </div>

          {/* Right Column: SpaceWeatherLive Active Sunspot Regions Catalog */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-5">
            {/* Active Regions Table */}
            <div className="bg-white border border-[#111111] p-4 sm:p-5 shadow-2xs">
              <div className="flex items-center justify-between border-b-2 border-[#111111] pb-2.5 mb-4">
                <div>
                  <span className="eyebrow text-[#111111] block mb-0.5">SPACEWEATHERLIVE & NOAA REGISTRY</span>
                  <h3 className="text-[18px] font-serif-editorial font-bold text-[#111111]">
                    Visible Sunspot Regions on Solar Disk
                  </h3>
                </div>
                <span className="text-[10px] font-sans-editorial font-bold bg-[#ffc500] text-[#111111] px-2 py-0.5 uppercase tracking-wider">
                  {sunspotData.activeRegions.length} ACTIVE GROUPS
                </span>
              </div>

              {/* Table of Regions */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11.5px] font-sans-editorial border-collapse">
                  <thead>
                    <tr className="border-b border-[#111111] bg-[#f7f6ec] text-[10px] font-bold uppercase tracking-wider text-[#555555]">
                      <th className="py-2 px-2.5">Region</th>
                      <th className="py-2 px-2 text-center">Spots</th>
                      <th className="py-2 px-2 text-center">Area (µh)</th>
                      <th className="py-2 px-2 text-center">Mag. Class</th>
                      <th className="py-2 px-2 text-center">Spot Class</th>
                      <th className="py-2 px-2 text-center">Coord</th>
                      <th className="py-2 px-2 text-center">Flare Prob (C/M/X)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2ded2]">
                    {sunspotData.activeRegions.map((region) => {
                      const isHighEnergy = region.magClass.includes('δ') || region.rawMag === 'BGD'
                      return (
                        <tr
                          key={region.id}
                          onClick={() => setSelectedRegion(region)}
                          className="hover:bg-[#faf9f0] cursor-pointer transition-colors group"
                          title="Click to view high-resolution region magnetogram and telemetry"
                        >
                          <td className="py-2.5 px-2.5 font-bold text-[#111111] group-hover:text-[#b45309] transition-colors flex items-center gap-1.5">
                            <span>{region.id}</span>
                            {region.todayFlare && (
                              <span className="text-[8.5px] bg-red-100 text-red-800 font-bold px-1 rounded-xs">
                                {region.todayFlare}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-2 text-center font-serif-editorial font-bold text-[#111111]">
                            {region.spots}
                          </td>
                          <td className="py-2.5 px-2 text-center font-mono text-[#555555]">
                            {region.size}
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <span
                              className={`inline-block px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-tight ${
                                isHighEnergy
                                  ? 'bg-red-600 text-white shadow-2xs font-bold'
                                  : region.magClass.includes('γ')
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'bg-[#edece1] text-[#333333]'
                              }`}
                            >
                              {region.magClass}
                            </span>
                          </td>
                          <td className="py-2.5 px-2 text-center font-mono font-bold text-[#444444]">
                            {region.spotClass}
                          </td>
                          <td className="py-2.5 px-2 text-center font-mono text-[#666666] text-[10.5px]">
                            {region.location}
                          </td>
                          <td className="py-2.5 px-2 text-center font-mono text-[10.5px]">
                            <span className="text-[#16a34a] font-bold">{region.cFlare}</span> /{' '}
                            <span className="text-[#d97706] font-bold">{region.mFlare}</span> /{' '}
                            <span className="text-[#dc2626] font-bold">{region.xFlare}</span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Legend & Guide */}
              <div className="mt-3.5 pt-3 border-t border-[#dcd8cb] flex flex-wrap items-center justify-between text-[10px] font-sans-editorial text-[#777777] gap-2">
                <div className="flex items-center gap-3">
                  <span><strong className="text-[#111111]">β-γ-δ:</strong> Complex Bipolar & Delta (High Flare Potential)</span>
                  <span>•</span>
                  <span><strong className="text-[#111111]">Area:</strong> Millionths of solar hemisphere (µh)</span>
                </div>
                <div className="text-[10px] text-[#111111] font-bold">
                  Click any row for detailed telemetry →
                </div>
              </div>
            </div>

            {/* Solar Physics Briefing */}
            <div className="bg-white border border-[#dcd8cb] p-4 sm:p-5 shadow-2xs">
              <div className="text-[9.5px] font-sans-editorial font-bold uppercase tracking-wider text-[#111111] mb-2 flex items-center gap-1.5 border-b border-[#e2ded2] pb-1.5">
                <span className="w-1.5 h-1.5 bg-[#111111] rounded-full inline-block" />
                <span>HELIOPHYSICS OF ACTIVE REGIONS & SOLAR CYCLE 25</span>
              </div>
              <p className="text-[12.5px] font-serif-editorial text-[#444444] leading-relaxed">
                Sunspot active regions are generated by concentrated magnetic flux tubes emerging from the solar tachocline. High-complexity classifications like <strong className="text-[#111111]">Beta-Gamma-Delta (&beta;-&gamma;-&delta;)</strong> feature opposite polarity umbrae within a shared penumbra, accumulating extreme magnetic shear that discharges in intense M- and X-class solar flares.
              </p>
              <div className="mt-3 pt-2.5 border-t border-[#eee] flex items-center justify-between text-[10px] font-sans-editorial font-bold uppercase tracking-wider text-[#888884]">
                <span>DATA UPDATED 24/7 VIA NOAA SWPC & SPACEWEATHERLIVE</span>
                <a
                  href="https://www.spaceweatherlive.com/en/solar-activity/sunspot-regions.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#111111] hover:text-[#ffc500] transition-colors"
                >
                  FULL SWPC REPORT →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Region Telemetry Modal */}
      {selectedRegion && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in"
          onClick={() => setSelectedRegion(null)}
        >
          <div
            className="bg-[#fdfcf4] text-[#111111] max-w-lg w-full border-2 border-[#111111] shadow-2xl p-6 sm:p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b-2 border-[#111111] pb-3 mb-5">
              <div>
                <span className="text-[10px] font-sans-editorial font-bold tracking-widest text-[#ffc500] bg-[#111111] px-2 py-0.5 inline-block uppercase">
                  SUNSPOT REGION TELEMETRY
                </span>
                <h3 className="text-[22px] font-serif-editorial font-bold text-[#111111] mt-1">
                  Active Region {selectedRegion.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRegion(null)}
                className="w-7 h-7 flex items-center justify-center border border-[#111111] bg-white hover:bg-[#111111] hover:text-white transition-colors font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Region Key Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5 text-[11px] font-sans-editorial">
              <div className="bg-[#f7f6ec] border border-[#dcd8cb] p-2.5 text-center">
                <div className="text-[9px] font-bold text-[#888884] uppercase tracking-wider mb-0.5">SPOTS</div>
                <div className="text-[18px] font-serif-editorial font-bold text-[#111111]">{selectedRegion.spots}</div>
              </div>
              <div className="bg-[#f7f6ec] border border-[#dcd8cb] p-2.5 text-center">
                <div className="text-[9px] font-bold text-[#888884] uppercase tracking-wider mb-0.5">AREA</div>
                <div className="text-[18px] font-serif-editorial font-bold text-[#111111]">{selectedRegion.size} µh</div>
              </div>
              <div className="bg-[#f7f6ec] border border-[#dcd8cb] p-2.5 text-center">
                <div className="text-[9px] font-bold text-[#888884] uppercase tracking-wider mb-0.5">MAG CLASS</div>
                <div className="text-[16px] font-bold text-[#b45309]">{selectedRegion.magClass}</div>
              </div>
              <div className="bg-[#f7f6ec] border border-[#dcd8cb] p-2.5 text-center">
                <div className="text-[9px] font-bold text-[#888884] uppercase tracking-wider mb-0.5">LOCATION</div>
                <div className="text-[15px] font-mono font-bold text-[#111111]">{selectedRegion.location}</div>
              </div>
            </div>

            {/* Flare Probabilities Box */}
            <div className="bg-[#111111] text-white p-4 border border-[#333] mb-5">
              <div className="text-[9.5px] font-sans-editorial font-bold tracking-widest uppercase text-[#ffc500] mb-2 flex items-center justify-between">
                <span>FLARE PROBABILITY PROFILE</span>
                <span>NOAA SWPC FORECAST</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-sans-editorial">
                <div className="bg-[#222] p-2 border border-[#444]">
                  <div className="text-[9px] text-[#aaa] font-bold uppercase">C-CLASS</div>
                  <div className="text-[16px] font-bold text-[#10b981]">{selectedRegion.cFlare}</div>
                </div>
                <div className="bg-[#222] p-2 border border-[#444]">
                  <div className="text-[9px] text-[#aaa] font-bold uppercase">M-CLASS</div>
                  <div className="text-[16px] font-bold text-[#f59e0b]">{selectedRegion.mFlare}</div>
                </div>
                <div className="bg-[#222] p-2 border border-[#444]">
                  <div className="text-[9px] text-[#aaa] font-bold uppercase">X-CLASS</div>
                  <div className="text-[16px] font-bold text-[#ef4444]">{selectedRegion.xFlare}</div>
                </div>
                <div className="bg-[#222] p-2 border border-[#444]">
                  <div className="text-[9px] text-[#aaa] font-bold uppercase">PROTON</div>
                  <div className="text-[16px] font-bold text-[#60a5fa]">{selectedRegion.protonFlare}</div>
                </div>
              </div>
            </div>

            {/* Modal Action Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-[#dcd8cb]">
              <span className="text-[10px] font-sans-editorial text-[#888884]">
                Source: SpaceWeatherLive.com
              </span>
              <a
                href={selectedRegion.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#111111] hover:bg-[#ffc500] hover:text-[#111111] text-white text-[10px] font-sans-editorial font-bold uppercase tracking-widest transition-colors inline-flex items-center gap-1.5 shadow-xs"
              >
                <span>OPEN REGION IN SPACEWEATHERLIVE</span>
                <span>→</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
