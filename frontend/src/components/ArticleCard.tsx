'use client'

import { Article } from '@/types'
import { getArticlePrimaryCategory } from '@/lib/api'

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

  const primaryCategory = getArticlePrimaryCategory(article)
  const formattedCategory =
    primaryCategory === 'today-in-the-history-of-astronomy'
      ? 'History of Astronomy'
      : primaryCategory === 'this-week-in-astronomy'
      ? 'This Week in Astronomy'
      : primaryCategory.replace(/-/g, ' ')

  let displaySourceName = article.sourceName || ''
  if (
    !displaySourceName ||
    displaySourceName.toLowerCase().includes('history') ||
    article.url?.includes('astronomy.com')
  ) {
    displaySourceName = 'Astronomy.com'
  } else if (article.url?.includes('universetoday.com')) {
    displaySourceName = 'Universe Today'
  } else if (article.url?.includes('space.com')) {
    displaySourceName = 'Space.com'
  } else if (!displaySourceName) {
    displaySourceName = 'Observatory Wire'
  }

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

  // Balanced 2-paragraph generator for the Lead Story to perfectly fit the layout area
  const getLeadDetailedSummary = () => {
    const rawContent = sanitize(article.content) || ''
    const rawSummary = sanitize(article.summary) || ''
    const title = article.title
    const cat = primaryCategory.toLowerCase()
    const source = displaySourceName

    const combinedRaw = `${rawSummary} ${rawContent}`.trim()
    const sentences = combinedRaw
      .split(/(?<=[.?!])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 20 && !s.toLowerCase().includes('click here') && !s.toLowerCase().includes('read more'))

    const domainContext: Record<string, { technical: string; impact: string; future: string }> = {
      'solar-system': {
        technical: 'Planetary scientists and orbital dynamics teams are analyzing multi-spectral reflectance data to refine high-precision topography and volatile distribution models.',
        impact: 'These observations provide vital empirical constraints on solar radiation pressure, cratering histories, and interplanetary dust density across interplanetary space.',
        future: 'Subsequent ground-based radar tracking and deep-space probe flybys will perform spectroscopic cross-validation over the coming observation windows.',
      },
      'exoplanets': {
        technical: 'Atmospheric characterization teams utilize transit transmission spectroscopy and phase curve analysis to measure molecular absorption signatures and cloud deck altitudes.',
        impact: 'Constraining atmospheric metallicity and carbon-to-oxygen ratios in planetary candidates offers crucial insights into planetary migration histories and formation discs.',
        future: 'Follow-up high-contrast direct imaging with spaceborne observatories will target secondary eclipses to map thermal emission gradients.',
      },
      'stars': {
        technical: 'High-resolution stellar spectroscopy and asteroseismic pulsations allow astrophysicists to determine internal rotation profiles and precise core burning stages.',
        impact: 'Accurate measurements of stellar mass-loss rates and chemical abundances serve as critical anchor points for modern stellar evolutionary tracks.',
        future: 'Multi-epoch spectroscopic monitoring and interferometric angular diameter surveys will continue to track structural variations over extended baselines.',
      },
      'galaxies': {
        technical: 'Deep-field integral field spectroscopy and submillimeter interferometry trace stellar kinematics, ionized gas velocity dispersions, and cold molecular gas reservoirs.',
        impact: 'Mapping active galactic nuclei feedback mechanisms and star formation suppression timescales provides empirical tests for cosmic structure assembly.',
        future: 'Next-generation space telescopes and wide-area radio arrays are coordinating panoramic deep surveys to characterize the faint outskirts of evolving galaxies.',
      },
      'cosmology': {
        technical: 'Cosmological analysis pipelines combine weak gravitational lensing shear profiles and cosmic microwave background anisotropies to calibrate expansion rates.',
        impact: 'These high-precision cosmological parameters place rigorous bounds on neutrino mass sums, dark matter cross sections, and dynamic dark energy.',
        future: 'Large-scale galaxy redshift surveys and space-based cosmological observatories are preparing statistical releases to resolve cosmic expansion tensions.',
      },
      'launches': {
        technical: 'Aerospace mission teams monitor real-time multi-stage propulsion chamber pressures and stage separation kinematics throughout the ascent profile.',
        impact: 'Achieving nominal orbital insertion parameters ensures orbital lifetime margins and collision avoidance compliance with active catalogs.',
        future: 'Ground telemetry stations and global tracking networks are actively acquiring initial payload telemetry to confirm subsystem health.',
      },
      'human-spaceflight': {
        technical: 'Flight operations controllers oversee closed-loop environmental control and life support systems during orbital and translunar phases.',
        impact: 'Long-duration spaceflight data is continuously gathered on crew physiological adaptation, cosmic radiation dosimetry, and spacecraft structural fatigue.',
        future: 'Mission architectures continue progressing through integrated systems test milestones and astronaut simulations.',
      },
      'robotic-spaceflight': {
        technical: 'Autonomous deep-space navigation algorithms and radiation-hardened computing platforms execute instrument calibration sequences and low-latency data compression.',
        impact: 'The scientific yield from autonomous platforms expands our understanding of extreme extraterrestrial environments without continuous ground intervention.',
        future: 'Engineers are reviewing telemetry downlinks to optimize onboard instrument duty cycles and trajectory correction maneuvers.',
      },
    }

    const defaultDomain = {
      technical: 'Observatory researchers and mission specialists are processing raw CCD photometry and spectral telemetry to extract calibrated signal-to-noise ratios.',
      impact: 'The resulting empirical datasets provide indispensable benchmarks for evaluating theoretical models and astrophysical simulations.',
      future: 'Collaborative observing networks across multiple continents are coordinating synchronized multi-wavelength campaigns.',
    }

    const domain = domainContext[cat] || defaultDomain

    let para1 = ''
    let para2 = ''

    if (sentences.length >= 2) {
      para1 = sentences.slice(0, 2).join(' ')
      para2 = `${domain.technical} ${domain.impact}`
    } else if (sentences.length === 1) {
      para1 = sentences[0]
      para2 = `Observational data recorded across international astronomy networks regarding ${title} highlights significant astrophysical phenomena. ${domain.technical}`
    } else {
      para1 = `A major astronomical investigation concerning ${title} has released comprehensive observational findings and scientific telemetry through ${source}.`
      para2 = `${domain.technical} ${domain.impact}`
    }

    return { para1, para2, domain }
  }

  const getCleanSummary = (maxLen = 160) => {
    const s = sanitize(article.summary)
    if (s.length >= 20) return s.length > maxLen ? s.slice(0, maxLen) + '…' : s

    const c = sanitize(article.content)
    if (c.length >= 20) return c.length > maxLen ? c.slice(0, maxLen) + '…' : c

    return `Observatory report and dispatch analysis on ${article.title}.`
  }

  // Variant 1: Hero Lead Card (Column 1 of Monocle grid)
  if (variant === 'lead') {
    const { para1, para2, domain } = getLeadDetailedSummary()

    return (
      <article
        onClick={onClick}
        className="group cursor-pointer flex flex-col bg-white border border-[#dcd8cb] p-5 hover:border-[#111111] hover:-translate-y-1.5 hover:shadow-[0_14px_30px_rgba(0,0,0,0.10)] transition-all duration-300 ease-out transform animate-in shadow-2xs"
        style={{ animationDelay: `${index * 60}ms` }}
      >
        {/* Top Meta Bar */}
        <div className="flex items-center gap-2.5 mb-2">
          <span className="eyebrow text-[#111111]">{formattedCategory}</span>
          <span className="text-[#888884] text-xs">•</span>
          <span className="text-[10px] font-sans-editorial tracking-wider text-[#666666] uppercase">
            {displaySourceName}
          </span>
          <span className="text-[#888884] text-xs">•</span>
          <span className="bg-[#111111] text-[#ffc500] text-[9px] font-sans-editorial font-bold uppercase tracking-wider px-1.5 py-0.5">
            LEAD DISPATCH
          </span>
        </div>

        {/* Grand Headline (stays solid black) */}
        <h2 className="text-[26px] sm:text-[30px] lg:text-[34px] font-normal font-serif-editorial text-[#111111] leading-[1.12] tracking-[-0.01em] mb-2.5">
          {article.title}
        </h2>

        {/* Reading Time & Date Badge */}
        <div
          suppressHydrationWarning
          className="flex items-center gap-2 text-[10px] font-sans-editorial font-bold uppercase tracking-wider text-[#777777] pb-2.5 mb-3 border-b border-[#e2ded2]"
        >
          <span>📖 | {readMins} MIN READ</span>
          <span>•</span>
          <span>{dateStr}</span>
          <span>•</span>
          <span className="text-[#0f4c81]">PEER-VERIFIED</span>
        </div>

        {/* Photography with Caption */}
        <div className="relative overflow-hidden bg-[#eae8dc] border border-[#dcd8cb] aspect-[16/10] mb-3.5">
          <img
            src={imageUrl}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
            loading="eager"
          />
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-2 text-white text-[9.5px] font-sans-editorial tracking-wider flex items-center justify-between">
            <span>Observatory Field Capture</span>
            <span className="text-[#ffc500]">VIA {displaySourceName.toUpperCase()}</span>
          </div>
        </div>

        {/* Balanced 2-Paragraph Lead Editorial Text */}
        <div className="space-y-2.5 font-serif-editorial text-[#2c2c2c] text-[13.5px] sm:text-[14px] leading-[1.55] mb-3.5">
          <p className="first-letter:float-left first-letter:text-[32px] first-letter:leading-[0.8] first-letter:mr-2 first-letter:font-serif-editorial first-letter:font-bold first-letter:text-[#111111]">
            {para1}
          </p>

          <p className="text-[#3a3a3a]">
            {para2}
          </p>
        </div>

        {/* Key Insights Briefing Box */}
        <div className="bg-[#f6f4ea] border-l-2 border-[#111111] p-3 mb-3">
          <div className="flex items-center justify-between text-[9.5px] font-sans-editorial font-bold uppercase tracking-wider text-[#111111] mb-1.5 border-b border-[#e2ded2] pb-1">
            <span>🔭 OBSERVATORY BRIEFING & KEY INSIGHTS</span>
            <span className="text-[#0f4c81]">WIRE DOSSIER</span>
          </div>
          <div className="space-y-1 text-[11.5px] font-serif-editorial text-[#444444] leading-[1.4]">
            <div className="flex items-start gap-1.5">
              <span className="text-[#111111] font-bold">▪</span>
              <span><strong>Observational Significance:</strong> {domain.technical}</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-[#111111] font-bold">▪</span>
              <span><strong>Scientific Impact:</strong> {domain.impact}</span>
            </div>
          </div>
        </div>

        {/* Footer Action Link */}
        <div className="pt-2 border-t border-[#dcd8cb] flex items-center justify-between text-[10.5px] font-sans-editorial font-bold uppercase tracking-wider text-[#111111] group-hover:text-[#0f4c81] transition-colors mt-auto">
          <span>READ COMPLETE INVESTIGATION REPORT</span>
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
        className="group cursor-pointer animate-in flex flex-col bg-white border border-[#dcd8cb] p-3.5 hover:border-[#111111] hover:-translate-y-1.5 hover:shadow-[0_14px_30px_rgba(0,0,0,0.10)] transition-all duration-300 ease-out transform shadow-2xs"
        style={{ animationDelay: `${index * 60}ms` }}
      >
        <div className="relative overflow-hidden bg-[#eae8dc] border border-[#dcd8cb] aspect-[16/10] mb-2.5">
          <img
            src={imageUrl}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
            loading="lazy"
          />
        </div>

        <div className="flex items-center gap-2 mb-1">
          <span className="eyebrow text-[#111111] text-[9.5px]">{formattedCategory}</span>
          <span className="text-[#888884] text-xs">•</span>
          <span className="text-[9.5px] font-sans-editorial uppercase text-[#666]">{displaySourceName}</span>
        </div>

        <h3 className="text-[17px] font-normal font-serif-editorial text-[#111111] leading-[1.2] mb-1.5 line-clamp-2">
          {article.title}
        </h3>

        <p className="text-[12.5px] font-serif-editorial text-[#444444] leading-[1.45] mb-2 line-clamp-2">
          {getCleanSummary(140)}
        </p>

        <div suppressHydrationWarning className="flex items-center justify-between text-[9.5px] font-sans-editorial font-bold uppercase tracking-wider text-[#888884] pt-2 border-t border-[#e2ded2] mt-auto">
          <span>📖 | {readMins} MIN READ</span>
          <span className="text-[#111] group-hover:text-[#ffc500] transition-colors">READ REPORT →</span>
        </div>
      </article>
    )
  }

  // Variant 3: Quote / Secondary Stacked Card with Full Authentic Image
  if (variant === 'quote') {
    return (
      <article
        onClick={onClick}
        className="group cursor-pointer animate-in flex flex-col bg-white border border-[#dcd8cb] p-3.5 hover:border-[#111111] hover:-translate-y-1.5 hover:shadow-[0_14px_30px_rgba(0,0,0,0.10)] transition-all duration-300 ease-out transform shadow-2xs"
        style={{ animationDelay: `${index * 60}ms` }}
      >
        <div className="relative overflow-hidden bg-[#eae8dc] border border-[#dcd8cb] aspect-[16/10] mb-2.5">
          <img
            src={imageUrl}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
            loading="lazy"
          />
        </div>

        <div className="flex items-center gap-2 mb-1">
          <span className="eyebrow text-[#111111] text-[9.5px]">{formattedCategory}</span>
          <span className="text-[#888884] text-xs">•</span>
          <span className="text-[9.5px] font-sans-editorial uppercase text-[#666]">{displaySourceName}</span>
        </div>

        <h3 className="text-[17px] font-normal font-serif-editorial text-[#111111] leading-[1.2] mb-1.5 line-clamp-2">
          ‘{article.title}’
        </h3>

        <p className="text-[12.5px] font-serif-editorial text-[#444444] leading-[1.45] mb-2 line-clamp-2">
          {getCleanSummary(160)}
        </p>

        <div suppressHydrationWarning className="flex items-center justify-between text-[9.5px] font-sans-editorial font-bold uppercase tracking-wider text-[#888884] pt-2 border-t border-[#e2ded2] mt-auto">
          <span>📖 | {readMins} MIN READ</span>
          <span className="text-[#111] group-hover:text-[#ffc500] transition-colors">READ DISPATCH →</span>
        </div>
      </article>
    )
  }

  // Variant 4: Standard Editorial Bento Card
  if (variant === 'bento') {
    return (
      <article
        onClick={onClick}
        className="group cursor-pointer bg-[#fdfcf4] border border-[#dcd8cb] p-4 flex flex-col hover:border-[#111111] hover:-translate-y-1.5 hover:shadow-[0_14px_30px_rgba(0,0,0,0.10)] transition-all duration-300 ease-out transform shadow-2xs animate-in"
        style={{ animationDelay: `${index * 40}ms` }}
      >
        <div className="relative overflow-hidden bg-[#eae8dc] border border-[#e2ded2] aspect-[16/10] mb-3">
          <img
            src={imageUrl}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute top-2 left-2 bg-[#111111] text-[#ffc500] text-[9px] font-sans-editorial font-bold tracking-widest uppercase px-2 py-0.5">
            {formattedCategory}
          </div>
        </div>

        <div
          suppressHydrationWarning
          className="flex items-center justify-between text-[10px] font-sans-editorial text-[#888884] mb-2 uppercase tracking-wider"
        >
          <span>{displaySourceName}</span>
          <span>{dateStr}</span>
        </div>

        <h3 className="text-[18px] font-normal font-serif-editorial text-[#111111] leading-[1.22] mb-2">
          {article.title}
        </h3>

        <p className="text-[13px] font-serif-editorial text-[#555555] leading-[1.4] mb-4">
          {getCleanSummary(220)}
        </p>

        <div className="pt-2.5 border-t border-[#eee] flex items-center justify-between text-[10px] font-sans-editorial font-bold uppercase tracking-wider text-[#777] mt-auto">
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
        className="group cursor-pointer py-3 border-b border-[#dcd8cb] last:border-b-0 hover:bg-[#f7f6ec] hover:-translate-y-0.5 hover:shadow-xs px-2 transition-all duration-200 ease-out transform flex items-start justify-between gap-3 animate-in"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 text-[10px] font-sans-editorial tracking-wider uppercase">
            <span className="font-bold text-[#111111]">{formattedCategory}</span>
            <span className="text-[#999999]">•</span>
            <span className="text-[#666666]">{displaySourceName}</span>
          </div>
          <h4 className="text-[14px] font-serif-editorial text-[#111111] leading-snug line-clamp-2">
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
        className="group cursor-pointer bg-[#ffffff] border border-[#111111] p-4 flex flex-col shadow-2xs hover:border-[#111111] hover:-translate-y-1.5 hover:shadow-[0_14px_30px_rgba(0,0,0,0.12)] transition-all duration-300 ease-out transform"
      >
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
        <h3 className="text-[17px] font-serif-editorial font-bold text-[#111111] leading-tight mb-2">
          {article.title}
        </h3>
        <p className="text-[12.5px] font-serif-editorial text-[#555] mb-3">
          {getCleanSummary(180)}
        </p>
        <div className="pt-2 border-t border-[#eee] flex items-center justify-between text-[10px] font-sans-editorial font-bold uppercase tracking-wider mt-auto">
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
      className="group cursor-pointer bg-[#f7f6ec] border border-[#dcd8cb] p-4 flex flex-col hover:border-[#111111] hover:-translate-y-1.5 hover:shadow-[0_14px_30px_rgba(0,0,0,0.10)] transition-all duration-300 ease-out transform shadow-2xs"
    >
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
      <h3 className="text-[16px] font-serif-editorial text-[#111111] font-bold leading-snug mb-2">
        {article.title}
      </h3>
      <p className="text-[12.5px] font-serif-editorial text-[#555555] mb-3">
        {getCleanSummary(180)}
      </p>
      <div className="text-[10px] font-sans-editorial font-bold text-[#888884] uppercase tracking-wider pt-2 border-t border-[#e2ded2] mt-auto">
        DISPATCH RETROSPECTIVE →
      </div>
    </article>
  )
}
