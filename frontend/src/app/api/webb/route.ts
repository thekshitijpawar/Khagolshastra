import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FALLBACK_WEBB_DATA = {
  target: 'HIP11161B',
  target_category: 'Star / Brown Dwarf',
  instruments: ['NIRSpec', 'MIRI'],
  proposal_id: '8140',
  proposal_title: 'Empirically anchoring the physics of silicate clouds using L0- T9 benchmark brown dwarfs',
  pi_name: 'Dr. Zhoujian Zhang',
  category: 'Stars And Stellar Populations',
  duration: '30m31s',
  ra: '35.90°',
  dec: '52.67°',
  status: 'LIVE OBSERVATION',
  telescope: 'James Webb Space Telescope (JWST)',
  location: 'Sun-Earth L2 Lagrange Point (1.5M km)',
  source_url: 'https://spacetelescopelive.org/webb',
}

export async function GET() {
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
        return NextResponse.json(data)
      }
    }
  } catch {
    // Return fallback gracefully
  }

  return NextResponse.json(FALLBACK_WEBB_DATA)
}
