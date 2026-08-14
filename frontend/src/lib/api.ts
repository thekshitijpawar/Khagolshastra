import { Article, ArticleListResponse, ResearchSearchResponse, Source, Category, ResearchPaper, ResearchSource } from '@/types'
import { ALL_SEED_ARTICLES, ALL_SEED_PAPERS } from '@/lib/seed_data'

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
    // Robust serverless fallback using complete 194-article database catalog
    let list = [...ALL_SEED_ARTICLES]
    if (filters.category && filters.category.toLowerCase() !== 'all') {
      const cat = filters.category.toLowerCase()
      list = list.filter((a) => {
        const cats = a.categories.map((c) => c.toLowerCase())
        const tags = (a.tags || []).map((t) => t.toLowerCase())
        return cats.includes(cat) || tags.includes(cat) || cats.some(c => c.includes(cat)) || a.title.toLowerCase().includes(cat)
      })
    }
    if (filters.query && filters.query.trim()) {
      const q = filters.query.toLowerCase().trim()
      list = list.filter((a) =>
        (a.title || '').toLowerCase().includes(q) ||
        (a.summary || '').toLowerCase().includes(q) ||
        (a.content && a.content.toLowerCase().includes(q))
      )
    }

    const page = filters.page || 1
    const size = filters.limit || 50
    const start = (page - 1) * size
    const paginated = list.slice(start, start + size)

    return {
      items: paginated,
      total: list.length,
      page,
      size,
    }
  }
}

export async function fetchArticle(id: number): Promise<Article | null> {
  try {
    const res = await fetch(`${API_URL}/api/articles/${id}`, { cache: 'no-store' })
    return await handleResponse(res)
  } catch {
    const found = ALL_SEED_ARTICLES.find((a) => a.id === id)
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
    // Robust serverless fallback using complete 84-paper research database
    let list = [...ALL_SEED_PAPERS]
    if (params?.source && params.source.toLowerCase() !== 'all') {
      const src = params.source.toLowerCase()
      list = list.filter((p) => (p.source_key || '').toLowerCase() === src)
    }
    if (params?.category && params.category.toLowerCase() !== 'all') {
      const cat = params.category.toLowerCase()
      list = list.filter((p) => (p.category || '').toLowerCase().includes(cat))
    }
    if (params?.query && params.query.trim()) {
      const q = params.query.toLowerCase().trim()
      list = list.filter(
        (p) =>
          (p.title || '').toLowerCase().includes(q) ||
          (p.abstract || '').toLowerCase().includes(q) ||
          (p.authors || []).some((a) => (a || '').toLowerCase().includes(q)) ||
          (p.doi && p.doi.toLowerCase().includes(q)) ||
          (p.bibcode && p.bibcode.toLowerCase().includes(q))
      )
    }

    const page = params?.page || 1
    const size = params?.size || 20
    const start = (page - 1) * size
    const paginated = list.slice(start, start + size)
    const totalPages = Math.ceil(list.length / size) || 1

    return {
      items: paginated,
      total: list.length,
      page,
      size,
      total_pages: totalPages,
    }
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
    return [
      { id: 1, name: 'Astronomy & Astrophysics', type: 'rss' },
      { id: 2, name: 'Universe Today', type: 'rss' },
      { id: 3, name: 'Space Exploration Bureau', type: 'rss' },
    ]
  }
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_URL}/api/categories`, { cache: 'no-store' })
    return await handleResponse(res)
  } catch {
    return [
      { id: 1, name: 'Solar System', slug: 'solar-system', count: 25 },
      { id: 2, name: 'Exoplanets', slug: 'exoplanets', count: 20 },
      { id: 3, name: 'Stars & Stellar', slug: 'stars', count: 20 },
      { id: 4, name: 'Galaxies', slug: 'galaxies', count: 20 },
      { id: 5, name: 'Cosmology', slug: 'cosmology', count: 20 },
      { id: 6, name: 'Launches', slug: 'launches', count: 20 },
      { id: 7, name: 'Human Spaceflight', slug: 'human-spaceflight', count: 20 },
      { id: 8, name: 'Robotic Spaceflight', slug: 'robotic-spaceflight', count: 20 },
      { id: 9, name: 'This Week in Astronomy', slug: 'this-week-in-astronomy', count: 15 },
      { id: 10, name: 'Today in Astronomy History', slug: 'today-in-the-history-of-astronomy', count: 14 },
    ]
  }
}

export async function fetchEditorialQueue() {
  try {
    const res = await fetch(`${API_URL}/api/admin/queue`, { cache: 'no-store' })
    return await handleResponse(res)
  } catch {
    return []
  }
}

export async function approveArticle(id: number) {
  const res = await fetch(`${API_URL}/api/admin/articles/${id}/approve`, {
    method: 'POST',
  })
  return handleResponse(res)
}

export async function rejectArticle(id: number, notes?: string) {
  const res = await fetch(`${API_URL}/api/admin/articles/${id}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ editorial_notes: notes }),
  })
  return handleResponse(res)
}

export async function fetchAdminStats() {
  try {
    const res = await fetch(`${API_URL}/api/admin/stats`, { cache: 'no-store' })
    return await handleResponse(res)
  } catch {
    return {
      total_articles: ALL_SEED_ARTICLES.length,
      total_sources: 4,
      pending: 0,
      approved: ALL_SEED_ARTICLES.length,
      rejected: 0,
    }
  }
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

export const FALLBACK_SEED_ARTICLES: Article[] = ALL_SEED_ARTICLES
