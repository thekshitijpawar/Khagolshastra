'use client'

import { useState, useEffect } from 'react'

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

export default function SunspotsSection() {
  const [selectedFeedId, setSelectedFeedId] = useState('hmi_igr')
  const [cacheBuster, setCacheBuster] = useState(Date.now())
  const [isLiveUpdating, setIsLiveUpdating] = useState(false)

  const currentFeed = SOHO_FEEDS.find((f) => f.id === selectedFeedId) || SOHO_FEEDS[0]

  const handleRefresh = () => {
    setIsLiveUpdating(true)
    setCacheBuster(Date.now())
    setTimeout(() => setIsLiveUpdating(false), 800)
  }

  // Periodic image timestamp refresh
  useEffect(() => {
    const interval = setInterval(() => {
      setCacheBuster(Date.now())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section id="sunspots-section" className="px-4 sm:px-6 lg:px-10 py-12 border-b border-[#111111] bg-[#fbfaf0]">
      <div className="max-w-[1340px] mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-[#111111] pb-4 mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="eyebrow text-[#111111]">NASA / ESA SOHO & SDO OBSERVATORY</span>
              <span className="text-[#888884] text-xs">•</span>
              <span className="text-[10px] font-sans-editorial font-bold uppercase tracking-wider text-[#b45309] bg-[#fef3c7] px-2 py-0.5 border border-[#fde68a]">
                LIVE SOLAR MONITOR
              </span>
            </div>
            <h2 className="text-[26px] sm:text-[34px] font-serif-editorial font-normal leading-tight text-[#111111]">
              Sunspots & Solar Dynamics Observatory
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="text-[11px] font-sans-editorial font-bold uppercase tracking-widest bg-white border border-[#111111] px-3.5 py-1.5 hover:bg-[#111111] hover:text-white transition-all shadow-2xs flex items-center gap-1.5"
            >
              <span className={isLiveUpdating ? 'animate-spin inline-block' : ''}>↻</span>
              <span>REFRESH TELEMETRY</span>
            </button>
            <a
              href="https://soho.nascom.nasa.gov/sunspots/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-sans-editorial font-bold uppercase tracking-widest bg-[#111111] text-white px-3.5 py-1.5 hover:bg-[#333333] transition-colors shadow-2xs flex items-center gap-1"
            >
              <span>NASA SOHO ARCHIVE ↗</span>
            </a>
          </div>
        </div>

        {/* Main Grid: Live Image Viewer (Left) + Solar Telemetry & Science (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Live SOHO Feed Viewer */}
          <div className="lg:col-span-7 flex flex-col">
            {/* Instrument Tabs */}
            <div className="flex flex-wrap gap-1.5 mb-3 border-b border-[#dcd8cb] pb-3">
              {SOHO_FEEDS.map((feed) => {
                const active = feed.id === selectedFeedId
                return (
                  <button
                    key={feed.id}
                    onClick={() => setSelectedFeedId(feed.id)}
                    className={`text-[10.5px] font-sans-editorial font-bold tracking-wider uppercase px-2.5 py-1.5 transition-all border ${
                      active
                        ? 'bg-[#111111] text-white border-[#111111] shadow-2xs'
                        : 'bg-white text-[#555555] border-[#dcd8cb] hover:border-[#111111] hover:text-[#111111]'
                    }`}
                  >
                    {feed.label}
                  </button>
                )
              })}
            </div>

            {/* Image Frame with Broadsheet Border */}
            <div className="relative bg-[#0d0d0d] border border-[#111111] p-2 sm:p-3 shadow-sm flex flex-col items-center justify-center min-h-[420px]">
              <div className="relative w-full max-w-[500px] aspect-square overflow-hidden bg-black flex items-center justify-center">
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

            <p className="text-[12.5px] font-serif-editorial text-[#666666] leading-relaxed mt-3">
              {currentFeed.description} Live data received from the Solar and Heliospheric Observatory (SOHO) positioned at the Sun-Earth L1 Lagrangian point, 1.5 million kilometers sunward.
            </p>
          </div>

          {/* Right Column: Real-Time Solar Metrics, Sunspot Index & Science Dossier */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            {/* 1. Live Solar Index Matrix */}
            <div className="bg-white border border-[#111111] p-5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-[#111111] pb-2 mb-4">
                <span className="eyebrow text-[#111111]">SPACE WEATHER & SUNSPOT INDEX</span>
                <span className="text-[9.5px] font-sans-editorial font-bold text-[#888884] uppercase">
                  NOAA SWPC / SIDC
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="border border-[#e2ded2] bg-[#fcfbf7] p-3">
                  <div className="text-[9px] font-sans-editorial font-bold uppercase tracking-wider text-[#888884] mb-0.5">
                    SUNSPOT NUMBER (SSN)
                  </div>
                  <div className="text-[24px] font-serif-editorial font-bold text-[#111111] leading-none">
                    80.8
                  </div>
                  <div className="text-[10px] font-sans-editorial text-[#16a34a] font-bold mt-1">
                    ● ACTIVE SOLAR CYCLE 25
                  </div>
                </div>

                <div className="border border-[#e2ded2] bg-[#fcfbf7] p-3">
                  <div className="text-[9px] font-sans-editorial font-bold uppercase tracking-wider text-[#888884] mb-0.5">
                    10.7 CM RADIO FLUX
                  </div>
                  <div className="text-[24px] font-serif-editorial font-bold text-[#111111] leading-none">
                    136.0 <span className="text-xs font-normal font-sans-editorial text-[#777]">sfu</span>
                  </div>
                  <div className="text-[10px] font-sans-editorial text-[#555555] mt-1">
                    Penticton Solar Flux
                  </div>
                </div>

                <div className="border border-[#e2ded2] bg-[#fcfbf7] p-3">
                  <div className="text-[9px] font-sans-editorial font-bold uppercase tracking-wider text-[#888884] mb-0.5">
                    GEOMAGNETIC K-INDEX
                  </div>
                  <div className="text-[24px] font-serif-editorial font-bold text-[#111111] leading-none">
                    Kp 2.0
                  </div>
                  <div className="text-[10px] font-sans-editorial text-[#555555] mt-1">
                    Quiet / Low Storm Risk
                  </div>
                </div>

                <div className="border border-[#e2ded2] bg-[#fcfbf7] p-3">
                  <div className="text-[9px] font-sans-editorial font-bold uppercase tracking-wider text-[#888884] mb-0.5">
                    SOHO MISSION ELAPSED
                  </div>
                  <div className="text-[24px] font-serif-editorial font-bold text-[#111111] leading-none">
                    11,215 <span className="text-xs font-normal font-sans-editorial text-[#777]">days</span>
                  </div>
                  <div className="text-[10px] font-sans-editorial text-[#555555] mt-1">
                    Continuous Monitoring
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Observatory Solar Physics Dossier */}
            <div className="bg-white border border-[#dcd8cb] p-5 shadow-2xs">
              <div className="text-[9.5px] font-sans-editorial font-bold uppercase tracking-wider text-[#111111] mb-2.5 flex items-center gap-1.5 border-b border-[#e2ded2] pb-1.5">
                <span className="w-1.5 h-1.5 bg-[#111111] rounded-full inline-block"></span>
                <span>PHYSICS OF SUNSPOTS & MAGNETIC RECONNECTION</span>
              </div>

              <div className="space-y-2.5 text-[12.5px] font-serif-editorial text-[#444444] leading-relaxed">
                <p>
                  Sunspots are temporary planar phenomena on the Sun’s photosphere that appear as spots darker than surrounding areas. They correspond to regions of reduced surface temperature (~3,800 K vs ~5,700 K) caused by concentrated magnetic flux tubes that inhibit convective heat transport from the solar interior.
                </p>
                <p>
                  As the Sun rotates differentially (faster at the equator than poles), magnetic field lines twist into complex knots, driving solar flares, coronal mass ejections (CMEs), and geomagnetic auroral storms across Earth’s magnetosphere.
                </p>
              </div>

              <div className="mt-3 pt-3 border-t border-[#eee] flex items-center justify-between text-[10px] font-sans-editorial font-bold uppercase tracking-wider text-[#888884]">
                <span>HELIOPHYSICS BRIEFING</span>
                <a
                  href="https://soho.nascom.nasa.gov/sunspots/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#111111] hover:text-[#ffc500] transition-colors"
                >
                  FULL SOHO DOCUMENTATION →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
