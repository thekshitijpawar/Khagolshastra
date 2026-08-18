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
  published?: string
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
  title: 'Ep. 1: The Moon',
  description: "Fraser Cain and Dr. Pamela Gay explore Earth's closest celestial companion, the Moon.",
  audio_url: 'https://dts.podtrac.com/redirect.mp3/arttrk.com/p/ADCT2/pscrb.fm/rss/p/clrtpod.com/m/traffic.libsyn.com/secure/astronomycast/AstroCast-061218.mp3',
  duration: '28:15',
  show: 'Astronomy Cast',
  hosts: 'Fraser Cain & Dr. Pamela Gay',
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
    
    // Podcast fetch from dedicated Next.js endpoint
    fetch('/api/podcast', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.current && data.current.title) {
          setPodcast(data.current)
        }
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
          <span>FEATURED BROADCAST</span>
        </div>
      </div>

      {/* Astronomy Cast Program Block - Protected with overflow-hidden and min-w-0 to prevent wave animation overflow */}
      <div
        onClick={onOpenRadio}
        className="bg-[#202020] hover:bg-[#282828] border border-[#333333] hover:border-[#ffc500] p-3 flex items-center justify-between gap-3 cursor-pointer transition-colors overflow-hidden rounded-xs"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 bg-[#0f4c81] border border-[#ffc500]/40 flex flex-col items-center justify-center text-white shrink-0 p-1 rounded-xs">
            <span className="text-[13px]">🎙️</span>
            <span className="text-[7.5px] font-sans-editorial font-bold text-[#ffc500]">EP #{podcast.ep_number}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-[9px] font-sans-editorial font-bold tracking-widest text-[#ffc500] uppercase">
              <span>ASTRONOMY CAST</span>
              <span>•</span>
              <span className="text-[#888884]">Space Radio</span>
            </div>
            <div className="text-[13px] font-serif-editorial font-semibold text-white leading-tight truncate">
              {podcast.title}
            </div>
            <div className="text-[10px] text-[#999999] font-sans-editorial truncate">
              {podcast.hosts}
            </div>
          </div>
        </div>

        {/* Animated Sound Wave Graphic - Securely Pinned Inside Box */}
        <div className="flex items-end gap-1 h-5 shrink-0 pl-1">
          <span className="w-1 bg-[#ffc500] animate-wave-1 rounded-xs" />
          <span className="w-1 bg-[#ffc500] animate-wave-2 rounded-xs" />
          <span className="w-1 bg-[#ffc500] animate-wave-3 rounded-xs" />
          <span className="w-1 bg-[#ffc500] animate-wave-4 rounded-xs" />
        </div>
      </div>

      {/* Listen Live Button */}
      <button
        onClick={onOpenRadio}
        className="w-full bg-[#ffc500] hover:bg-[#f0ba00] text-[#111111] py-2.5 px-4 font-sans-editorial font-bold text-[12px] uppercase tracking-[0.14em] flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-sm cursor-pointer"
      >
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
        <span>LISTEN PODCAST ({podcast.duration})</span>
      </button>

      {/* Top of the Hour Wire */}
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
              className="group cursor-pointer border-b border-[#262626] pb-2.5 last:border-0 hover:bg-[#222222] hover:-translate-y-0.5 hover:shadow-xs p-1.5 rounded-xs transition-all duration-200 ease-out transform"
            >
              <div className="text-[12.5px] font-serif-editorial text-[#f0f0f0] group-hover:text-white leading-snug transition-colors line-clamp-2">
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
            <div className="text-[12px] font-bold text-[#ffc500]">{iss.altitude_km} km</div>
          </div>
          <div className="bg-[#111111] p-2 border border-[#282828]">
            <div className="text-[8px] text-[#888888] font-sans-editorial uppercase">SPEED</div>
            <div className="text-[12px] font-bold text-[#ffc500]">{iss.velocity_kmh.toLocaleString()} km/h</div>
          </div>
        </div>

        <div className="text-[9px] font-sans-editorial text-center text-[#777] flex items-center justify-between pt-1 border-t border-[#262626]">
          <span>ORBITAL SPEED: MACH {iss.velocity_mach}</span>
          <span className="text-emerald-400 font-bold">{iss.status}</span>
        </div>
      </div>

      {/* 🚀 LAUNCH RADAR & COUNTDOWN */}
      <div className="border-t border-[#2d2d2d] pt-3.5 bg-[#181818] p-3.5 border border-[#333333]">
        <div className="flex items-center justify-between text-[10px] font-sans-editorial font-bold tracking-widest uppercase mb-2">
          <div className="flex items-center gap-1.5 text-[#ffc500]">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>🚀 UPCOMING LAUNCH RADAR</span>
          </div>
          <span className="text-[#ffc500] text-[9px] bg-[#242424] px-1.5 py-0.5 border border-[#3a3a3a] font-bold">
            T-MINUS
          </span>
        </div>

        {/* Live Mission Card */}
        <div className="bg-[#111111] p-2.5 border border-[#282828] mb-2.5">
          <div className="text-[13px] font-serif-editorial font-bold text-white leading-snug line-clamp-1 mb-1">
            {nextLaunch?.title || 'Falcon 9 • Starlink Group 12-4 Mission'}
          </div>
          <div className="flex items-center justify-between text-[9px] font-sans-editorial text-[#999999]">
            <span>PAD: LC-39A (KSC, FL)</span>
            <span className="text-[#ffc500] font-bold">SPACEX / NASA</span>
          </div>
        </div>

        {/* Big Live Digital Clock */}
        <div className="bg-[#0d0d0d] p-2.5 border border-[#222222] flex items-center justify-around font-mono text-center mb-2">
          <div>
            <div className="text-[16px] font-bold text-white tracking-widest">
              {String(timeLeft.hours).padStart(2, '0')}
            </div>
            <div className="text-[8px] text-[#888888] font-sans-editorial uppercase tracking-wider">HOURS</div>
          </div>
          <span className="text-[#ffc500] text-lg font-bold pb-2">:</span>
          <div>
            <div className="text-[16px] font-bold text-white tracking-widest">
              {String(timeLeft.minutes).padStart(2, '0')}
            </div>
            <div className="text-[8px] text-[#888888] font-sans-editorial uppercase tracking-wider">MINS</div>
          </div>
          <span className="text-[#ffc500] text-lg font-bold pb-2">:</span>
          <div>
            <div className="text-[16px] font-bold text-[#ffc500] tracking-widest">
              {String(timeLeft.seconds).padStart(2, '0')}
            </div>
            <div className="text-[8px] text-[#888888] font-sans-editorial uppercase tracking-wider">SECS</div>
          </div>
        </div>

        <div className="text-[9px] font-sans-editorial text-center text-[#777] flex items-center justify-between pt-1 border-t border-[#262626]">
          <span>PAYLOAD: 23 STARLINK V2 MINI</span>
          <span className="text-emerald-400 font-bold">GO FOR LAUNCH</span>
        </div>
      </div>
    </div>
  )
}
