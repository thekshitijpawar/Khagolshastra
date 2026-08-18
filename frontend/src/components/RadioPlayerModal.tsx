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

const DEFAULT_EPISODES: PodcastEpisode[] = [
  {
    id: 'ac-1',
    ep_number: 1,
    title: 'Ep. 1: The Moon',
    description: "Fraser Cain and Dr. Pamela Gay explore Earth's closest celestial companion, the Moon — its origin, geology, tidal effects, and human exploration history.",
    audio_url: 'https://dts.podtrac.com/redirect.mp3/arttrk.com/p/ADCT2/pscrb.fm/rss/p/clrtpod.com/m/traffic.libsyn.com/secure/astronomycast/AstroCast-061218.mp3',
    duration: '28:15',
    show: 'Astronomy Cast',
    hosts: 'Fraser Cain & Dr. Pamela Gay',
  },
  {
    id: 'ac-2',
    ep_number: 2,
    title: 'Ep. 2: Getting Around the Solar System',
    description: 'How spacecraft navigate gravity assists, Hohmann transfer orbits, and propulsion physics to travel across the vast distances of our solar system.',
    audio_url: 'https://dts.podtrac.com/redirect.mp3/arttrk.com/p/ADCT2/pscrb.fm/rss/p/clrtpod.com/m/traffic.libsyn.com/secure/astronomycast/AstroCast-080414.mp3?dest-id=11189',
    duration: '40:21',
    show: 'Astronomy Cast',
    hosts: 'Fraser Cain & Dr. Pamela Gay',
  },
  {
    id: 'ac-3',
    ep_number: 3,
    title: 'Ep. 3: Solar Activity & Space Weather',
    description: 'Exploring sunspots, coronal mass ejections, magnetic reconnection, and how the Sun impacts Earth and satellite constellations.',
    audio_url: 'https://dts.podtrac.com/redirect.mp3/arttrk.com/p/ADCT2/pscrb.fm/rss/p/clrtpod.com/m/traffic.libsyn.com/secure/astronomycast/AstroCast-111107.mp3?dest-id=11189',
    duration: '31:06',
    show: 'Astronomy Cast',
    hosts: 'Fraser Cain & Dr. Pamela Gay',
  },
  {
    id: 'ac-4',
    ep_number: 4,
    title: 'Ep. 4: Astrophotography (Pt. 1: The Gear)',
    description: 'What telescopes, mounts, sensors, filters, and guide cameras are needed to capture deep sky objects from your backyard observatory.',
    audio_url: 'https://dts.podtrac.com/redirect.mp3/arttrk.com/p/ADCT2/pscrb.fm/rss/p/clrtpod.com/m/traffic.libsyn.com/secure/astronomycast/AstroCast-111114.mp3?dest-id=11189',
    duration: '28:53',
    show: 'Astronomy Cast',
    hosts: 'Fraser Cain & Dr. Pamela Gay',
  },
  {
    id: 'ac-5',
    ep_number: 5,
    title: 'Ep. 5: Astrophotography (Pt. 2: Techniques)',
    description: 'Polar alignment, tracking, exposure times, dark frames, bias frames, and calibration methods to maximize signal-to-noise ratio.',
    audio_url: 'https://dts.podtrac.com/redirect.mp3/arttrk.com/p/ADCT2/pscrb.fm/rss/p/clrtpod.com/m/traffic.libsyn.com/secure/astronomycast/AstroCast-111121.mp3?dest-id=11189',
    duration: '36:34',
    show: 'Astronomy Cast',
    hosts: 'Fraser Cain & Dr. Pamela Gay',
  },
  {
    id: 'ac-6',
    ep_number: 6,
    title: 'Ep. 6: Astrophotography (Pt. 3: Image Processing)',
    description: 'Stacking, wavelet processing, color mapping, and stretching raw pixel data to reveal faint emission nebulae and galaxies.',
    audio_url: 'https://dts.podtrac.com/redirect.mp3/arttrk.com/p/ADCT2/pscrb.fm/rss/p/clrtpod.com/m/traffic.libsyn.com/secure/astronomycast/AstroCast-111128.mp3?dest-id=11189',
    duration: '29:38',
    show: 'Astronomy Cast',
    hosts: 'Fraser Cain & Dr. Pamela Gay',
  },
  {
    id: 'ac-7',
    ep_number: 7,
    title: 'Ep. 7: The Torino Scale & Near-Earth Asteroids',
    description: 'Quantifying asteroid impact hazards, assessing orbital trajectories, and planetary defense deflection strategies.',
    audio_url: 'https://dts.podtrac.com/redirect.mp3/arttrk.com/p/ADCT2/pscrb.fm/rss/p/clrtpod.com/m/traffic.libsyn.com/secure/astronomycast/AstroCast-1111205.mp3?dest-id=11189',
    duration: '27:42',
    show: 'Astronomy Cast',
    hosts: 'Fraser Cain & Dr. Pamela Gay',
  },
  {
    id: 'ac-8',
    ep_number: 8,
    title: 'Ep. 8: The Tunguska Event',
    description: 'Analyzing the 1908 atmospheric airburst in Siberia, shockwave physics, and what it teaches us about comet and asteroid fragment entries.',
    audio_url: 'https://dts.podtrac.com/redirect.mp3/arttrk.com/p/ADCT2/pscrb.fm/rss/p/clrtpod.com/m/traffic.libsyn.com/secure/astronomycast/AstroCast-111212.mp3?dest-id=11189',
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

  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {})
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

          <div className="text-[12px] font-sans-editorial font-semibold text-[#ffc500] mb-3">
            Hosts: {currentEpisode.hosts}
          </div>

          <p className="text-[13px] font-serif-editorial text-[#cccccc] leading-relaxed mb-4">
            {currentEpisode.description}
          </p>

          {/* Sound Wave Visualizer Animation */}
          <div className="flex items-center justify-center gap-1.5 h-8 bg-[#111111] border border-[#2a2a2a] p-2 mb-4">
            {[4, 8, 14, 20, 12, 18, 24, 16, 10, 6, 14, 22, 18, 12, 6, 10, 16, 12, 8, 4].map((h, i) => (
              <span
                key={i}
                className="w-1 bg-[#ffc500] rounded-xs transition-all duration-150"
                style={{
                  height: isPlaying ? `${Math.max(4, (h * (0.4 + Math.random() * 0.8)))}px` : '4px',
                  opacity: isPlaying ? 1 : 0.3,
                }}
              />
            ))}
          </div>

          {/* Scrubber Progress Bar */}
          <div className="space-y-1.5">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => handleSeek(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-[#333] rounded-lg appearance-none cursor-pointer accent-[#ffc500]"
            />
            <div className="flex justify-between text-[11px] font-mono text-[#888888]">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Playback Controls Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-[#2a2a2a]">
            {/* Speed Selector */}
            <div className="flex items-center gap-1 text-[11px] font-mono">
              {[1.0, 1.25, 1.5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => handleSpeedChange(speed)}
                  className={`px-2 py-1 border text-xs cursor-pointer ${
                    playbackSpeed === speed
                      ? 'bg-[#ffc500] text-[#111] font-bold border-[#ffc500]'
                      : 'border-[#444] text-[#aaa] hover:text-white'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            {/* Play/Pause Main Button */}
            <button
              onClick={togglePlay}
              className="bg-[#ffc500] hover:bg-[#e0ad00] text-[#111] font-sans-editorial font-bold text-[13px] uppercase tracking-widest px-6 py-2.5 flex items-center gap-2 transition-transform transform active:scale-95 shadow-md cursor-pointer"
            >
              {isPlaying ? (
                <>
                  <span>⏸</span> PAUSE EPISODE
                </>
              ) : (
                <>
                  <span>▶</span> PLAY EPISODE
                </>
              )}
            </button>

            {/* Volume Slider */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#888]">🔊</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-16 h-1 bg-[#333] accent-[#ffc500] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Expandable Episode Archive Catalogue */}
        <div className="border border-[#333] bg-[#1a1a1a]">
          <button
            onClick={() => setShowArchive(!showArchive)}
            className="w-full px-4 py-2.5 flex items-center justify-between text-[11px] font-sans-editorial font-bold uppercase tracking-wider text-white hover:text-[#ffc500] transition-colors cursor-pointer"
          >
            <span>BROWSE ASTRONOMY CAST ARCHIVE</span>
            <span className="text-xs">{showArchive ? '▲' : '▼'}</span>
          </button>

          {showArchive && (
            <div className="max-h-48 overflow-y-auto divide-y divide-[#262626] border-t border-[#333]">
              {allEpisodes.map((ep) => (
                <div
                  key={ep.id}
                  onClick={() => selectEpisode(ep)}
                  className={`p-3 flex items-center justify-between gap-3 hover:bg-[#252525] cursor-pointer transition-colors ${
                    currentEpisode.id === ep.id ? 'bg-[#222] border-l-2 border-[#ffc500]' : ''
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-[12px] font-serif-editorial text-white font-medium truncate">
                      {ep.title}
                    </div>
                    <div className="text-[10px] text-[#888] font-sans-editorial">
                      {ep.duration} • {ep.hosts}
                    </div>
                  </div>
                  <button className="text-[10px] uppercase font-bold text-[#ffc500] shrink-0 hover:underline cursor-pointer">
                    {currentEpisode.id === ep.id && isPlaying ? 'Playing' : 'Listen'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Source Citation */}
        <div className="mt-4 flex items-center justify-between text-[11px] font-sans-editorial text-[#888]">
          <span>Source: Astronomy Cast (Fraser Cain & Dr. Pamela Gay)</span>
          <a
            href="https://www.astronomycast.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#ffc500] hover:underline"
          >
            astronomycast.com &rarr;
          </a>
        </div>
      </div>
    </div>
  )
}
