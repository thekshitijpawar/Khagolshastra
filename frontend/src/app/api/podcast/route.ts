import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Cache for 1 hour

export interface PodcastEpisode {
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

export function cleanAudioUrl(rawUrl: string): string {
  if (!rawUrl) return ''
  if (rawUrl.includes('traffic.libsyn.com')) {
    const match = rawUrl.match(/traffic\.libsyn\.com\/[^\s\?]+/i)
    if (match) {
      return `https://${match[0]}`
    }
  }
  if (rawUrl.includes('redirect.mp3/')) {
    const lastHttp = rawUrl.lastIndexOf('http')
    if (lastHttp > 0) {
      return rawUrl.substring(lastHttp).split('?')[0]
    }
  }
  return rawUrl.split('?')[0]
}

// Fallback curated catalogue if live RSS feed is unreachable
const FALLBACK_EPISODES: PodcastEpisode[] = [
  {
    id: 'ac-1',
    ep_number: 1,
    title: 'Ep. 1: The Moon',
    description: "Fraser Cain and Dr. Pamela Gay explore Earth's closest celestial companion, the Moon — its origin, geology, tidal effects, and human exploration history.",
    audio_url: 'https://traffic.libsyn.com/secure/astronomycast/AstroCast-061218.mp3',
    duration: '28:15',
    show: 'Astronomy Cast',
    hosts: 'Fraser Cain & Dr. Pamela Gay',
    published: 'Mon, 18 Dec 2006',
    image: 'https://astronomycast.com/wp-content/uploads/2021/04/AstronomyCastLogo_1400x1400.jpg',
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
    published: 'Wed, 24 Mar 2010',
    image: 'https://astronomycast.com/wp-content/uploads/2021/04/AstronomyCastLogo_1400x1400.jpg',
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
    published: 'Tue, 08 Nov 2011',
    image: 'https://astronomycast.com/wp-content/uploads/2021/04/AstronomyCastLogo_1400x1400.jpg',
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
    published: 'Sat, 19 Nov 2011',
    image: 'https://astronomycast.com/wp-content/uploads/2021/04/AstronomyCastLogo_1400x1400.jpg',
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
    published: 'Sun, 27 Nov 2011',
    image: 'https://astronomycast.com/wp-content/uploads/2021/04/AstronomyCastLogo_1400x1400.jpg',
  },
]

async function fetchLivePodcastEpisodes(): Promise<PodcastEpisode[]> {
  const rssUrl = 'https://astronomycast.libsyn.com/rss'
  const res = await fetch(rssUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Khagolshastra/1.0',
    },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`RSS fetch HTTP ${res.status}`)

  const xml = await res.text()
  const items = xml.split('<item>').slice(1)
  const episodes: PodcastEpisode[] = []

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const titleMatch = item.match(/<title>(.*?)<\/title>/s)
    const encMatch = item.match(/enclosure url=["']([^"']+)["']/i) || item.match(/url=["'](https?:\/\/[^"']+\.mp3[^"']*)["']/i)
    const durMatch = item.match(/<itunes:duration>(.*?)<\/itunes:duration>/s)
    const descMatch = item.match(/<description>(.*?)<\/description>/s) || item.match(/<itunes:summary>(.*?)<\/itunes:summary>/s)
    const pubMatch = item.match(/<pubDate>(.*?)<\/pubDate>/s)
    const imgMatch = item.match(/<itunes:image[^>]+href=["']([^"']+)["']/i)

    if (encMatch && encMatch[1]) {
      const rawTitle = titleMatch ? titleMatch[1].replace(/<!\[CDATA\[/g, '').replace(/\]\]>/g, '').trim() : `Episode ${items.length - i}`
      const cleanTitle = rawTitle.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#8217;/g, "'")
      
      let epNum = items.length - i
      const numMatch = cleanTitle.match(/(?:Ep\.|Episode)\s*(\d+)/i)
      if (numMatch) {
        epNum = parseInt(numMatch[1], 10)
      }

      const rawDesc = descMatch ? descMatch[1].replace(/<!\[CDATA\[/g, '').replace(/\]\]>/g, '').replace(/<[^>]+>/g, '').trim() : ''
      const duration = durMatch ? durMatch[1].trim() : '30:00'
      const cleanUrl = cleanAudioUrl(encMatch[1])

      episodes.push({
        id: `ac-live-${i}-${epNum}`,
        ep_number: epNum,
        title: cleanTitle,
        description: rawDesc.substring(0, 300) || "Fraser Cain and Dr. Pamela Gay explore the cosmos on Astronomy Cast.",
        audio_url: cleanUrl,
        duration,
        show: 'Astronomy Cast',
        hosts: 'Fraser Cain & Dr. Pamela Gay',
        published: pubMatch ? pubMatch[1].trim() : undefined,
        image: imgMatch ? imgMatch[1] : 'https://astronomycast.com/wp-content/uploads/2021/04/AstronomyCastLogo_1400x1400.jpg',
      })
    }
  }

  return episodes
}

export async function GET() {
  try {
    const liveEpisodes = await fetchLivePodcastEpisodes()
    if (liveEpisodes.length > 0) {
      // Latest episode is index 0
      const current = liveEpisodes[0]
      return NextResponse.json({
        current,
        episodes: liveEpisodes.slice(0, 50), // Return top 50 live episodes
        source: 'https://astronomycast.libsyn.com/rss',
      })
    }
  } catch (err: any) {
    console.warn('Live podcast RSS sync failed, falling back to static catalogue:', err?.message)
  }

  return NextResponse.json({
    current: FALLBACK_EPISODES[0],
    episodes: FALLBACK_EPISODES,
    source: 'https://www.astronomycast.com/',
  })
}
