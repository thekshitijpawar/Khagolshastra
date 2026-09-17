'use client'

import { useEffect, useRef, useState } from 'react'

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
  image?: string
}

interface RadioPlayerModalProps {
  isOpen: boolean
  onClose: () => void
}

function getCleanAudioUrl(url: string): string {
  if (!url) return ''
  if (url.includes('traffic.libsyn.com')) {
    const match = url.match(/traffic\.libsyn\.com\/[^\s\?]+/i)
    if (match) return `https://${match[0]}`
  }
  return url
}

function getStreamProxyUrl(rawUrl: string): string {
  if (!rawUrl) return ''
  const clean = getCleanAudioUrl(rawUrl)
  return `/api/podcast/stream?url=${encodeURIComponent(clean)}`
}

const DEFAULT_EPISODES: PodcastEpisode[] = [
  {
    id: 'ac-1',
    ep_number: 1,
    title: 'Ep. 1: The Moon',
    description: "Fraser Cain and Dr. Pamela Gay explore Earth's closest celestial companion, the Moon — its origin, geology, tidal effects, and human exploration history.",
    audio_url: 'https://traffic.libsyn.com/secure/astronomycast/AstroCast-061218.mp3',
    duration: '28:15',
    show: 'Astronomy Cast',
    hosts: 'Fraser Cain & Dr. Pamela Gay',
  },
  {
    id: 'ac-2',
    ep_number: 2,
    title: 'Ep. 2: Getting Around the Solar System',
    description: 'How spacecraft navigate gravity assists, Hohmann transfer orbits, and propulsion physics to travel across the vast distances of our solar system.',
    audio_url: 'https://traffic.libsyn.com/secure/astronomycast/AstroCast-080414.mp3',
    duration: '40:21',
    show: 'Astronomy Cast',
    hosts: 'Fraser Cain & Dr. Pamela Gay',
  },
  {
    id: 'ac-3',
    ep_number: 3,
    title: 'Ep. 3: Solar Activity & Space Weather',
    description: 'Exploring sunspots, coronal mass ejections, magnetic reconnection, and how the Sun impacts Earth and satellite constellations.',
    audio_url: 'https://traffic.libsyn.com/secure/astronomycast/AstroCast-111107.mp3',
    duration: '31:06',
    show: 'Astronomy Cast',
    hosts: 'Fraser Cain & Dr. Pamela Gay',
  },
  {
    id: 'ac-4',
    ep_number: 4,
    title: 'Ep. 4: Astrophotography (Pt. 1: The Gear)',
    description: 'What telescopes, mounts, sensors, filters, and guide cameras are needed to capture deep sky objects from your backyard observatory.',
    audio_url: 'https://traffic.libsyn.com/secure/astronomycast/AstroCast-111114.mp3',
    duration: '28:53',
    show: 'Astronomy Cast',
    hosts: 'Fraser Cain & Dr. Pamela Gay',
  },
  {
    id: 'ac-5',
    ep_number: 5,
    title: 'Ep. 5: Astrophotography (Pt. 2: Techniques)',
    description: 'Polar alignment, tracking, exposure times, dark frames, bias frames, and calibration methods to maximize signal-to-noise ratio.',
    audio_url: 'https://traffic.libsyn.com/secure/astronomycast/AstroCast-111121.mp3',
    duration: '36:34',
    show: 'Astronomy Cast',
    hosts: 'Fraser Cain & Dr. Pamela Gay',
  },
  {
    id: 'ac-6',
    ep_number: 6,
    title: 'Ep. 6: Astrophotography (Pt. 3: Image Processing)',
    description: 'Stacking, wavelet processing, color mapping, and stretching raw pixel data to reveal faint emission nebulae and galaxies.',
    audio_url: 'https://traffic.libsyn.com/secure/astronomycast/AstroCast-111128.mp3',
    duration: '29:38',
    show: 'Astronomy Cast',
    hosts: 'Fraser Cain & Dr. Pamela Gay',
  },
  {
    id: 'ac-7',
    ep_number: 7,
    title: 'Ep. 7: The Torino Scale & Near-Earth Asteroids',
    description: 'Quantifying asteroid impact hazards, assessing orbital trajectories, and planetary defense deflection strategies.',
    audio_url: 'https://traffic.libsyn.com/secure/astronomycast/AstroCast-1111205.mp3',
    duration: '27:42',
    show: 'Astronomy Cast',
    hosts: 'Fraser Cain & Dr. Pamela Gay',
  },
  {
    id: 'ac-8',
    ep_number: 8,
    title: 'Ep. 8: The Tunguska Event',
    description: 'Analyzing the 1908 atmospheric airburst in Siberia, shockwave physics, and what it teaches us about comet and asteroid fragment entries.',
    audio_url: 'https://traffic.libsyn.com/secure/astronomycast/AstroCast-111212.mp3',
    duration: '28:53',
    show: 'Astronomy Cast',
    hosts: 'Fraser Cain & Dr. Pamela Gay',
  },
]

