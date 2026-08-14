'use client'

import { ResearchPaper } from '@/types'

interface ResearchCardProps {
  paper: ResearchPaper
  index?: number
}

export default function ResearchCard({ paper, index = 0 }: ResearchCardProps) {
  return (
    <div
      className="animate-in border-b border-rule-gray pb-6 mb-6 last:border-b-0 last:pb-0 last:mb-0"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-heading font-normal tracking-tight text-folio-black leading-tight mb-2">
            <a
              href={paper.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-caption-gray transition-colors"
            >
              {paper.title}
            </a>
          </h3>

          <p className="text-body text-caption-gray leading-relaxed mb-3">
            {paper.authors.slice(0, 5).join(', ')}
            {paper.authors.length > 5 && ` +${paper.authors.length - 5} more`}
          </p>

          <p className="text-body text-caption-gray leading-relaxed line-clamp-2 mb-3">
            {paper.abstract}
          </p>

          <div className="flex items-center gap-3 text-caption text-mute-gray">
            <span className="eyebrow">{paper.source}</span>
            {paper.publishedAt && <span>·</span>}
            {paper.publishedAt && <span>{new Date(paper.publishedAt).toLocaleDateString()}</span>}
          </div>
        </div>

        {paper.pdfUrl && (
          <a
            href={paper.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 px-4 py-2 bg-folio-black text-broadsheet-white text-sm font-bold tracking-widest uppercase hover:bg-charcoal transition-colors"
            style={{ fontFamily: 'var(--font-helvetica-neue)' }}
          >
            PDF
          </a>
        )}
      </div>
    </div>
  )
}
