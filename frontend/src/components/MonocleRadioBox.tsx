'use client'

import { useState, useEffect } from 'react'
import { Article } from '@/types'

interface MonocleRadioBoxProps {
  onOpenRadio: () => void
  onOpenArticle: (article: Article) => void
  breakingArticles: Article[]
  launchArticles: Article[]
}

interface PodcastEpisode {
  id: string
  ep_number: number
  title: string
  description: string
  audio_url: string
  duration: string
  show: string
  hosts: string
  hours_until_next_rotation?: number
}

interface IssTelemetry {
  name: string
  latitude: number
  longitude: number
  altitude_km: number
  velocity_kmh: number
  velocity_mach: number
  visibility: string
  region: string
  crew_count: number
  expedition: string
  status: string
}

const DEFAULT_PODCAST: PodcastEpisode = {
  id: 'ac-1',
  ep_number: 1,
  title: 'Episode 1: The Moon',
  description: "Fraser Cain and Dr. Pamela Gay explore Earth's closest celestial companion, the Moon.",
  audio_url: 'https://dts.podtrac.com/redirect.mp3/arttrk.com/p/ADCT2/pscrb.fm/rss/p/clrtpod.com/m/traffic.libsyn.com/secure/astronomycast/AstroCast-061218.mp3',
  duration: '28:15',
  show: 'Astronomy Cast',
  hosts: 'Fraser Cain & Dr. Pamela Gay',
  hours_until_next_rotation: 33,
}

const DEFAULT_ISS: IssTelemetry = {
  name: 'International Space Station',
  latitude: 28.524,
  longitude: -80.651,
  altitude_km: 418,
  velocity_kmh: 27580,
  velocity_mach: 23,
  visibility: 'Daylight',
  region: 'North America & Atlantic',
  crew_count: 7,
  expedition: 'Expedition 72',
  status: 'NOMINAL ORBIT',
}

