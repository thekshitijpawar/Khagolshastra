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
  hours_until_next_rotation?: number
  rotation_rule?: string
  source_website?: string
}

interface RadioPlayerModalProps {
  isOpen: boolean
  onClose: () => void
}

const DEFAULT_EPISODES: PodcastEpisode[] = [
  {
    id: 'ac-1',
    ep_number: 1,
    title: 'Episode 1: The Moon',
    description: "Fraser Cain and Dr. Pamela Gay begin their epic astronomy journey exploring Earth's closest celestial companion, the Moon. Discover its violent origins, orbital mechanics, tidal locking, surface geology, and the Apollo legacy.",
    audio_url: 'https://dts.podtrac.com/redirect.mp3/arttrk.com/p/ADCT2/pscrb.fm/rss/p/clrtpod.com/m/traffic.libsyn.com/secure/astronomycast/AstroCast-061218.mp3',
    duration: '28:15',
    show: 'Astronomy Cast',
    hosts: 'Fraser Cain & Dr. Pamela Gay',
    hours_until_next_rotation: 33,
  },
  {
    id: 'ac-2',
    ep_number: 2,
    title: 'Episode 2: The Sun',
    description: "An in-depth voyage to the fiery powerhouse of the Solar System. How hydrogen fusion generates the light and heat powering all life on Earth, solar flares, the solar wind, and the Sun's ultimate destiny.",
    audio_url: 'https://dts.podtrac.com/redirect.mp3/arttrk.com/p/ADCT2/pscrb.fm/rss/p/clrtpod.com/m/traffic.libsyn.com/secure/astronomycast/AstroCast-20240812.mp3',
    duration: '29:30',
    show: 'Astronomy Cast',
    hosts: 'Fraser Cain & Dr. Pamela Gay',
    hours_until_next_rotation: 48,
  },
  {
    id: 'ac-3',
    ep_number: 3,
    title: 'Episode 3: Where Do Stars Come From?',
    description: 'Investigating stellar nurseries, giant molecular clouds, gravitational collapse, protostars, and the ignition of nuclear fusion in nascent stars across the cosmos.',
    audio_url: 'https://dts.podtrac.com/redirect.mp3/arttrk.com/p/ADCT2/pscrb.fm/rss/p/clrtpod.com/m/traffic.libsyn.com/secure/astronomycast/AstroCast-20260629.mp3',
    duration: '27:45',
    show: 'Astronomy Cast',
    hosts: 'Fraser Cain & Dr. Pamela Gay',
    hours_until_next_rotation: 48,
  },
]

