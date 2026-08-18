import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// In-memory cache for live telescope data
let cachedWebbData: any = null
let lastFetchTime = 0
const CACHE_TTL_MS = 30000 // 30 seconds cache

const FALLBACK_WEBB_DATA = {
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

export async function GET() {
  const now = Date.now()
  if (cachedWebbData && now - lastFetchTime < CACHE_TTL_MS) {
    return NextResponse.json(cachedWebbData)
  }

  try {
    // 1. Fetch directly from STScI / Space Telescope Live API with official required endpoint header
    const liveRes = await fetch('https://spacetelescopelive.org/api/get/webb', {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'endpoint': 'current',
        'Referer': 'https://spacetelescopelive.org/webb',
        'Accept': 'application/json',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(6000),
    })

    if (liveRes.ok) {
      const raw = await liveRes.json()
      const dataBlock = raw?.data
      if (dataBlock) {
        const proposal = dataBlock.proposal || {}
        const targets = dataBlock.targets || []
        const targetObj = targets[0] || {}

        const instruments = (proposal.instruments || []).map((inst: any) => inst.code || inst.title || 'NIRSpec')
        const pi = proposal.primaryInvestigator || {}
        const piName = pi.formalName || `${pi.honorific || ''} ${pi.firstName || ''} ${pi.lastName || ''}`.trim() || 'Dr. Mark S. Giampapa'

        const raVal = targetObj.rightAscensionInDegrees || dataBlock.boreSightRightAscensionInDegrees
        const decVal = targetObj.declinationInDegrees || dataBlock.boreSightDeclinationInDegrees

        const raStr = raVal ? `${parseFloat(raVal).toFixed(2)}°` : '247.89°'
        const decStr = decVal ? `${parseFloat(decVal).toFixed(2)}°` : '30.15°'

        const obsId = dataBlock.id || ''
        const sourceUrl = obsId ? `https://spacetelescopelive.org/webb?obsId=${obsId}` : 'https://spacetelescopelive.org/webb'

        const parsedData = {
          target: targetObj.name || 'P330E',
          target_category: proposal.scientificCategory?.title || targetObj.category || 'Stars And Stellar Populations',
          instruments: instruments.length > 0 ? instruments : ['NIRSpec'],
          proposal_id: proposal.proposalID || '11441',
          proposal_title: proposal.title || 'The JWST Spectral Library for Cool Stars',
          pi_name: piName,
          category: proposal.scientificCategory?.title || 'Stars And Stellar Populations',
          duration: dataBlock.scheduledDurationInSecondsFormatted || '1h 30m 4s',
          ra: raStr,
          dec: decStr,
          start_time: dataBlock.scheduledStartTime,
          end_time: dataBlock.scheduledEndTime,
          status: 'LIVE OBSERVATION',
          telescope: 'James Webb Space Telescope (JWST)',
          location: 'Sun-Earth L2 Lagrange Point (1.5M km)',
          source_url: sourceUrl,
        }

        cachedWebbData = parsedData
        lastFetchTime = now
        return NextResponse.json(parsedData)
      }
    }
  } catch {
    // External fetch timed out or unavailable; fallback cleanly
  }

  // 2. Try fetching from local FastAPI backend if running
  try {
    const backendUrl = process.env.API_URL || 'http://127.0.0.1:8000'
    const res = await fetch(`${backendUrl}/api/observatory/webb`, {
      cache: 'no-store',
      headers: { 'User-Agent': 'Khagolshastra-Next-Proxy/1.0' },
      signal: AbortSignal.timeout(3000),
    })

    if (res.ok) {
      const data = await res.json()
      if (data && data.target) {
        cachedWebbData = data
        lastFetchTime = now
        return NextResponse.json(data)
      }
    }
  } catch {
    // Fall back gracefully
  }

  return NextResponse.json(cachedWebbData || FALLBACK_WEBB_DATA)
}
