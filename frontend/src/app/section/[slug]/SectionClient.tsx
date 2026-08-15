'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Article } from '@/types'
import ArticleCard from '@/components/ArticleCard'
import ArticleModal from '@/components/ArticleModal'

interface SectionClientProps {
  section: { title: string; description: string; slug: string }
  articles: Article[]
}

export default function SectionClient({ section, articles = [] }: SectionClientProps) {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)

  return (
    <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-10 py-10">
      {/* Header Banner */}
      <div className="mb-8 border-b-2 border-[#111111] pb-6">
        <Link
          href="/"
          className="text-[11px] font-sans-editorial font-bold uppercase tracking-widest text-[#777777] hover:text-[#111111] transition-colors mb-3 inline-block"
        >
          ← Return to Front Page
        </Link>
        <div className="flex items-center gap-2 mb-2">
          <span className="eyebrow text-[#ffc500] bg-[#111111] px-2 py-0.5">SECTION ARCHIVE</span>
          <span className="text-xs text-[#888]">•</span>
          <span className="text-[11px] font-sans-editorial text-[#666] uppercase">OBSERVATORY WIRE ARCHIVE</span>
        </div>
        <h1 className="text-[34px] sm:text-[44px] font-serif-editorial font-normal leading-tight text-[#111111] mb-2">
          {section.title}
        </h1>
        <p className="text-[16px] font-serif-editorial text-[#555555] max-w-3xl leading-relaxed">
          {section.description}
        </p>
      </div>

      {/* Grid of Articles */}
      {articles.length === 0 ? (
        <div className="text-center py-16 bg-[#f7f6ec] border border-[#dcd8cb]">
          <p className="font-serif-editorial text-[#666]">No articles currently filed under this section.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article, i) => (
            <ArticleCard
              key={article.id || i}
              article={article}
              index={i}
              variant="bento"
              onClick={() => setSelectedArticle(article)}
            />
          ))}
        </div>
      )}

      {/* Reader Modal */}
      <ArticleModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />
    </div>
  )
}
