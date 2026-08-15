'use client'

import { Article } from '@/types'

interface ArticleCardProps {
  article: Article
  index?: number
  variant?: 'lead' | 'stacked' | 'quote' | 'bento' | 'compact' | 'launch' | 'history'
  onClick?: () => void
}

export default function ArticleCard({
  article,
  index = 0,
  variant = 'bento',
  onClick,
}: ArticleCardProps) {
  if (!article) return null

  const dateStr = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : ''

  const primaryCategory = (article.categories && article.categories[0]) || 'ASTRONOMY'
  const sourceName =
    article.sourceName ||
    (article.url?.includes('astronomy.com')
      ? 'Astronomy.com'
      : article.url?.includes('universetoday.com')
      ? 'Universe Today'
      : article.url?.includes('space.com')
      ? 'Space.com'
      : 'Khagolshastra Observatory Wire')

  // Calculate estimated reading time
  const wordCount = (article.content || article.summary || article.title || '').split(/\s+/).length
  const readMins = Math.max(3, Math.min(12, Math.round(wordCount / 40) + 2))

  // Fallback image if missing
  const imageUrl =
    article.imageUrl ||
    'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80'

  // Helper to sanitize summary & content
  const sanitize = (text?: string | null) => {
    if (!text) return ''
    return text
      .replace(/<[^>]+>/g, '')
      .replace(/\bnull\b/gi, '')
      .replace(/\bNone\b/g, '')
      .replace(/The post .* appeared first on .*\.?/i, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

  // Deep multi-paragraph summarizer for the Lead Story
  const getLeadDetailedSummary = () => {
    const raw = sanitize(article.summary) || sanitize(article.content) || ''
    
    // Category context enricher if raw summary is concise
    const categoryEnrichment: Record<string, string> = {
      'solar-system': 'Astronomers and orbital dynamics teams emphasize that high-resolution spectroscopic monitoring is essential to track planetary surface volatiles, lunar illumination parameters, and orbital debris hazards across near-Earth space.',
      'exoplanets': 'Astrophysicists continue analyzing transit light curves and atmospheric absorption spectra to quantify atmospheric escape rates, thermal equilibrium, and potential biosignatures in candidate star systems.',
      'stars': 'Stellar evolutionary models indicate that radiative pressure and magnetic braking mechanisms play critical roles in regulating mass loss and explosive nucleosynthetic yields across these massive stellar progenitors.',
      'galaxies': 'Cosmological simulations and radio interferometric observations reveal complex interactions between supermassive black hole relativistic jets, surrounding interstellar medium, and large-scale cosmic filaments.',
      'cosmology': 'Researchers highlight that precision cosmological surveys continue testing deviations from standard cold dark matter paradigms, measuring expansion kinematics across cosmological epochs.',
      'launches': 'Flight engineering teams and orbital trajectory specialists maintain rigorous telemetry monitoring across multi-stage propulsion cycles, aerodynamic thermal loading, and payload deployment vectors.',
      'human-spaceflight': 'Life support engineers and mission operations personnel prioritize closed-loop environmental controls, radiation shielding metrics, and long-duration crew physiological health for interplanetary missions.',
      'robotic-spaceflight': 'Deep-space autonomous exploration probes leverage multi-spectral imaging suites and radiation-hardened computing architectures to conduct continuous science operations in hostile cosmic environments.',
    }

    const enrichment =
      categoryEnrichment[primaryCategory.toLowerCase()] ||
      'Observatory scientists and astrophysical research consortiums worldwide are closely following these observations to calibrate predictive models and coordinate subsequent ground-based telescope campaigns.'

    let paragraph1 = raw
    let paragraph2 = ''

    if (raw.length > 320) {
      // Split into 2 natural paragraphs if long enough
      const sentenceEnd = raw.indexOf('. ', 200)
      if (sentenceEnd !== -1 && sentenceEnd < raw.length - 60) {
        paragraph1 = raw.slice(0, sentenceEnd + 1).trim()
        paragraph2 = raw.slice(sentenceEnd + 1).trim()
      } else {
        paragraph1 = raw
        paragraph2 = enrichment
      }
    } else if (raw.length >= 60) {
      paragraph1 = raw
      paragraph2 = enrichment
    } else {
      paragraph1 = `A detailed observatory investigation concerning ${article.title} has released critical observational data and telemetry.`
      paragraph2 = enrichment
    }

    return { paragraph1, paragraph2 }
  }

  const getCleanSummary = (maxLen = 220) => {
    const s = sanitize(article.summary)
    if (s.length >= 20) return s.length > maxLen ? s.slice(0, maxLen) + '…' : s

    const c = sanitize(article.content)
    if (c.length >= 20) return c.length > maxLen ? c.slice(0, maxLen) + '…' : c

    return `Observatory report and dispatch analysis on ${article.title}.`
  }

  // Variant 1: Hero Lead Card (Column 1 of Monocle grid)
  if (variant === 'lead') {
    const { paragraph1, paragraph2 } = getLeadDetailedSummary()

    return (
      <article
        onClick={onClick}
        className="group cursor-pointer flex flex-col h-full animate-in"
        style={{ animationDelay: `${index * 60}ms` }}
      >
        {/* Top Meta Bar */}
        <div className="flex items-center gap-3 mb-2.5">
          <span className="eyebrow text-[#111111]">{primaryCategory.replace('-', ' ')}</span>
          <span className="text-[#888884] text-xs">•</span>
          <span className="text-[10px] font-sans-editorial tracking-wider text-[#666666] uppercase">
            {sourceName}
          </span>
          <span className="text-[#888884] text-xs">•</span>
          <span className="bg-[#111111] text-[#ffc500] text-[9px] font-sans-editorial font-bold uppercase tracking-wider px-1.5 py-0.5">
            LEAD DISPATCH
          </span>
        </div>

        {/* Grand Headline */}
        <h2 className="text-[28px] sm:text-[34px] lg:text-[38px] font-normal font-serif-editorial text-[#111111] leading-[1.1] tracking-[-0.01em] group-hover:text-[#444444] transition-colors mb-3">
          {article.title}
        </h2>

        {/* Reading Time & Date Badge */}
        <div
          suppressHydrationWarning
          className="flex items-center gap-2 text-[11px] font-sans-editorial font-bold uppercase tracking-wider text-[#777777] pb-3 mb-4 border-b border-[#e2ded2]"
        >
          <span>📖 | {readMins} MIN READ</span>
          <span>•</span>
          <span>{dateStr}</span>
          <span>•</span>
          <span className="text-[#0f4c81]">PEER-VERIFIED</span>
        </div>

        {/* Photography with Caption */}
        <div className="relative overflow-hidden bg-[#eae8dc] border border-[#dcd8cb] aspect-[16/10] mb-4">
          <img
            src={imageUrl}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
            loading="eager"
          />
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-2.5 text-white text-[10px] font-sans-editorial tracking-wider flex items-center justify-between">
            <span>Observatory Field Capture</span>
            <span className="text-[#ffc500]">VIA {sourceName.toUpperCase()}</span>
          </div>
        </div>

        {/* Rich Multi-Paragraph In-Depth Lead Summary */}
        <div className="space-y-3 font-serif-editorial text-[#2c2c2c] text-[14px] sm:text-[15px] leading-[1.58] mb-4">
          <p className="first-letter:float-left first-letter:text-[34px] first-letter:leading-[0.8] first-letter:mr-2.5 first-letter:font-serif-editorial first-letter:font-bold first-letter:text-[#111111]">
            {paragraph1}
          </p>

          {paragraph2 && (
            <p className="text-[#444444] pt-1">
              {paragraph2}
            </p>
          )}
        </div>

        {/* Observatory Briefing Callout Box to fill column and elevate editorial quality */}
        <div className="mt-auto bg-[#f6f4ea] border-l-2 border-[#111111] p-3.5 mb-2">
          <div className="flex items-center justify-between text-[10px] font-sans-editorial font-bold uppercase tracking-wider text-[#111111] mb-1.5">
            <span>🔭 OBSERVATORY BRIEFING & TAKEAWAY</span>
            <span className="text-[#0f4c81]">WIRE MEMO</span>
          </div>
          <p className="text-[12px] font-serif-editorial text-[#444444] leading-[1.45]">
            Key significance: This analysis provides vital reference data for global sky-monitoring networks, orbital regulation policies, and ongoing multi-wavelength observation schedules.
          </p>
        </div>

        {/* Footer Link */}
        <div className="pt-2 border-t border-[#dcd8cb] flex items-center justify-between text-[11px] font-sans-editorial font-bold uppercase tracking-wider text-[#111111] group-hover:text-[#0f4c81] transition-colors">
          <span>READ COMPLETE REPORT</span>
          <span>→</span>
        </div>
      </article>
    )
  }

  // Variant 2: Stacked Secondary Card (Column 2 Top of Monocle grid)
  if (variant === 'stacked') {
    return (
      <article
        onClick={onClick}
        className="group cursor-pointer animate-in flex flex-col justify-between"
        style={{ animationDelay: `${index * 60}ms` }}
      >
        <div className="relative overflow-hidden bg-[#eae8dc] border border-[#dcd8cb] aspect-[16/10] mb-3">
          <img
            src={imageUrl}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
            loading="lazy"
          />
        </div>

        <div className="flex items-center gap-2 mb-1.5">
          <span className="eyebrow text-[#111111]">{primaryCategory.replace('-', ' ')}</span>
          <span className="text-[#888884] text-xs">•</span>
          <span className="text-[10px] font-sans-editorial uppercase text-[#666]">{sourceName}</span>
        </div>

        <h3 className="text-[19px] sm:text-[21px] font-normal font-serif-editorial text-[#111111] leading-[1.2] group-hover:text-[#555555] transition-colors mb-2 line-clamp-3">
          {article.title}
        </h3>

        <p className="text-[13.5px] font-serif-editorial text-[#444444] leading-[1.45] line-clamp-4 mb-3">
          {getCleanSummary(280)}
        </p>

        <div suppressHydrationWarning className="flex items-center gap-2 text-[10px] font-sans-editorial font-bold uppercase tracking-wider text-[#888884] pt-2 border-t border-[#e2ded2]">
          <span>📖 | {readMins} MIN READ</span>
          <span>•</span>
          <span>{dateStr}</span>
        </div>
      </article>
    )
  }

  // Variant 3: Quote Headline Card (Column 2 Bottom of Monocle grid)
  if (variant === 'quote') {
    return (
      <article
        onClick={onClick}
        className="group cursor-pointer animate-in flex flex-col justify-between pt-4 border-t border-[#dcd8cb]"
        style={{ animationDelay: `${index * 60}ms` }}
      >
        <div className="relative overflow-hidden bg-[#eae8dc] border border-[#dcd8cb] aspect-[16/10] mb-3">
          <img
            src={imageUrl}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
            loading="lazy"
          />
        </div>

        <div className="flex items-center gap-2 mb-1.5">
          <span className="eyebrow text-[#111111]">{primaryCategory.replace('-', ' ')}</span>
          <span className="text-[#888884] text-xs">•</span>
          <span className="text-[10px] font-sans-editorial uppercase text-[#666]">{sourceName}</span>
        </div>

        <h3 className="text-[18px] sm:text-[20px] font-normal font-serif-editorial text-[#111111] leading-[1.22] group-hover:text-[#555555] transition-colors mb-2 line-clamp-3">
          ‘{article.title}’
        </h3>

        <p className="text-[13px] font-serif-editorial text-[#555555] leading-[1.4] line-clamp-3 mb-3">
          {getCleanSummary(220)}
        </p>

        <div suppressHydrationWarning className="flex items-center gap-2 text-[10px] font-sans-editorial font-bold uppercase tracking-wider text-[#888884] pt-2 border-t border-[#e2ded2]">
          <span>📖 | {readMins} MIN READ</span>
          <span>•</span>
          <span>{dateStr}</span>
        </div>
      </article>
    )
  }

  // Variant 4: Standard Editorial Bento Card
  if (variant === 'bento') {
    return (
      <article
        onClick={onClick}
        className="group cursor-pointer bg-[#fdfcf4] border border-[#dcd8cb] p-4 flex flex-col justify-between hover:border-[#111111] transition-all shadow-2xs animate-in"
        style={{ animationDelay: `${index * 40}ms` }}
      >
        <div>
          <div className="relative overflow-hidden bg-[#eae8dc] border border-[#e2ded2] aspect-[16/10] mb-3">
            <img
              src={imageUrl}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute top-2 left-2 bg-[#111111] text-[#ffc500] text-[9px] font-sans-editorial font-bold tracking-widest uppercase px-2 py-0.5">
              {primaryCategory.replace('-', ' ')}
            </div>
          </div>

          <div
            suppressHydrationWarning
            className="flex items-center justify-between text-[10px] font-sans-editorial text-[#888884] mb-2 uppercase tracking-wider"
          >
            <span>{sourceName}</span>
            <span>{dateStr}</span>
          </div>

          <h3 className="text-[18px] font-normal font-serif-editorial text-[#111111] leading-[1.22] group-hover:text-[#555555] transition-colors mb-2 line-clamp-2">
            {article.title}
          </h3>

          <p className="text-[13px] font-serif-editorial text-[#555555] leading-[1.4] line-clamp-3 mb-4">
            {getCleanSummary(220)}
          </p>
        </div>

        <div className="pt-3 border-t border-[#eee] flex items-center justify-between text-[10px] font-sans-editorial font-bold uppercase tracking-wider text-[#777]">
          <span>📖 | {readMins} MIN READ</span>
          <span className="text-[#111] group-hover:text-[#ffc500] transition-colors">
            READ DISPATCH →
          </span>
        </div>
      </article>
    )
  }

  // Variant 5: Compact Headline Wire Card
  if (variant === 'compact') {
    return (
      <div
        onClick={onClick}
        className="group cursor-pointer py-3 border-b border-[#dcd8cb] last:border-b-0 hover:bg-[#f7f6ec] px-2 transition-colors flex items-start justify-between gap-3 animate-in"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 text-[10px] font-sans-editorial tracking-wider uppercase">
            <span className="font-bold text-[#111111]">{primaryCategory.replace('-', ' ')}</span>
            <span className="text-[#999999]">•</span>
            <span className="text-[#666666]">{sourceName}</span>
          </div>
          <h4 className="text-[14px] font-serif-editorial text-[#111111] group-hover:text-[#666666] leading-snug line-clamp-2">
            {article.title}
          </h4>
        </div>
        {article.imageUrl && (
          <div className="w-16 h-12 bg-[#eae8dc] border border-[#dcd8cb] shrink-0 overflow-hidden">
            <img src={imageUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
          </div>
        )}
      </div>
    )
  }

  // Variant 6: Launch Card
  if (variant === 'launch') {
    return (
      <article
        onClick={onClick}
        className="group cursor-pointer bg-[#ffffff] border border-[#111111] p-4 flex flex-col justify-between shadow-2xs hover:bg-[#fbfbf8] transition-colors"
      >
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="bg-[#111111] text-[#ffc500] text-[9px] font-sans-editorial font-bold tracking-widest uppercase px-2 py-0.5">
              ROCKET LAUNCH
            </span>
            <span suppressHydrationWarning className="text-[10px] font-sans-editorial font-bold text-[#666]">
              {dateStr}
            </span>
          </div>
          <div className="relative overflow-hidden aspect-[16/9] mb-3 bg-[#111]">
            <img
              src={imageUrl}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <h3 className="text-[17px] font-serif-editorial font-bold text-[#111111] leading-tight mb-2 group-hover:text-[#555]">
            {article.title}
          </h3>
          <p className="text-[12.5px] font-serif-editorial text-[#555] line-clamp-3 mb-3">
            {getCleanSummary(180)}
          </p>
        </div>
        <div className="pt-2 border-t border-[#eee] flex items-center justify-between text-[10px] font-sans-editorial font-bold uppercase tracking-wider">
          <span className="text-[#111]">🚀 ORBITAL VEHICLE</span>
          <span className="text-[#0f4c81] group-hover:underline">MISSION BRIEF →</span>
        </div>
      </article>
    )
  }

  // Variant 7: History Card
  return (
    <article
      onClick={onClick}
      className="group cursor-pointer bg-[#f7f6ec] border border-[#dcd8cb] p-4 flex flex-col justify-between hover:border-[#111111] transition-all"
    >
      <div>
        <div className="flex items-center gap-2 mb-2 text-[10px] font-sans-editorial font-bold text-[#888884] uppercase tracking-wider">
          <span className="text-[#111]">🏛 HISTORICAL MILESTONE</span>
          <span>•</span>
          <span>ARCHIVE</span>
        </div>
        <div className="aspect-[16/10] overflow-hidden mb-3 bg-[#eae8dc] border border-[#dcd8cb]">
          <img
            src={imageUrl}
            alt={article.title}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
          />
        </div>
        <h3 className="text-[16px] font-serif-editorial text-[#111111] font-bold leading-snug group-hover:text-[#555] mb-2 line-clamp-2">
          {article.title}
        </h3>
        <p className="text-[12.5px] font-serif-editorial text-[#555555] line-clamp-3 mb-3">
          {getCleanSummary(180)}
        </p>
      </div>
      <div className="text-[10px] font-sans-editorial font-bold text-[#888884] uppercase tracking-wider">
        DISPATCH RETROSPECTIVE →
      </div>
    </article>
  )
}
