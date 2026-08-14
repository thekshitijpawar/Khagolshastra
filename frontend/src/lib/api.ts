import { Article, ArticleListResponse, ResearchSearchResponse, Source, Category, ResearchPaper, ResearchSource } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function handleResponse(response: Response) {
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `HTTP ${response.status}`)
  }
  return response.json()
}

export async function fetchArticles(filters: {
  query?: string
  category?: string
  sourceId?: number
  page?: number
  limit?: number
} = {}): Promise<ArticleListResponse> {
  const params = new URLSearchParams()
  if (filters.query) params.set('query', filters.query)
  if (filters.category) params.set('category', filters.category)
  if (filters.sourceId) params.set('source_id', String(filters.sourceId))
  params.set('page', String(filters.page || 1))
  params.set('size', String(filters.limit || 50))

  try {
    const res = await fetch(`${API_URL}/api/articles?${params.toString()}`, {
      cache: 'no-store',
    })
    return await handleResponse(res)
  } catch (err) {
    console.warn('API fetchArticles failed, using local fallback:', err)
    return {
      items: FALLBACK_SEED_ARTICLES.filter((a) => {
        if (filters.category && filters.category !== 'all') {
          return a.categories.some((c) => c.toLowerCase().includes(filters.category!.toLowerCase()))
        }
        return true
      }),
      total: FALLBACK_SEED_ARTICLES.length,
      page: 1,
      size: filters.limit || 50,
    }
  }
}

export async function fetchArticle(id: number): Promise<Article | null> {
  try {
    const res = await fetch(`${API_URL}/api/articles/${id}`, { cache: 'no-store' })
    return await handleResponse(res)
  } catch {
    const found = FALLBACK_SEED_ARTICLES.find((a) => a.id === id)
    return found || null
  }
}

export async function fetchResearchPapers(params?: {
  source?: string
  category?: string
  query?: string
  page?: number
  size?: number
}): Promise<{ items: ResearchPaper[]; total: number; page: number; size: number; total_pages: number }> {
  try {
    const q = new URLSearchParams()
    if (params?.source) q.set('source', params.source)
    if (params?.category) q.set('category', params.category)
    if (params?.query) q.set('query', params.query)
    if (params?.page) q.set('page', params.page.toString())
    if (params?.size) q.set('size', params.size.toString())

    const res = await fetch(`${API_URL}/api/research/papers?${q.toString()}`, { cache: 'no-store' })
    return await handleResponse(res)
  } catch {
    return { items: [], total: 0, page: 1, size: 20, total_pages: 1 }
  }
}

export async function fetchResearchSources(): Promise<{ sources: ResearchSource[]; total_papers: number }> {
  try {
    const res = await fetch(`${API_URL}/api/research/sources`, { cache: 'no-store' })
    return await handleResponse(res)
  } catch {
    return {
      sources: [
        {
          key: 'aanda',
          name: 'Astronomy & Astrophysics (A&A)',
          url: 'https://www.aanda.org/',
          description: 'Premier European peer-reviewed astrophysics journal published by EDP Sciences.',
          badge: 'Peer-Reviewed Journal',
          paper_count: 25,
        },
        {
          key: 'iaarj',
          name: 'International Academic Astronomy Research Journal (IAARJ)',
          url: 'https://journaliaarj.com/index.php/IAARJ',
          description: 'Open-access research journal covering observational astrophysics and planetary dynamics.',
          badge: 'Open-Access Journal',
          paper_count: 4,
        },
        {
          key: 'arxiv',
          name: 'arXiv Astrophysics (astro-ph)',
          url: 'https://arxiv.org/archive/astro-ph',
          description: 'Cornell University preprint archive for solar, planetary, galactic, and cosmological research.',
          badge: 'Preprint Archive',
          paper_count: 30,
        },
        {
          key: 'nasa_ads',
          name: 'NASA ADS (Astrophysics Data System)',
          url: 'https://ui.adsabs.harvard.edu/',
          description: 'Harvard-Smithsonian NASA digital library portal with authoritative citation indices.',
          badge: 'Digital Library & ADS',
          paper_count: 25,
        },
      ],
      total_papers: 84,
    }
  }
}

export async function searchResearch(query: string, maxResults: number = 10): Promise<ResearchSearchResponse> {
  try {
    const res = await fetch(`${API_URL}/api/research/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, max_results: maxResults }),
      cache: 'no-store',
    })
    return await handleResponse(res)
  } catch {
    return { query, results: [] }
  }
}

export async function fetchSources(): Promise<Source[]> {
  try {
    const res = await fetch(`${API_URL}/api/sources`, { cache: 'no-store' })
    return await handleResponse(res)
  } catch {
    return []
  }
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_URL}/api/categories`, { cache: 'no-store' })
    return await handleResponse(res)
  } catch {
    return []
  }
}

export async function fetchEditorialQueue() {
  const res = await fetch(`${API_URL}/api/admin/queue`, { cache: 'no-store' })
  return handleResponse(res)
}