export default function RadioPlayerModal({ isOpen, onClose }: RadioPlayerModalProps) {
  const [currentEpisode, setCurrentEpisode] = useState<PodcastEpisode>(DEFAULT_EPISODES[0])
  const [allEpisodes, setAllEpisodes] = useState<PodcastEpisode[]>(DEFAULT_EPISODES)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(1695) // ~28:15 default
  const [volume, setVolume] = useState(0.8)
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0)
  const [showArchive, setShowArchive] = useState(false)
  const [usingDirectFallback, setUsingDirectFallback] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Fetch active episode & archive catalogue from Next.js API
  useEffect(() => {
    fetch('/api/podcast', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          if (data.current) setCurrentEpisode(data.current)
          if (data.episodes && data.episodes.length > 0) setAllEpisodes(data.episodes)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === ' ') {
        e.preventDefault()
        togglePlay()
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isPlaying])

  const activeAudioSource = usingDirectFallback
    ? getCleanAudioUrl(currentEpisode.audio_url)
    : getStreamProxyUrl(currentEpisode.audio_url)

  const togglePlay = () => {
    if (!audioRef.current) return
    const el = audioRef.current

    if (isPlaying) {
      el.pause()
      setIsPlaying(false)
    } else {
      // Ensure source is loaded if empty or changed
      if (!el.src || !el.src.includes(encodeURIComponent(getCleanAudioUrl(currentEpisode.audio_url)))) {
        el.src = activeAudioSource
      }
      el.playbackRate = playbackSpeed
      el.volume = volume

      el.play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn('Playback request error:', err)
          if (!usingDirectFallback) {
            setUsingDirectFallback(true)
            el.src = getCleanAudioUrl(currentEpisode.audio_url)
            el.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
          } else {
            setIsPlaying(false)
          }
        })
    }
  }

  const handleAudioError = () => {
    if (!audioRef.current || usingDirectFallback) return
    console.warn('Audio proxy stream failed, falling back to direct CDN link...')
    setUsingDirectFallback(true)
    const el = audioRef.current
    el.src = getCleanAudioUrl(currentEpisode.audio_url)
    el.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
      if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
        setDuration(audioRef.current.duration)
      }
    }
  }

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol)
    if (audioRef.current) {
      audioRef.current.volume = newVol
    }
  }

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed)
    if (audioRef.current) {
      audioRef.current.playbackRate = speed
    }
  }

  const selectEpisode = (ep: PodcastEpisode) => {
    setCurrentEpisode(ep)
    setCurrentTime(0)
    setUsingDirectFallback(false)

    if (audioRef.current) {
      const el = audioRef.current
      const newSource = getStreamProxyUrl(ep.audio_url)
      el.src = newSource
      el.playbackRate = playbackSpeed
      el.volume = volume
      el.play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          setUsingDirectFallback(true)
          el.src = getCleanAudioUrl(ep.audio_url)
          el.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
        })
    }
  }

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00'
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in">
      <div
        className="bg-[#141414] text-white max-w-xl w-full border-2 border-[#ffc500] shadow-2xl p-6 sm:p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HTML5 Audio Element */}
        <audio
          ref={audioRef}
          src={activeAudioSource}
          preload="metadata"
          onTimeUpdate={handleTimeUpdate}
          onError={handleAudioError}
          onEnded={() => setIsPlaying(false)}
        />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#2d2d2d] pb-4 mb-5">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎙️</span>
            <div>
              <div className="text-[10px] font-sans-editorial font-bold tracking-widest text-[#111111] bg-[#ffc500] px-2 py-0.5 inline-block uppercase">
                ASTRONOMY CAST
              </div>
              <div className="text-[12px] font-serif-editorial text-[#aaaaaa] mt-0.5">
                Khagolshastra Radio Transmission
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center border border-[#444] bg-[#222] hover:bg-[#ffc500] hover:text-[#111] font-bold text-xs transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Active Episode Card */}
        <div className="bg-[#1c1c1c] border border-[#333] p-5 mb-5">
          <div className="flex items-center justify-between text-[10px] font-sans-editorial tracking-widest uppercase text-[#ffc500] mb-1">
            <span>EPISODE #{currentEpisode.ep_number}</span>
            <span className="text-[#888884]">FEATURED BROADCAST</span>
          </div>

          <h2 className="text-[22px] font-serif-editorial font-normal text-white mb-1.5 leading-snug">
            {currentEpisode.title}
          </h2>

          <div className="text-[11px] font-sans-editorial text-[#ffc500]/80 mb-3">
            HOSTS: {currentEpisode.hosts}
          </div>

          <p className="text-[13px] font-serif-editorial text-[#ccc] leading-relaxed line-clamp-3">
            {currentEpisode.description}
          </p>
        </div>

        {/* Scrub Bar */}
        <div className="mb-6 space-y-1">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={(e) => handleSeek(Number(e.target.value))}
            className="w-full h-2 bg-[#333] accent-[#ffc500] cursor-pointer rounded-none"
          />
          <div className="flex justify-between text-[10px] font-sans-editorial font-bold text-[#888884] tracking-wider">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          {/* Main Play/Pause Button */}
          <button
            onClick={togglePlay}
            className="px-6 py-3 bg-[#ffc500] text-[#111111] font-sans-editorial font-bold text-[12px] uppercase tracking-wider hover:bg-white transition-colors cursor-pointer flex items-center gap-2 shadow-lg"
          >
            <span>{isPlaying ? '⏸ PAUSE TRANSMISSION' : '▶ PLAY TRANSMISSION'}</span>
          </button>

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <span className="text-xs">🔊</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="w-20 h-1.5 bg-[#333] accent-[#ffc500] cursor-pointer"
            />
          </div>

          {/* Speed Selector */}
          <div className="flex items-center gap-1 text-[11px] font-sans-editorial font-bold">
            <span className="text-[#888] mr-1">SPEED:</span>
            {[1.0, 1.25, 1.5, 2.0].map((s) => (
              <button
                key={s}
                onClick={() => handleSpeedChange(s)}
                className={`px-2 py-1 border text-[10px] ${
                  playbackSpeed === s
                    ? 'border-[#ffc500] bg-[#ffc500] text-[#111]'
                    : 'border-[#333] bg-[#222] text-[#ccc] hover:border-[#666]'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Archive Toggle Button */}
        <div className="border-t border-[#2d2d2d] pt-4">
          <button
            onClick={() => setShowArchive(!showArchive)}
            className="w-full py-2 bg-[#222] border border-[#333] text-[11px] font-sans-editorial font-bold uppercase tracking-widest text-[#ccc] hover:text-[#ffc500] hover:border-[#ffc500] transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{showArchive ? '▲ HIDE EPISODE ARCHIVE' : '▼ BROWSE EPISODE ARCHIVE'}</span>
          </button>

          {/* Archive List */}
          {showArchive && (
            <div className="mt-3 max-h-48 overflow-y-auto space-y-1.5 border border-[#333] p-2 bg-[#0c0c0c] custom-scrollbar">
              {allEpisodes.map((ep) => {
                const isCurrent = ep.id === currentEpisode.id
                return (
                  <div
                    key={ep.id}
                    onClick={() => selectEpisode(ep)}
                    className={`p-2.5 text-left border cursor-pointer transition-colors flex items-center justify-between ${
                      isCurrent
                        ? 'border-[#ffc500] bg-[#1a180e] text-[#ffc500]'
                        : 'border-[#222] bg-[#141414] text-[#ccc] hover:border-[#555] hover:text-white'
                    }`}
                  >
                    <div>
                      <div className="text-[10px] font-sans-editorial font-bold uppercase tracking-wider">
                        EP #{ep.ep_number} • {ep.duration}
                      </div>
                      <div className="text-[13px] font-serif-editorial font-normal leading-snug">
                        {ep.title}
                      </div>
                    </div>
                    {isCurrent && isPlaying && (
                      <span className="text-xs animate-ping">🔊</span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