export default function MonocleRadioBox({
  onOpenRadio,
  onOpenArticle,
  breakingArticles = [],
  launchArticles = [],
}: MonocleRadioBoxProps) {
  const [podcast, setPodcast] = useState<PodcastEpisode>(DEFAULT_PODCAST)
  const [iss, setIss] = useState<IssTelemetry>(DEFAULT_ISS)

  // Countdown timer for next simulated rocket launch
  const [timeLeft, setTimeLeft] = useState({
    hours: 14,
    minutes: 32,
    seconds: 45,
  })

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    
    // Podcast fetch
    fetch(`${apiUrl}/api/podcast/current`, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.title) setPodcast(data)
      })
      .catch(() => {})

    // ISS Live Telemetry poll function
    const fetchIss = () => {
      fetch('/api/iss')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && typeof data.latitude === 'number') {
            setIss(data)
          }
        })
        .catch(() => {})
    }

    fetchIss()
    const issInterval = setInterval(fetchIss, 4000)

    // Launch countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 }
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        return { hours: 24, minutes: 0, seconds: 0 }
      })
    }, 1000)

    return () => {
      clearInterval(timer)
      clearInterval(issInterval)
    }
  }, [])

  // 3 top of the hour breaking headlines to perfectly match the column area
  const topNews = breakingArticles.slice(0, 3)
  const nextLaunch = launchArticles[0]

  return (
    <div className="bg-[#141414] text-white p-5 sm:p-6 border border-[#111111] shadow-md flex flex-col space-y-5">
      {/* Header Ribbon */}
      <div className="flex items-center justify-between border-b border-[#2d2d2d] pb-3">
        <div className="text-[12px] font-sans-editorial font-bold uppercase tracking-[0.16em] text-white flex items-center gap-2">
          <span>KHAGOLSHASTRA RADIO</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-sans-editorial font-bold text-[#ffc500]">
          <span className="w-2 h-2 rounded-full bg-[#ffc500] animate-ping" />
          <span>2-DAY ROTATION</span>
        </div>
      </div>

      {/* Astronomy Cast Program Block */}
      <div
        onClick={onOpenRadio}
        className="bg-[#202020] hover:bg-[#282828] border border-[#333333] hover:border-[#ffc500] p-3.5 flex items-center justify-between gap-3 cursor-pointer transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-[#0f4c81] border border-[#ffc500]/40 flex flex-col items-center justify-center text-white shrink-0 p-1">
            <span className="text-[14px]">🎙️</span>
            <span className="text-[7px] font-sans-editorial font-bold text-[#ffc500]">EP #{podcast.ep_number}</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[9px] font-sans-editorial font-bold tracking-widest text-[#ffc500] uppercase">
              <span>ASTRONOMY CAST</span>
              <span>•</span>
              <span className="text-[#888884]">{podcast.hours_until_next_rotation ? `Next in ${podcast.hours_until_next_rotation}h` : 'Active'}</span>
            </div>
            <div className="text-[13px] font-serif-editorial font-semibold text-white leading-tight truncate">
              {podcast.title}
            </div>
            <div className="text-[10px] text-[#999999] font-sans-editorial truncate">
              {podcast.hosts}
            </div>
          </div>
        </div>

        <div className="flex items-end gap-1 h-5 pr-1 shrink-0">
          <span className="w-1 bg-[#ffc500] animate-wave-1 rounded-xs" />
          <span className="w-1 bg-[#ffc500] animate-wave-2 rounded-xs" />
          <span className="w-1 bg-[#ffc500] animate-wave-3 rounded-xs" />
          <span className="w-1 bg-[#ffc500] animate-wave-4 rounded-xs" />
        </div>
      </div>

      {/* Listen Live Button */}
      <button
        onClick={onOpenRadio}
        className="w-full bg-[#ffc500] hover:bg-[#f0ba00] text-[#111111] py-2.5 px-4 font-sans-editorial font-bold text-[12px] uppercase tracking-[0.14em] flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-sm"
      >
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
        <span>LISTEN PODCAST ({podcast.duration})</span>
      </button>

      {/* Top of the Hour Wire (Expanded with 6 breaking headlines) */}
      <div className="border-t border-[#2d2d2d] pt-3.5">
        <div className="text-[10px] font-sans-editorial font-bold tracking-[0.15em] uppercase text-[#ffc500] mb-2.5 flex items-center justify-between">
          <span>TOP OF THE HOUR DISPATCHES</span>
          <span className="text-[#888888] font-normal">Live Global Wire</span>
        </div>

        <div className="space-y-3">
          {topNews.map((art, idx) => (
            <div
              key={art.id || idx}
              onClick={() => onOpenArticle(art)}
              className="group cursor-pointer border-b border-[#262626] pb-2.5 last:border-0 hover:bg-[#1a1a1a] p-1.5 rounded-xs transition-colors"
            >
              <div className="text-[12.5px] font-serif-editorial text-[#e0e0e0] group-hover:text-[#ffc500] leading-snug transition-colors line-clamp-2">
                {art.title}
              </div>
              <div className="text-[10px] font-sans-editorial text-[#777777] mt-1 flex items-center justify-between">
                <span className="text-[#999999] uppercase">{art.sourceName || 'Astronomy Wire'}</span>
                <span suppressHydrationWarning className="text-[#ffc500]">
                  {mounted && art.publishedAt
                    ? new Date(art.publishedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
                    : 'Live'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🛰️ ISS LIVE ORBITAL TRACKER WIDGET */}
      <div className="border-t border-[#2d2d2d] pt-3.5 bg-[#181818] p-3.5 border border-[#333333]">
        <div className="flex items-center justify-between text-[10px] font-sans-editorial font-bold tracking-widest uppercase mb-2">
          <div className="flex items-center gap-1.5 text-[#ffc500]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>🛰️ ISS LIVE ORBITAL TRACKER</span>
          </div>
          <span className="text-[#aaa] text-[9px] bg-[#242424] px-1.5 py-0.5 border border-[#3a3a3a]">
            {iss.expedition}
          </span>
        </div>

        {/* Current Ground Sector Pass */}
        <div className="bg-[#111111] p-2.5 border border-[#282828] mb-2.5">
          <div className="flex items-center justify-between text-[9px] font-sans-editorial uppercase text-[#888888] mb-1">
            <span>CURRENT GROUND SECTOR PASS</span>
            <span className={iss.visibility === 'Daylight' ? 'text-amber-300 font-bold' : 'text-indigo-300 font-bold'}>
              {iss.visibility === 'Daylight' ? '☀️ DAYLIGHT' : '🌑 ECLIPSE'}
            </span>
          </div>
          <div className="text-[13px] font-serif-editorial font-bold text-white flex items-center gap-1.5 truncate">
            <span className="text-[#ffc500]">📍</span>
            <span className="truncate">{iss.region}</span>
          </div>
        </div>

        {/* Live Coordinates & Telemetry Grid */}
        <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-mono mb-2">
          <div className="bg-[#111111] p-2 border border-[#282828]">
            <div className="text-[8px] text-[#888888] font-sans-editorial uppercase">LATITUDE</div>
            <div className="text-[12px] font-bold text-white tracking-wider">
              {iss.latitude > 0 ? `${iss.latitude}° N` : `${Math.abs(iss.latitude)}° S`}
            </div>
          </div>
          <div className="bg-[#111111] p-2 border border-[#282828]">
            <div className="text-[8px] text-[#888888] font-sans-editorial uppercase">LONGITUDE</div>
            <div className="text-[12px] font-bold text-white tracking-wider">
              {iss.longitude > 0 ? `${iss.longitude}° E` : `${Math.abs(iss.longitude)}° W`}
            </div>
          </div>
          <div className="bg-[#111111] p-2 border border-[#282828]">
            <div className="text-[8px] text-[#888888] font-sans-editorial uppercase">ALTITUDE</div>
            <div className="text-[12px] font-bold text-[#ffc500]">
              {iss.altitude_km} KM
            </div>
          </div>
          <div className="bg-[#111111] p-2 border border-[#282828]">
            <div className="text-[8px] text-[#888888] font-sans-editorial uppercase">VELOCITY</div>
            <div className="text-[12px] font-bold text-[#ffc500]">
              {iss.velocity_kmh.toLocaleString()} KM/H
            </div>
          </div>
        </div>

        {/* Station Status Meta */}
        <div className="flex items-center justify-between text-[9px] font-sans-editorial uppercase text-[#888888] pt-1">
          <span>CREW: {iss.crew_count} ASTRONAUTS</span>
          <span className="text-emerald-400 font-bold">● {iss.status}</span>
        </div>
      </div>

      {/* Rocket Launch Radar Box */}
      <div className="bg-[#1a1a1a] p-3.5 border border-[#333]">
        <div className="flex items-center justify-between text-[10px] font-sans-editorial font-bold tracking-widest uppercase text-[#ffc500] mb-2">
          <span>🚀 ROCKET LAUNCH RADAR</span>
          <span className="text-white bg-[#333] px-1.5 py-0.5 text-[9px]">T-MINUS</span>
        </div>

        <div className="text-[13px] font-serif-editorial font-bold text-white line-clamp-1 mb-1">
          {nextLaunch?.title || 'Falcon 9 • Starlink Group 12 Mission'}
        </div>

        <div className="text-[11px] text-[#aaaaaa] font-sans-editorial mb-2 line-clamp-1">
          Cape Canaveral Space Force Station, SLC-40
        </div>

        {/* Countdown Clock */}
        <div className="grid grid-cols-3 gap-2 text-center bg-[#111111] p-2 border border-[#2a2a2a] font-mono">
          <div>
            <div className="text-[15px] font-bold text-[#ffc500]">
              {String(timeLeft.hours).padStart(2, '0')}
            </div>
            <div className="text-[8px] text-[#777] font-sans-editorial uppercase">HRS</div>
          </div>
          <div>
            <div className="text-[15px] font-bold text-[#ffc500]">
              {String(timeLeft.minutes).padStart(2, '0')}
            </div>
            <div className="text-[8px] text-[#777] font-sans-editorial uppercase">MIN</div>
          </div>
          <div>
            <div className="text-[15px] font-bold text-[#ffc500]">
              {String(timeLeft.seconds).padStart(2, '0')}
            </div>
            <div className="text-[8px] text-[#777] font-sans-editorial uppercase">SEC</div>
          </div>
        </div>
      </div>

      {/* Program Guide Footer Link */}
      <div className="pt-3 border-t border-[#2d2d2d] text-center">
        <a
          href="#launches-section"
          className="text-[11px] font-sans-editorial font-bold uppercase tracking-widest text-[#cccccc] hover:text-[#ffc500] transition-colors inline-flex items-center gap-1"
        >
          <span>VIEW FULL PROGRAMME & MANIFEST</span>
          <span>→</span>
        </a>
      </div>
    </div>
  )
}