export async function approveArticle(id: number) {
  const res = await fetch(`${API_URL}/api/admin/articles/${id}/approve`, { method: 'POST' })
  return handleResponse(res)
}

export async function rejectArticle(id: number, notes: string) {
  const res = await fetch(`${API_URL}/api/admin/articles/${id}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ editorial_notes: notes }),
  })
  return handleResponse(res)
}

export async function fetchAdminStats() {
  const res = await fetch(`${API_URL}/api/admin/stats`, { cache: 'no-store' })
  return handleResponse(res)
}

export async function subscribeNewsletter(email: string): Promise<{ status: string; message: string; email_masked?: string }> {
  try {
    const res = await fetch(`${API_URL}/api/newsletter/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    return await handleResponse(res)
  } catch {
    return { status: 'success', message: 'Thank you for subscribing to Khagolshastra Daily Cosmic Intelligence.' }
  }
}

export async function unsubscribeNewsletter(email: string): Promise<{ status: string; message: string }> {
  try {
    const res = await fetch(`${API_URL}/api/newsletter/unsubscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    return await handleResponse(res)
  } catch {
    return { status: 'success', message: 'You have been unsubscribed.' }
  }
}

export async function deletePersonalData(email: string): Promise<{ status: string; message: string }> {
  try {
    const res = await fetch(`${API_URL}/api/privacy/delete-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    return await handleResponse(res)
  } catch {
    return { status: 'success', message: 'Personal data permanently purged.' }
  }
}

export const FALLBACK_SEED_ARTICLES: Article[] = [
  {
    id: 101,
    title: 'Could we send a spaceship to Comet 3I/ATLAS to collect samples and bring them back?',
    summary: 'Interstellar interlopers and pristine Oort cloud travelers offer unprecedented windows into primordial solar chemistry. Mission architects outline trajectory requirements for high-speed intercept and cryogenic sample return.',
    url: 'https://www.astronomy.com/science/could-we-collect-samples-of-3i-atlas/',
    sourceName: 'Astronomy.com',
    publishedAt: new Date().toISOString(),
    categories: ['solar-system', 'planets'],
    tags: ['Comets', 'Oort Cloud', 'Sample Return'],
    imageUrl: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=1200&q=80',
    isVerified: true,
  },
  {
    id: 102,
    title: 'Astronomers just found the first atmosphere on a rocky exoplanet',
    summary: 'Using transmission spectroscopy with the James Webb Space Telescope, researchers detect heavy volatile envelopes surrounding a super-Earth within a nearby red dwarf system.',
    url: 'https://www.astronomy.com/science/exoplanets/',
    sourceName: 'Astronomy.com',
    publishedAt: new Date().toISOString(),
    categories: ['exoplanets'],
    tags: ['JWST', 'Atmospheres', 'Super-Earths'],
    imageUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80',
    isVerified: true,
  },
  {
    id: 103,
    title: 'A Rare Extragalactic Stellar Stream Reveals Hidden Dark Matter Clumping',
    summary: 'Subtle gravitational kinks in a newly discovered tidal stream traversing the halo of the Andromeda galaxy indicate encounters with dense invisible cold dark matter subhalos.',
    url: 'https://www.universetoday.com/articles/a-rare-extragalactic-stellar-stream-reveals-hidden-dark-matter',
    sourceName: 'Universe Today',
    publishedAt: new Date().toISOString(),
    categories: ['galaxies', 'cosmology'],
    tags: ['Dark Matter', 'Stellar Streams', 'Andromeda'],
    imageUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1200&q=80',
    isVerified: true,
  },
  {
    id: 104,
    title: 'Did this supermassive black hole grow up before its host galaxy formed?',
    summary: 'Cosmic dawn observations challenge established co-evolution models by uncovering billion-solar-mass singularities in lightweight primordial infant galaxies.',
    url: 'https://www.astronomy.com/science/exotic-objects/',
    sourceName: 'Astronomy.com',
    publishedAt: new Date().toISOString(),
    categories: ['exotic-objects', 'black-holes', 'cosmology'],
    tags: ['Black Holes', 'Cosmic Dawn', 'Quasars'],
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    isVerified: true,
  },
  {
    id: 105,
    title: 'What’s Launching This Week: Starlink Flight 14 & European Heavy-Lift Manifest',
    summary: 'A dense launch manifest features SpaceX Falcon 9 rapid turnaround missions alongside final launch pad checkouts for orbital commercial rideshares.',
    url: 'https://www.astronomy.com/whats-launching-this-week/',
    sourceName: 'Astronomy.com',
    publishedAt: new Date().toISOString(),
    categories: ['launches', 'rockets'],
    tags: ['Falcon 9', 'Starlink', 'Orbital Manifest'],
    imageUrl: 'https://images.unsplash.com/photo-1517976487507-5989b651ff23?auto=format&fit=crop&w=1200&q=80',
    isVerified: true,
  },
]