export default function RadioPlayerModal({ isOpen, onClose }: RadioPlayerModalProps) {
  const [currentEpisode, setCurrentEpisode] = useState<PodcastEpisode>(DEFAULT_EPISODES[0])
  const [allEpisodes, setAllEpisodes] = useState<PodcastEpisode[]>(DEFAULT_EPISODES)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(1695) // ~28m default
  const [volume, setVolume] = useState(0.8)
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0)
  const [showArchive, setShowArchive] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Fetch rotating episode & archive catalogue
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    fetch(`${apiUrl}/api/podcast/current`, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.title) {
          setCurrentEpisode(data)
        }
      })
      .catch(() => {})

    fetch(`${apiUrl}/api/podcast/all?limit=25`, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.episodes && data.episodes.length > 0) {
          setAllEpisodes(data.episodes)
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
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose, isPlaying])

  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false))
    }
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
    setIsPlaying(true)
    if (audioRef.current) {
      audioRef.current.src = ep.audio_url
      audioRef.current.playbackRate = playbackSpeed
      audioRef.current.volume = volume
      audioRef.current.play().catch(() => {})
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
        {/* Hidden HTML5 Audio Element */}
        <audio
          ref={audioRef}
          src={currentEpisode.audio_url}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
        />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#2d2d2d] pb-4 mb-5">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎙️</span>
            <div>
              <div className="text-[10px] font-sans-editorial font-bold tracking-widest text-[#111111] bg-[#ffc500] px-2 py-0.5 inline-block uppercase">
                ASTRONOMY CAST • 2-DAY ROTATING PODCAST
              </div>
              <div className="text-[12px] font-serif-editorial text-[#aaaaaa] mt-0.5">
                Khagolshastra Radio Transmission
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center border border-[#444] bg-[#222] hover:bg-[#ffc500] hover:text-[#111] font-bold text-xs transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Active Episode Card */}
        <div className="bg-[#1c1c1c] border border-[#333] p-5 mb-5">
          <div className="flex items-center justify-between text-[10px] font-sans-editorial tracking-widest uppercase text-[#ffc500] mb-1">
            <span>EPISODE #{currentEpisode.ep_number}</span>
            <span className="text-[#888884]">
              {currentEpisode.hours_until_next_rotation ? `Rotates in ${currentEpisode.hours_until_next_rotation} hrs` : 'Scheduled'}
            </span>
          </div>

          <h2 className="text-[22px] font-serif-editorial font-normal text-white mb-1.5 leading-snug">
            {currentEpisode.title}
          </h2>

          <div className="text-[11px] font-sans-editorial text-[#ffc500] font-medium mb-3">
            Hosts: {currentEpisode.hosts}
          </div>

          <p className="text-[12px] font-serif-editorial text-[#cccccc] leading-relaxed mb-4 line-clamp-3">
            {currentEpisode.description}
          </p>

          {/* Soundwave Visualizer */}
          <div className="flex items-center justify-center gap-1.5 h-10 my-4 bg-[#141414] p-2 border border-[#2a2a2a]">
            {[6, 12, 22, 30, 16, 26, 36, 24, 12, 28, 38, 20, 14, 32, 24, 10, 18, 30, 14, 8].map((h, i) => (
              <span
                key={i}
                className="w-1 bg-[#ffc500] rounded-xs transition-all duration-200"
                style={{
                  height: isPlaying ? `${Math.max(4, (h * volume) % 32)}px` : '4px',
                  opacity: isPlaying ? 1 : 0.35,
                  animation: isPlaying ? `soundwave 0.6s ease-in-out infinite ${i * 0.05}s` : 'none',
                }}
              />
            ))}
          </div>

          {/* Progress / Seek Slider */}
          <div className="space-y-1">
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={(e) => handleSeek(parseFloat(e.target.value))}
              className="w-full accent-[#ffc500] bg-[#333] h-1.5 cursor-pointer"
            />
            <div className="flex items-center justify-between text-[10px] font-mono text-[#888]">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Player Action Controls */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#2a2a2a]">
            {/* Speed Control */}
            <div className="flex items-center gap-1 text-[10px] font-mono">
              {[1.0, 1.25, 1.5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => handleSpeedChange(speed)}
                  className={`px-1.5 py-0.5 border ${
                    playbackSpeed === speed
                      ? 'bg-[#ffc500] text-[#111] border-[#ffc500] font-bold'
                      : 'bg-[#222] text-[#888] border-[#333] hover:text-white'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            {/* Central Play/Pause Button */}
            <button
              onClick={togglePlay}
              className="px-6 py-2.5 bg-[#ffc500] hover:bg-[#f0ba00] text-[#111111] font-sans-editorial font-bold text-[11px] uppercase tracking-widest transition-all shadow-md active:scale-95 flex items-center gap-2"
            >
              {isPlaying ? (
                <>
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                  <span>PAUSE</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <span>PLAY EPISODE</span>
                </>
              )}
            </button>

            {/* Volume */}
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="text-[#777]">🔊</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-16 accent-[#ffc500] bg-[#333] h-1.5 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Archive Browser Toggle */}
        <div className="space-y-2">
          <button
            onClick={() => setShowArchive(!showArchive)}
            className="w-full py-2 bg-[#202020] hover:bg-[#282828] border border-[#333] text-[10px] font-sans-editorial font-bold uppercase tracking-widest text-[#cccccc] hover:text-[#ffc500] flex items-center justify-between px-3 transition-colors"
          >
            <span>BROWSE ASTRONOMY CAST ARCHIVE ({allEpisodes.length} EPISODES)</span>
            <span>{showArchive ? '▲' : '▼'}</span>
          </button>

          {showArchive && (
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
              {allEpisodes.map((ep) => (
                <button
                  key={ep.id || ep.ep_number}
                  onClick={() => selectEpisode(ep)}
                  className={`w-full text-left p-2.5 border transition-all text-[11px] flex items-center justify-between ${
                    currentEpisode.ep_number === ep.ep_number
                      ? 'bg-[#ffc500] text-[#111] border-[#ffc500] font-bold'
                      : 'bg-[#1a1a1a] text-[#ccc] border-[#2d2d2d] hover:border-[#555]'
                  }`}
                >
                  <div className="truncate pr-2">
                    <span className="text-[9px] font-mono opacity-75 mr-1.5">EP #{ep.ep_number}</span>
                    <span className="font-serif-editorial">{ep.title}</span>
                  </div>
                  <span className="text-[10px] font-mono shrink-0 opacity-75">{ep.duration}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* External Attribution Link */}
        <div className="mt-4 pt-3 border-t border-[#262626] flex items-center justify-between text-[10px] font-sans-editorial text-[#777777]">
          <span>Source: Astronomy Cast (Fraser Cain & Dr. Pamela Gay)</span>
          <a
            href="https://www.astronomycast.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#ffc500] hover:underline"
          >
            astronomycast.com ↗
          </a>
        </div>
      </div>
    </div>
  )
}
