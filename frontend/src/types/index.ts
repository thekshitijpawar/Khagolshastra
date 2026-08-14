export interface Article {
  id: number
  title: string
  summary?: string
  content?: string
  url: string
  sourceName?: string
  sourceUrl?: string
  publishedAt?: string
  categories: string[]
  tags: string[]
  country?: string
  agency?: string
  imageUrl?: string
  isVerified: boolean
}

export interface ResearchPaper {
  id: number | string
  title: string
  authors: string[]
  abstract: string
  url: string
  pdf_url?: string
  pdfUrl?: string
  published_date?: string
  publishedAt?: string
  journal_name?: string
  source_key?: string
  source?: string
  doi?: string
  arxiv_id?: string
  bibcode?: string
  category?: string
  citation_count?: number
}

export interface ResearchSource {
  key: string
  name: string
  url: string
  description: string
  badge: string
  paper_count?: number
}

export interface Category {
  id: number
  name: string
  slug: string
  count: number
}

export interface Source {
  id: number
  name: string
  type: string
  country?: string
  lastFetchedAt?: string
}

export interface SearchFilters {
  query?: string
  category?: string
  sourceId?: number
  country?: string
  dateFrom?: string
  dateTo?: string
  page: number
  limit: number
}

export interface ArticleListResponse {
  items: Article[]
  total: number
  page: number
  size: number
}

export interface ResearchSearchResponse {
  query: string
  results: ResearchPaper[]
}
