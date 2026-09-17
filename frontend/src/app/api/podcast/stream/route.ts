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
  return rawUrl
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const rawTargetUrl = searchParams.get('url')

  if (!rawTargetUrl) {
    return new NextResponse('Missing url parameter', { status: 400 })
  }

  const targetUrl = cleanUrl(rawTargetUrl)

  try {
    const range = request.headers.get('range')
    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'audio/mpeg, audio/*;q=0.9, */*;q=0.8',
    }
    if (range) {
      headers['Range'] = range
    }

    const res = await fetch(targetUrl, {
      headers,
      redirect: 'follow',
      cache: 'no-store',
    })

    if (!res.ok && res.status !== 206) {
      return new NextResponse(`Upstream audio fetch failed: HTTP ${res.status}`, { status: res.status })
    }

    const responseHeaders = new Headers()
    responseHeaders.set('Content-Type', res.headers.get('content-type') || 'audio/mpeg')
    responseHeaders.set('Accept-Ranges', 'bytes')
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
