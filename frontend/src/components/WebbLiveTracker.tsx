'use client'

import { useState, useEffect } from 'react'

interface WebbData {
  target: string
  target_category: string
  instruments: string[]
  proposal_id: string
  proposal_title: string
  pi_name: string
  category: string
  duration: string
  ra: string
  dec: string
  status: string
  telescope: string
  location: string
  source_url?: string
}

const DEFAULT_WEBB: WebbData = {
  target: 'P330E',
  target_category: 'Stars And Stellar Populations',
  instruments: ['NIRSpec'],
  proposal_id: '11441',
  proposal_title: 'The JWST Spectral Library for Cool Stars',
  pi_name: 'Dr. Mark S. Giampapa',
  category: 'Stars And Stellar Populations',
  duration: '1h 30m 4s',
  ra: '247.89°',
  dec: '30.15°',
  status: 'LIVE OBSERVATION',
  telescope: 'James Webb Space Telescope (JWST)',
  location: 'Sun-Earth L2 Lagrange Point (1.5M km)',
  source_url: 'https://spacetelescopelive.org/webb?obsId=01M040JJSZARZ35VYT37YGY0JQ',
}

export default function WebbLiveTracker() {
  const [data, setData] = useState<WebbData>(DEFAULT_WEBB)
  const [modalOpen, setModalOpen] = useState(false)

  const fetchLiveWebb = async () => {
    try {
      const res = await fetch('/api/webb', { cache: 'no-store' })
      if (res.ok) {
        const json = await res.json()
        if (json && json.target) {
          setData(json)
        }
      }
    } catch {
      // Handled silently
    }
  }

  useEffect(() => {
    fetchLiveWebb()
    // Poll every 60 seconds for live updates
    const interval = setInterval(fetchLiveWebb, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      {/* Editorial Masthead Webb Tracker Box */}
      <div
        onClick={() => setModalOpen(true)}
        className="group cursor-pointer flex items-center gap-3 p-1.5 -m-1.5 rounded-xs hover:bg-[#f7f6ec] transition-colors select-none"
        title="Click to view full live JWST observatory telemetry"
      >
        {/* Stamp Icon with Rotating JWST Telescope Illustration */}
        <div className="w-12 h-14 border border-[#111111] flex flex-col items-center justify-center p-0.5 bg-[#ffffff] shadow-xs group-hover:border-[#ffc500] transition-colors shrink-0">
          <div className="w-full h-full border border-dashed border-[#888884] flex flex-col items-center justify-between p-0.5 bg-[#fdfcf4] overflow-hidden">
            <div className="w-full h-7 flex items-center justify-center relative overflow-hidden">
              <img
                src="/jwst-telescope.png"
                alt="James Webb Space Telescope"
                className="w-7 h-7 object-contain animate-[spin_10s_linear_infinite]"
              />
            </div>
            <span className="text-[6.5px] font-sans-editorial font-bold tracking-tighter text-[#111111] uppercase bg-[#ffc500] w-full text-center py-0.5">
              JWST • L2
            </span>
          </div>
        </div>

        {/* Telemetry Labels */}
        <div className="text-[11px] font-sans-editorial text-[#555555] leading-[1.3]">
          {/* Top Label */}
          <div className="font-bold tracking-wider uppercase text-[10px] text-[#111111]">
            WEBB LIVE TARGET
          </div>

          {/* Current Target */}
          <div className="font-serif-editorial font-bold text-[13px] text-[#111111] leading-tight group-hover:text-[#555555] transition-colors truncate max-w-[200px]">
            {data.target}
          </div>

          {/* Instrument & Proposal */}
          <div className="text-[#777777] text-[10px] truncate max-w-[200px]">
            {data.instruments.join('+')} • Prop #{data.proposal_id}
          </div>
        </div>
      </div>

      {/* Interactive Modal Telemetry Drawer */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-[#fdfcf4] text-[#111111] max-w-lg w-full border-2 border-[#111111] shadow-2xl p-6 sm:p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b-2 border-[#111111] pb-3 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 border border-[#111] bg-white p-1 flex items-center justify-center shrink-0">
                  <img
                    src="/jwst-telescope.png"
                    alt="JWST"
                    className="w-full h-full object-contain animate-[spin_12s_linear_infinite]"
                  />
                </div>
                <div>
                  <div className="text-[10px] font-sans-editorial font-bold tracking-widest text-[#ffc500] bg-[#111111] px-2 py-0.5 inline-block">
                    OBSERVATORY TELEMETRY
                  </div>
                  <div className="text-[13px] font-serif-editorial font-bold text-[#111111] mt-0.5">
                    James Webb Space Telescope (JWST)
                  </div>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-7 h-7 flex items-center justify-center border border-[#111111] bg-white hover:bg-[#111111] hover:text-white transition-colors font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {/* Target Highlight Box */}
            <div className="bg-[#111111] text-white p-5 border border-[#333] mb-5">
              <div className="flex items-center justify-between text-[10px] font-sans-editorial tracking-widest uppercase text-[#ffc500] mb-1">
                <span>ACTIVE SKY TARGET</span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#00ff66] animate-ping" />
                  REAL-TIME POINTING
                </span>
              </div>
              <h3 className="text-[24px] font-serif-editorial font-normal text-white mb-1">
                {data.target}
              </h3>
              <div className="text-[12px] font-sans-editorial text-[#cccccc]">
                Category: <span className="text-white font-bold">{data.target_category}</span> ({data.category})
              </div>
            </div>

            {/* Scientific Parameters Grid */}
            <div className="grid grid-cols-2 gap-3 text-[11px] font-sans-editorial mb-5">
              <div className="bg-[#f7f6ec] border border-[#dcd8cb] p-3">
                <div className="text-[9px] font-bold text-[#888884] uppercase tracking-wider mb-0.5">
                  ACTIVE INSTRUMENTS
                </div>
                <div className="font-bold text-[#111111] text-[12px]">
                  {data.instruments.join(', ')}
                </div>
              </div>

              <div className="bg-[#f7f6ec] border border-[#dcd8cb] p-3">
                <div className="text-[9px] font-bold text-[#888884] uppercase tracking-wider mb-0.5">
                  SKY COORDINATES
                </div>
                <div className="font-mono text-[#111111] text-[11px]">
                  RA: {data.ra} | Dec: {data.dec}
                </div>
              </div>

              <div className="bg-[#f7f6ec] border border-[#dcd8cb] p-3">
                <div className="text-[9px] font-bold text-[#888884] uppercase tracking-wider mb-0.5">
                  PRINCIPAL INVESTIGATOR
                </div>
                <div className="font-serif-editorial font-bold text-[#111111] text-[12px]">
                  {data.pi_name}
                </div>
              </div>

              <div className="bg-[#f7f6ec] border border-[#dcd8cb] p-3">
                <div className="text-[9px] font-bold text-[#888884] uppercase tracking-wider mb-0.5">
                  ORBITAL POSITION
                </div>
                <div className="font-sans-editorial font-bold text-[#111111] text-[11px]">
                  L2 Halo Orbit (~1.5M km)
                </div>
              </div>
            </div>

            {/* Proposal Details */}
            <div className="bg-[#f7f6ec] border border-[#dcd8cb] p-3.5 mb-6 text-[12px] font-serif-editorial">
              <div className="text-[9px] font-sans-editorial font-bold uppercase tracking-wider text-[#888884] mb-1">
                SCIENCE INVESTIGATION • PROPOSAL #{data.proposal_id}
              </div>
              <p className="text-[#333333] leading-snug italic">
                &ldquo;{data.proposal_title}&rdquo;
              </p>
            </div>

            {/* Footer Action */}
            <div className="flex items-center justify-between pt-3 border-t border-[#dcd8cb]">
              <span className="text-[10px] font-sans-editorial text-[#888884]">
                Source: Space Telescope Science Institute (STScI)
              </span>
              <a
                href={data.source_url || 'https://spacetelescopelive.org/webb'}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#111111] hover:bg-[#ffc500] hover:text-[#111111] text-white text-[10px] font-sans-editorial font-bold uppercase tracking-widest transition-colors inline-flex items-center gap-1.5 shadow-xs"
              >
                <span>OPEN SPACE TELESCOPE LIVE</span>
                <span>→</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
