'use client'

import { useEffect } from 'react'
import { Article } from '@/types'

interface ArticleModalProps {
  article: Article | null
  onClose: () => void
}

export default function ArticleModal({ article, onClose }: ArticleModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (article) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [article, onClose])

  if (!article) return null

  const dateStr = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recent Observatory Dispatch'

  const sourceName =
    article.sourceName ||
    (article.url.includes('astronomy.com')
      ? 'Astronomy.com'
      : article.url.includes('universetoday.com')
      ? 'Universe Today'
      : article.url.includes('space.com')
      ? 'Space.com'
      : 'Khagolshastra')

  const wordCount = (article.content || article.summary || article.title || '').split(/\s+/).length
  const readMins = Math.max(3, Math.min(15, Math.round(wordCount / 40) + 2))
  const imageUrl = article.imageUrl || 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in">
      <div
        className="bg-[#fdfcf4] text-[#111111] max-w-3xl w-full max-h-[90vh] overflow-y-auto border-2 border-[#111111] shadow-2xl relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Utility Bar */}
        <div className="sticky top-0 bg-[#fdfcf4] border-b border-[#111111] px-6 py-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-3 text-[11px] font-sans-editorial font-bold uppercase tracking-widest text-[#111111]">
            <span className="bg-[#ffc500] px-2 py-0.5 text-black">
              {article.categories?.[0]?.replace('-', ' ') || 'DISPATCH'}
            </span>
            <span className="text-[#888884]">•</span>
            <span>{sourceName}</span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center border border-[#111111] bg-white hover:bg-[#111111] hover:text-white transition-colors font-bold text-sm"
            aria-label="Close article"
          >
            ✕
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-10 space-y-6">
          {/* Header Metadata */}
          <div>
            <div className="text-[12px] font-sans-editorial text-[#777777] uppercase tracking-wider mb-2">
              {dateStr} • 📖 {readMins} MIN READ
            </div>
            <h1 className="text-[28px] sm:text-[36px] font-serif-editorial font-normal leading-[1.12] text-[#111111] tracking-tight">
              {article.title}
            </h1>
          </div>

          {/* Featured Image */}
          <div className="relative overflow-hidden bg-[#eae8dc] border border-[#dcd8cb]">
            <img
              src={imageUrl}
              alt={article.title}
              className="w-full max-h-[440px] object-cover"
            />
            <div className="p-2.5 bg-[#f7f6ec] border-t border-[#dcd8cb] text-[11px] font-sans-editorial text-[#666666] flex items-center justify-between">
              <span>Source: {sourceName}</span>
              <span className="text-[#888884]">Khagolshastra Intelligence Wire</span>
            </div>
          </div>

          {/* Article Body & Full Story */}
          <div className="space-y-4 font-serif-editorial text-[16px] sm:text-[17px] leading-[1.7] text-[#222222]">
            {(() => {
              const JUNK_TERMS = [
                'by submitting your information',
                'privacy policy',
                'terms & conditions',
                'terms and conditions',
                'membership journey',
                'keep exploring and earning',
                'latest space missions',
                'stargazing tips, cosmic events',
                'start exploring exclusive deals',
                'space news, cosmic updates',
                'breaking space news, the latest',
                'get full access to premium',
                'unlock instant access',
                'sign up to our newsletter',
                'join our space community',
                'cookie policy',
                'aged 16 or over',
                'welcome to space+',
                'become a member in seconds',
                'your membership perks',
                'never miss a discovery',
                '@layer global',
                '--tw-inset-shadow',
              ]

              const clean = (text?: string | null) => {
                return (text || '')
                  .replace(/<[^>]+>/g, '')
                  .replace(/\bnull\b/gi, '')
                  .replace(/\bNone\b/g, '')
                  .trim()
              }

              const cleanContent = clean(article.content)
              const cleanSummary = clean(article.summary)

              const textToRender = cleanContent.length > 30 ? cleanContent : cleanSummary.length > 30 ? cleanSummary : article.title

              const paragraphs = textToRender
                .split(/\n\n+/)
                .map((p) => p.trim())
                .filter((p) => {
                  if (p.length < 25) return false
                  const lower = p.toLowerCase()
                  return !JUNK_TERMS.some((term) => lower.includes(term))
                })

              const finalParas = paragraphs.length > 0 ? paragraphs : [cleanSummary || article.title]

              return (
                <div className="space-y-4">
                  {finalParas.map((para, idx) => (
                    <p key={idx} className="leading-relaxed text-[#2a2a2a]">
                      {para}
                    </p>
                  ))}
                </div>
              )
            })()}

            {article.tags && article.tags.length > 0 && (
              <div className="pt-6 border-t border-[#dcd8cb] flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] font-sans-editorial font-bold uppercase tracking-wider px-2.5 py-1 bg-[#eae8dc] text-[#333333]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Direct Link Action Box */}
          <div className="mt-8 pt-6 border-t-2 border-[#111111] bg-[#f7f6ec] p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-[12px] font-sans-editorial font-bold uppercase tracking-wider text-[#111111]">
                Original Source Publication
              </div>
              <div className="text-[11px] text-[#666666] font-sans-editorial">
                Read full text, charts, and peer research at {sourceName}
              </div>
            </div>

            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 bg-[#111111] hover:bg-[#ffc500] hover:text-[#111111] text-white text-[11px] font-sans-editorial font-bold uppercase tracking-widest transition-colors flex items-center gap-2 whitespace-nowrap shadow-xs"
            >
              <span>READ AT {sourceName.toUpperCase()}</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
