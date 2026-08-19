import { NextResponse } from 'next/server'
import { SPACE_AGENCIES, OfficialRelease } from '@/lib/agencies'

export const dynamic = 'force-dynamic'
export const revalidate = 600 // 10 minutes

interface CachedNews {
  timestamp: number
  items: OfficialRelease[]
}

const newsCache = new Map<string, CachedNews>()
const CACHE_TTL_MS = 600000 // 10 minutes

function cleanText(str: string): string {
  if (!str) return ''
  return str
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractPublisher(title: string): { cleanTitle: string; publisher?: string } {
  const parts = title.split(' - ')
  if (parts.length > 1) {
    const publisher = parts.pop()?.trim()
    return {
      cleanTitle: cleanText(parts.join(' - ')),
      publisher: publisher ? cleanText(publisher) : undefined,
    }
  }
  return { cleanTitle: cleanText(title) }
}

function detectCategory(title: string, summary: string): string {
  const text = `${title} ${summary}`.toLowerCase()
  if (text.includes('launch') || text.includes('rocket') || text.includes('orbit') || text.includes('vikram') || text.includes('agnibaan')) {
    return 'Orbital Launch'
  }
  if (text.includes('propulsion') || text.includes('engine') || text.includes('thruster') || text.includes('fire') || text.includes('cryogenic')) {
    return 'Propulsion & Testing'
  }
  if (text.includes('satellite') || text.includes('hyperspectral') || text.includes('imaging') || text.includes('sar') || text.includes('earth observation')) {
    return 'Satellite Technology'
  }
  if (text.includes('fund') || text.includes('invest') || text.includes('round') || text.includes('valuation') || text.includes('million') || text.includes('crore')) {
    return 'Investment & Capital'
  }
  if (text.includes('partner') || text.includes('mou') || text.includes('deal') || text.includes('contract') || text.includes('agreement') || text.includes('isro')) {
    return 'Strategic Partnership'
  }
  if (text.includes('facility') || text.includes('campus') || text.includes('factory') || text.includes('ground') || text.includes('cleanroom')) {
    return 'Infrastructure'
  }
  return 'Official Update'
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    }
  } catch {}
  return dateStr || 'Recent'
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')

  if (!slug) {
    return NextResponse.json({ error: 'Missing slug parameter' }, { status: 400 })
  }

  const agency = SPACE_AGENCIES.find((a) => a.slug === slug)
  if (!agency) {
    return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
  }

  const now = Date.now()
  const cached = newsCache.get(slug)
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return NextResponse.json({
      success: true,
      slug: agency.slug,
      name: agency.name,
      acronym: agency.acronym,
      newsUrl: agency.newsUrl,
      website: agency.website,
      count: cached.items.length,
      items: cached.items,
    })
  }

  const newsItems: OfficialRelease[] = []
  const seenTitles = new Set<string>()

  // 1. Live Google News RSS Search for this exact organization
  try {
    const isStartup = agency.agencyType === 'Indian Private Startup'
    let query = `"${agency.acronym}"`
    if (agency.name && agency.name !== agency.acronym) {
      query += ` OR "${agency.name}"`
    }
    if (isStartup) {
      query += ' space OR satellite OR rocket'
    } else {
      query += ' space'
    }

    const hl = isStartup ? 'en-IN' : 'en-US'
    const gl = isStartup ? 'IN' : 'US'
    const ceid = isStartup ? 'IN:en' : 'US:en'
    const feedUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=${hl}&gl=${gl}&ceid=${ceid}`

    const res = await fetch(feedUrl, {
      headers: {
        'User-Agent': 'KhagolshastraNewsAggregator/1.0 (+https://khagolshastra.com)',
        Accept: 'application/rss+xml, application/xml, text/xml',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(4500),
    })

    if (res.ok) {
      const xml = await res.text()
      const itemMatches = xml.match(/<item[\s\S]*?<\/item>/gi) || []

      for (let i = 0; i < Math.min(itemMatches.length, 25); i++) {
        const itemXml = itemMatches[i]
        const rawTitleMatch = itemXml.match(/<title>([\s\S]*?)<\/title>/i)
        const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/i) || itemXml.match(/<guid[^>]*>([\s\S]*?)<\/guid>/i)
        const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/i)
        const sourceMatch = itemXml.match(/<source[^>]*>([\s\S]*?)<\/source>/i)
        const descMatch = itemXml.match(/<description>([\s\S]*?)<\/description>/i)

        if (!rawTitleMatch || !linkMatch) continue

        const rawTitle = rawTitleMatch[1]
        const { cleanTitle, publisher: extractedPub } = extractPublisher(rawTitle)
        const publisher = sourceMatch ? cleanText(sourceMatch[1]) : extractedPub || agency.acronym
        const url = cleanText(linkMatch[1])
        const rawPubDate = pubDateMatch ? pubDateMatch[1] : ''
        const date = formatDate(rawPubDate)
        const rawDesc = descMatch ? cleanText(descMatch[1]) : ''

        // Create informative summary without raw HTML remnants
        let summary = rawDesc
        if (!summary || summary.length < 25 || summary.toLowerCase() === cleanTitle.toLowerCase()) {
          summary = `Live reporting on ${agency.acronym} concerning ${cleanTitle}. Full coverage by ${publisher}.`
        }

        const normTitle = cleanTitle.toLowerCase().replace(/[^a-z0-9]/g, '')
        if (normTitle.length > 8 && !seenTitles.has(normTitle)) {
          seenTitles.add(normTitle)
          newsItems.push({
            id: `live-${agency.slug}-${i}-${Date.now()}`,
            title: cleanTitle,
            date,
            summary,
            url,
            category: detectCategory(cleanTitle, summary),
            source: publisher,
            isLive: true,
          })
        }
      }
    }
  } catch (err) {
    console.error(`Error fetching live news for ${agency.slug}:`, err)
  }

  // 2. Include verified official releases from agency registry
  if (agency.officialReleases && agency.officialReleases.length > 0) {
    for (const rel of agency.officialReleases) {
      const normTitle = rel.title.toLowerCase().replace(/[^a-z0-9]/g, '')
      if (!seenTitles.has(normTitle)) {
        seenTitles.add(normTitle)
        newsItems.push({
          ...rel,
          source: rel.source || `${agency.acronym} Official Newsroom`,
        })
      }
    }
  }

  // Store in cache
  newsCache.set(slug, {
    timestamp: now,
    items: newsItems,
  })

  return NextResponse.json({
    success: true,
    slug: agency.slug,
    name: agency.name,
    acronym: agency.acronym,
    newsUrl: agency.newsUrl,
    website: agency.website,
    count: newsItems.length,
    items: newsItems,
  })
}
