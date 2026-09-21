import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function cleanUrl(rawUrl: string): string {
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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const rawTargetUrl = searchParams.get('url')

  if (!rawTargetUrl) {
    return new NextResponse('Missing url parameter', { status: 400 })
  }

  const initialUrl = cleanUrl(rawTargetUrl)

  try {
    // 1. Resolve redirect to edge CDN URL first so node fetch does not strip Range header on cross-domain 302
    let finalUrl = initialUrl
    try {
      const headRes = await fetch(initialUrl, {
        method: 'HEAD',
        redirect: 'follow',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      })
      if (headRes.url) {
        finalUrl = headRes.url
      }
    } catch {}

    // 2. Fetch final edge URL with client Range header preserved
    const range = request.headers.get('range')
    const fetchHeaders: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'audio/mpeg, audio/*;q=0.9, */*;q=0.8',
    }
    if (range) {
      fetchHeaders['Range'] = range
    }

    const res = await fetch(finalUrl, {
      headers: fetchHeaders,
      redirect: 'follow',
      cache: 'no-store',
    })

    if (!res.ok && res.status !== 206) {
      return new NextResponse(`Upstream audio fetch failed: HTTP ${res.status}`, { status: res.status })
    }

    const responseHeaders = new Headers()
    responseHeaders.set('Content-Type', res.headers.get('content-type') || 'audio/mpeg')
    responseHeaders.set('Accept-Ranges', 'bytes')
    responseHeaders.set('Access-Control-Allow-Origin', '*')
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
    responseHeaders.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800')

    const contentLength = res.headers.get('content-length')
    if (contentLength) responseHeaders.set('Content-Length', contentLength)

    const contentRange = res.headers.get('content-range')
    if (contentRange) responseHeaders.set('Content-Range', contentRange)

    return new NextResponse(res.body as any, {
      status: res.status,
      headers: responseHeaders,
    })
  } catch (err: any) {
    return new NextResponse(`Audio Proxy Error: ${err.message}`, { status: 500 })
  }
}
