import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Cache for 1 hour

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

// Sequential catalogue of Astronomy Cast episodes starting from Episode 1
const ASTRONOMY_CAST_EPISODES: PodcastEpisode[] = [
  {
    id: 'ac-1',
    ep_number: 1,
    title: 'Ep. 1: The Moon',
    description: "Fraser Cain and Dr. Pamela Gay explore Earth's closest celestial companion, the Moon — its origin, geology, tidal effects, and human exploration history.",
    audio_url: 'https://dts.podtrac.com/redirect.mp3/arttrk.com/p/ADCT2/pscrb.fm/rss/p/clrtpod.com/m/traffic.libsyn.com/secure/astronomycast/AstroCast-061218.mp3',
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
    audio_url: 'https://dts.podtrac.com/redirect.mp3/arttrk.com/p/ADCT2/pscrb.fm/rss/p/clrtpod.com/m/traffic.libsyn.com/secure/astronomycast/AstroCast-080414.mp3?dest-id=11189',
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
    audio_url: 'https://dts.podtrac.com/redirect.mp3/arttrk.com/p/ADCT2/pscrb.fm/rss/p/clrtpod.com/m/traffic.libsyn.com/secure/astronomycast/AstroCast-111107.mp3?dest-id=11189',
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
    audio_url: 'https://dts.podtrac.com/redirect.mp3/arttrk.com/p/ADCT2/pscrb.fm/rss/p/clrtpod.com/m/traffic.libsyn.com/secure/astronomycast/AstroCast-111114.mp3?dest-id=11189',
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
    audio_url: 'https://dts.podtrac.com/redirect.mp3/arttrk.com/p/ADCT2/pscrb.fm/rss/p/clrtpod.com/m/traffic.libsyn.com/secure/astronomycast/AstroCast-111121.mp3?dest-id=11189',
    duration: '36:34',
    show: 'Astronomy Cast',
    hosts: 'Fraser Cain & Dr. Pamela Gay',
    published: 'Sun, 27 Nov 2011',
    image: 'https://astronomycast.com/wp-content/uploads/2021/04/AstronomyCastLogo_1400x1400.jpg',
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
    published: 'Thu, 01 Dec 2011',
    image: 'https://astronomycast.com/wp-content/uploads/2021/04/AstronomyCastLogo_1400x1400.jpg',
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
    published: 'Sun, 04 Dec 2011',
    image: 'https://astronomycast.com/wp-content/uploads/2021/04/AstronomyCastLogo_1400x1400.jpg',
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
    published: 'Mon, 19 Dec 2011',
    image: 'https://astronomycast.com/wp-content/uploads/2021/04/AstronomyCastLogo_1400x1400.jpg',
  },
  {
    id: 'ac-9',
    ep_number: 9,
    title: "Ep. 9: Jupiter's Volcanic Moon Io",
    description: 'Tidal heating, sulfur volcanoes, and the intense radiation environment of the most volcanically active body in the Solar System.',
    audio_url: 'https://dts.podtrac.com/redirect.mp3/arttrk.com/p/ADCT2/pscrb.fm/rss/p/clrtpod.com/m/traffic.libsyn.com/secure/astronomycast/AstroCast-111219.mp3?dest-id=11189',
    duration: '30:25',
    show: 'Astronomy Cast',
    hosts: 'Fraser Cain & Dr. Pamela Gay',
    published: 'Tue, 20 Dec 2011',
    image: 'https://astronomycast.com/wp-content/uploads/2021/04/AstronomyCastLogo_1400x1400.jpg',
  },
  {
    id: 'ac-10',
    ep_number: 10,
    title: 'Ep. 10: The Lifecycle of Stars',
    description: 'From molecular gas cloud collapse to main sequence, red giant phases, planetary nebulae, white dwarfs, neutron stars, and black holes.',
    audio_url: 'https://dts.podtrac.com/redirect.mp3/arttrk.com/p/ADCT2/pscrb.fm/rss/p/clrtpod.com/m/traffic.libsyn.com/secure/astronomycast/AstroCast-120109.mp3?dest-id=11189',
    duration: '33:10',
    show: 'Astronomy Cast',
    hosts: 'Fraser Cain & Dr. Pamela Gay',
    published: 'Mon, 09 Jan 2012',
    image: 'https://astronomycast.com/wp-content/uploads/2021/04/AstronomyCastLogo_1400x1400.jpg',
  },
]

// 2-Day Rotation Math: Starts at Ep. 1 on base epoch, advancing every 2 days to Ep. 2, Ep. 3, Ep. 4, etc.
function getActiveRotatingPodcast(): PodcastEpisode {
  // Epoch: Current anchor date (August 18, 2026 UTC)
  const EPOCH_MS = new Date('2026-08-18T00:00:00Z').getTime()
  const nowMs = Date.now()
  const periodMs = 2 * 24 * 60 * 60 * 1000 // 48 hours
  const index = Math.max(0, Math.floor((nowMs - EPOCH_MS) / periodMs)) % ASTRONOMY_CAST_EPISODES.length
  return ASTRONOMY_CAST_EPISODES[index]
}

export async function GET() {
  const current = getActiveRotatingPodcast()
  return NextResponse.json({
    current,
    episodes: ASTRONOMY_CAST_EPISODES,
    source: 'https://www.astronomycast.com/',
  })
}
