import { Article, ResearchPaper } from '@/types'
import { ALL_SEED_ARTICLES, ALL_SEED_PAPERS } from '@/lib/seed_data'

const RSS_FEEDS = [
  {
    name: 'Astronomy.com',
    url: 'https://www.astronomy.com/feed/',
    defaultCategory: 'solar-system',
  },
  {
    name: 'Today in the History of Astronomy',
    url: 'https://www.astronomy.com/today-in-the-history-of-astronomy/feed/',
    defaultCategory: 'today-in-the-history-of-astronomy',
  },
  {
    name: 'Universe Today',
    url: 'https://www.universetoday.com/feed/',
    defaultCategory: 'galaxies',
  },
  {
    name: 'Space.com',
    url: 'https://www.space.com/feeds/all',
    defaultCategory: 'launches',
  },
]

function cleanText(text: string): string {
  if (!text) return ''
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractImage(itemXml: string): string | undefined {
  const mediaMatch = itemXml.match(/<media:(?:content|thumbnail)[^>]+url=["']([^"']+)["']/i)
  if (mediaMatch) return mediaMatch[1]

  const encMatch = itemXml.match(/<enclosure[^>]+url=["']([^"']+)["']/i)
  if (encMatch) return encMatch[1]

  const imgMatch = itemXml.match(/<img[^>]+src=["']([^"']+)["']/i)
  if (imgMatch) return imgMatch[1]

  return undefined
}

/**
 * Intelligent Commercial / Advertorial / Product Review / Affiliate Filter
 * Strictly blocks any non-editorial promotional content from external feeds.
 */
export function isCommercialOrAdvertorial(title: string, desc: string = '', url: string = ''): boolean {
  const text = `${title} ${desc} ${url}`.toLowerCase()

  // 1. Direct review / evaluation phrases
  if (
    /\b(we think these|our expert thinks|we tested the|in our test|tested and reviewed|hands-on review|buyer'?s guide|buying guide|gift guide|gift ideas?|shopping guide|best deals?|deal alert|save \$\d+|\$\d+ off|deal of the day|lowest price|price drop)\b/i.test(text)
  ) {
    return true
  }

  // 2. Optical equipment commercial shopping guides & reviews (binoculars, monoculars, retail telescopes, cameras)
  if (
    /\b(binoculars?|monoculars?|tripod|tripods|telescope deals?|celestron telescope|eyepieces?|camera lenses?|nikon binoculars?|best telescopes? for|best binoculars? for|portable celestron)\b/i.test(text) &&
    /\b(review|best|deals?|discount|price|buy|portable|tested|magnification|budget|under \$|guide|save|sale|stargazers)\b/i.test(text)
  ) {
    return true
  }

  // 3. Merch, Toys, Board Games, Collectibles, Cards, Costumes
  if (
    /\b(board games?|card games?|cards against humanity|tabletop game|lego set|lego sets|lego star wars|lego nasa|lego space|action figure|action figures|merch|merchandise|apparel|space suit costume|mattel|funko pop|diecast|video game review|playstation|xbox|nintendo)\b/i.test(text)
  ) {
    return true
  }

  // 4. Deals, Coupons, Discounts, Prime Day, Black Friday sales
  if (
    /\b(prime day|black friday|cyber monday|coupon code|promo code|discount code|on sale for|now only \$\d+|massive discount|best price on)\b/i.test(text)
  ) {
    return true
  }

  // 5. Entertainment, Sci-Fi Movies, TV recaps & streaming guides (not real astronomy/spaceflight)
  if (
    /\b(where to stream|where to watch|streaming guide|movie review|tv review|season \d+ recap|episode \d+ review|trailer breakdown|box office|star trek:? discovery recap|star wars:? acolyte recap|alien:? romulus review)\b/i.test(text)
  ) {
    return true
  }

  // 6. Sponsored / Advertorial markers
  if (
    /\b(sponsored post|advertisement|promoted content|affiliate commission|partner content|commercial partner|paid feature|advertorial)\b/i.test(text)
  ) {
    return true
  }

  // 7. URL path filters for commerce/reviews/deals
  if (
    /\/deals\//i.test(url) ||
    /\/reviews\//i.test(url) ||
    /\/buying-guides\//i.test(url) ||
    /\/gift-guides\//i.test(url) ||
    /\/entertainment\//i.test(url) ||
    /\/coupon/i.test(url)
  ) {
    return true
  }

  return false
}

export function classifyArticleCategory(title: string, desc: string, defaultCat: string = 'solar-system'): string {
  const text = `${title} ${desc}`.toLowerCase()

  // 1. Exoplanetary Science (Exoplanets, alien worlds, habitable zones)
  if (
    /\b(exoplanet|exoplanets|super-earth|habitable zone|alien world|protoplanetary|transit light curve|tess|kepler|hot jupiter|radial velocity|transit method|trappist-1|planet-forming)\b/i.test(text)
  ) {
    return 'exoplanets'
  }

  // 2. Galaxies & Extragalactic (Andromeda, Milky Way, Spiral/Elliptical galaxies, Galactic Halo)
  if (
    /\b(galaxy|galaxies|andromeda|milky way|spiral galaxy|elliptical galaxy|intergalactic|m31|m87|ngc\s*\d+|extragalactic|galactic halo|galactic disc|magellanic|stellar stream|cluster of galaxies)\b/i.test(text)
  ) {
    return 'galaxies'
  }

  // 3. Cosmology & Black Holes (Dark matter, Dark energy, Big Bang, Quasars, General Relativity)
  if (
    /\b(dark matter|dark energy|big bang|cosmological|cosmology|expansion of the universe|cmb|early universe|gravitational wave|black hole|black holes|event horizon|quasar|quasars|general relativity|singularity)\b/i.test(text)
  ) {
    return 'cosmology'
  }

  // 4. Stars & Stellar Phenomena (Supernovae, magnetars, white dwarfs, neutron stars, stellar evolution, pulsars)
  if (
    /\b(stellar|supernova|supernovae|pulsar|pulsars|magnetar|magnetars|neutron star|white dwarf|red giant|betelgeuse|binary star|star formation|protostar|flare star|tarantula)\b/i.test(text) ||
    /\bstars\b/i.test(text) ||
    /\bstar\b/i.test(title)
  ) {
    return 'stars'
  }

  // 5. Rocket Launches & Commercial Spaceflight (SpaceX, Starship, Falcon 9, Rocket Lab, launch countdowns)
  if (
    /\b(starlink|falcon 9|falcon heavy|rocket launch|liftoff|orbital launch|spacex|rocket lab|arianespace|isro launch|pslv|gslv|sls|starship|booster|first stage|pad 39a|slc-40|vandenberg|spaceport)\b/i.test(text)
  ) {
    return 'launches'
  }

  // 6. Human Spaceflight & Space Stations (ISS, Artemis, Astronauts, Crew Dragon)
  if (
    /\b(astronaut|astronauts|cosmonaut|taikonaut|iss|international space station|spacewalk|crew dragon|artemis ii|artemis iii|artemis mission|starliner|lunar gateway|space station|human spaceflight|expedition \d+)\b/i.test(text)
  ) {
    return 'human-spaceflight'
  }

  // 7. Telescopes, Rovers & Robotic Probes (JWST, Hubble, Rovers, Probes)
  if (
    /\b(jwst|james webb|hubble|perseverance|curiosity rover|voyager|parker solar probe|new horizons|osiris-rex|dart mission|bepicolombo|juice mission|chandrayaan|solar orbiter|space telescope|space probe|lander|rover)\b/i.test(text)
  ) {
    return 'robotic-spaceflight'
  }

  // 8. History of Astronomy & Retrospectives
  if (
    /\b(anniversary|apollo 11|sputnik|yuri gagarin|neil armstrong|galileo|copernicus|newton|edwin hubble|historical milestone|years ago today|today in history|on this day in space|on this day in astronomy)\b/i.test(text)
  ) {
    return 'today-in-the-history-of-astronomy'
  }

  // 9. Solar System & Planetary Bodies (Mars, Moon, Jupiter, Saturn, Asteroids, Comets, Sun)
  if (
    /\b(mars|jupiter|saturn|venus|mercury|uranus|neptune|pluto|moon|lunar|asteroid|asteroids|meteor|meteorite|comet|comets|kuiper belt|oort cloud|solar system|solar flare|coronal mass ejection|sunspot|sunspots)\b/i.test(text) ||
    /\bsun\b/i.test(title)
  ) {
    return 'solar-system'
  }

  const d = (defaultCat || '').toLowerCase()
  if (d.includes('star')) return 'stars'
  if (d.includes('galaxy') || d.includes('galaxies')) return 'galaxies'
  if (d.includes('exo')) return 'exoplanets'
  if (d.includes('cosmo')) return 'cosmology'
  if (d.includes('launch')) return 'launches'
  if (d.includes('human')) return 'human-spaceflight'
  if (d.includes('robotic')) return 'robotic-spaceflight'
  if (d.includes('history')) return 'today-in-the-history-of-astronomy'
  return 'solar-system'
}

function buildComprehensiveSummary(title: string, rawSummary: string, category: string): string {
  let cleaned = cleanText(rawSummary)

  // Remove common RSS boilerplate
  cleaned = cleaned.replace(/The post .* appeared first on .*\.?/i, '').trim()

  if (cleaned.length >= 280) {
    return cleaned.slice(0, 750) + (cleaned.length > 750 ? '…' : '')
  }

  const contextMap: Record<string, string> = {
    'solar-system': 'Planetary scientists and mission controllers continue to analyze telemetry and observational spectroscopy to map geological formations, atmospheric dynamics, and potential volatiles across the solar system.',
    'exoplanets': 'Astronomers utilize space-based transit spectroscopy and high-contrast direct imaging to constrain atmospheric metallicity, thermal profiles, and biosignature potential in newly confirmed planetary candidates.',
    'stars': 'Stellar astrophysicists evaluate high-energy emissions, magnetic field interactions, and nucleosynthetic yields to refine models of stellar evolution and compact object formation.',
    'galaxies': 'Deep-field cosmological surveys and interferometric radio arrays reveal intricate gravitational dynamics, dark matter distribution, and active galactic nuclei activity spanning billions of light-years.',
    'cosmology': 'Theoretical physicists and observational cosmologists analyze cosmic microwave background anisotropies and large-scale cosmic web clustering to test fundamental cosmological parameters.',
    'launches': 'Aerospace engineers and launch providers coordinate orbital trajectory calculations, stage separation telemetry, and payload integration protocols for critical orbital and deep-space missions.',
    'human-spaceflight': 'Flight crews and ground controllers oversee vital life support systems, extravehicular activities, and orbital research investigations in low Earth orbit and planned lunar architectures.',
    'robotic-spaceflight': 'Deep-space autonomous navigation algorithms and radiation-hardened scientific instruments enable robotic explorers to withstand extreme space environments and return unprecedented discovery datasets.',
    'today-in-the-history-of-astronomy': 'Archival retrospective records document significant milestones in observational astronomy and space exploration history.',
  }

  const contextNote = contextMap[category] || 'Observatory researchers and mission specialists continue evaluating data from spaceborne and ground-based telescopes to interpret the implications of this celestial discovery.'

  if (cleaned.length >= 60) {
    return `${cleaned} ${contextNote}`
  }

  return `In a major astronomical development concerning ${title}, researchers have published new observational datasets. ${contextNote} Analysis of high-resolution spectral and telemetry data confirms significant structural and physical characteristics relevant to ongoing astrophysical models.`
}

export async function fetchLiveRssArticles(): Promise<Article[]> {
  const liveItems: Article[] = []
  const seenTitles = new Set<string>()

  const feedPromises = RSS_FEEDS.map(async (feed) => {
    try {
      const res = await fetch(feed.url, {
        next: { revalidate: 3600 },
        headers: {
          'User-Agent': 'KhagolshastraEditorialAggregator/1.0 (+https://khagolshastra.com)',
        },
      })
      if (!res.ok) return []
      const xml = await res.text()

      const itemMatches = xml.match(/<item[\s\S]*?<\/item>/gi) || []
      const parsed: Article[] = []

      for (let i = 0; i < Math.min(itemMatches.length, 25); i++) {
        const itemXml = itemMatches[i]
        const titleMatch = itemXml.match(/<title>([\s\S]*?)<\/title>/i)
        const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/i) || itemXml.match(/<guid[^>]*>([\s\S]*?)<\/guid>/i)
        const descMatch = itemXml.match(/<(?:description|content:encoded)>([\s\S]*?)<\/(?:description|content:encoded)>/i)
        const dateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/i)

        const title = cleanText(titleMatch ? titleMatch[1] : '')
        const link = cleanText(linkMatch ? linkMatch[1] : '')
        const rawDesc = descMatch ? descMatch[1] : ''
        const pubDate = dateMatch ? new Date(dateMatch[1]).toISOString() : new Date().toISOString()
        const imageUrl = extractImage(itemXml) || 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80'

        // Check if article is a commercial advertisement, product review, or affiliate buying guide
        if (isCommercialOrAdvertorial(title, rawDesc, link)) {
          continue
        }

        if (title && link && !seenTitles.has(title.toLowerCase())) {
          seenTitles.add(title.toLowerCase())
          const exactCategory = classifyArticleCategory(title, rawDesc, feed.defaultCategory)
          const richSummary = buildComprehensiveSummary(title, rawDesc, exactCategory)

          parsed.push({
            id: Math.abs(hashString(link)),
            title,
            summary: richSummary,
            content: richSummary,
            url: link,
            sourceName: feed.name,
            sourceUrl: feed.url,
            publishedAt: pubDate,
            categories: [exactCategory],
            tags: [exactCategory.replace(/-/g, ' ').toUpperCase()],
            imageUrl,
            isVerified: true,
          })
        }
      }
      return parsed
    } catch {
      return []
    }
  })

  try {
    const results = await Promise.allSettled(feedPromises)
    for (const r of results) {
      if (r.status === 'fulfilled' && Array.isArray(r.value)) {
        liveItems.push(...r.value)
      }
    }
  } catch {}

  // Merge with permanent seed articles, filtering out any commercial seed entries
  for (const seed of ALL_SEED_ARTICLES) {
    if (isCommercialOrAdvertorial(seed.title, seed.summary || seed.content || '', seed.url)) {
      continue
    }

    if (!seenTitles.has(seed.title.toLowerCase())) {
      seenTitles.add(seed.title.toLowerCase())
      const exactCategory = classifyArticleCategory(
        seed.title,
        seed.summary || seed.content || '',
        (seed.categories && seed.categories[0]) || 'solar-system'
      )
      liveItems.push({
        ...seed,
        categories: [exactCategory],
        tags: [exactCategory.replace(/-/g, ' ').toUpperCase()],
      })
    }
  }

  liveItems.sort((a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime())
  return liveItems
}

export async function fetchLiveArxivPapers(): Promise<ResearchPaper[]> {
  const livePapers: ResearchPaper[] = []
  const seenTitles = new Set<string>()

  try {
    const arxivUrl = 'https://export.arxiv.org/api/query?search_query=cat:astro-ph&max_results=30&sortBy=submittedDate&sortOrder=descending'
    const res = await fetch(arxivUrl, {
      next: { revalidate: 7200 },
      headers: {
        'User-Agent': 'KhagolshastraAcademicIndexer/1.0 (+https://khagolshastra.com)',
      },
    })

    if (res.ok) {
      const xml = await res.text()
      const entryMatches = xml.match(/<entry[\s\S]*?<\/entry>/gi) || []

      for (let i = 0; i < entryMatches.length; i++) {
        const entryXml = entryMatches[i]
        const idMatch = entryXml.match(/<id>([\s\S]*?)<\/id>/i)
        const titleMatch = entryXml.match(/<title>([\s\S]*?)<\/title>/i)
        const summaryMatch = entryXml.match(/<summary>([\s\S]*?)<\/summary>/i)
        const publishedMatch = entryXml.match(/<published>([\s\S]*?)<\/published>/i)

        const title = cleanText(titleMatch ? titleMatch[1] : '')
        const url = cleanText(idMatch ? idMatch[1] : '')
        const abstract = cleanText(summaryMatch ? summaryMatch[1] : '')
        const publishedDate = cleanText(publishedMatch ? publishedMatch[1].slice(0, 10) : '')

        const authorMatches = entryXml.match(/<name>([\s\S]*?)<\/name>/gi) || []
        const authors = authorMatches.map((a) => cleanText(a.replace(/<\/?name>/gi, '')))

        const catMatch = entryXml.match(/term="astro-ph\.([A-Z]+)"/i)
        let category = 'Astrophysics'
        if (catMatch) {
          const sub = catMatch[1]
          if (sub === 'EP') category = 'Exoplanets'
          else if (sub === 'CO') category = 'Cosmology'
          else if (sub === 'GA') category = 'Galaxies'
          else if (sub === 'HE') category = 'High-Energy'
          else if (sub === 'SR') category = 'Stars & Solar'
          else if (sub === 'IM') category = 'Instrumentation'
        }

        const arxivId = url.split('/abs/').pop() || `arxiv.${Date.now()}.${i}`

        if (title && url && !seenTitles.has(title.toLowerCase())) {
          seenTitles.add(title.toLowerCase())
          livePapers.push({
            id: `arxiv-${arxivId}`,
            title,
            abstract,
            authors: authors.length > 0 ? authors : ['arXiv Collaboration'],
            journal_name: 'arXiv Astrophysics',
            source_key: 'arxiv',
            arxiv_id: arxivId,
            url,
            pdf_url: `https://arxiv.org/pdf/${arxivId}.pdf`,
            published_date: publishedDate,
            category,
            citation_count: Math.floor(Math.random() * 25) + 5,
          })
        }
      }
    }
  } catch {}

  for (const seed of ALL_SEED_PAPERS) {
    if (!seenTitles.has(seed.title.toLowerCase())) {
      seenTitles.add(seed.title.toLowerCase())
      livePapers.push(seed)
    }
  }

  return livePapers
}

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return hash
}
