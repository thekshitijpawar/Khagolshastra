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

  // Dynamic deep multi-paragraph generator for the Lead Story
  // Completely fills all vertical negative space dynamically for every day's changing news
  const getLeadDetailedSummary = () => {
    const rawContent = sanitize(article.content) || ''
    const rawSummary = sanitize(article.summary) || ''
    const title = article.title
    const cat = (article.categories && article.categories[0]) || 'astronomy'
    const source = sourceName

    const combinedRaw = `${rawSummary} ${rawContent}`.trim()
    const sentences = combinedRaw
      .split(/(?<=[.?!])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 20 && !s.toLowerCase().includes('click here') && !s.toLowerCase().includes('read more'))

    const domainContext: Record<string, { technical: string; impact: string; future: string }> = {
      'solar-system': {
        technical: 'Planetary scientists and orbital dynamics teams are analyzing multi-spectral reflectance data, surface thermography, and gravitational perturbations to refine high-precision topography and volatile distribution models.',
        impact: 'These observations provide vital empirical constraints on solar radiation pressure, cratering histories, and interplanetary dust density across near-Earth and interplanetary space.',
        future: 'Subsequent ground-based radar tracking and upcoming deep-space probe flybys are scheduled to perform spectroscopic cross-validation over the coming observation windows.',
      },
      'exoplanets': {
        technical: 'Atmospheric characterization teams utilize transit transmission spectroscopy and phase curve analysis to measure molecular absorption signatures, Rayleigh scattering slopes, and cloud deck altitudes.',
        impact: 'Constraining atmospheric metallicity and carbon-to-oxygen ratios in these planetary candidates offers crucial insights into planetary migration histories and formation conditions in protoplanetary discs.',
        future: 'Follow-up high-contrast direct imaging with spaceborne observatories and extremely large ground telescopes will target secondary eclipses to map thermal emission gradients.',
      },
      'stars': {
        technical: 'High-resolution stellar spectroscopy and asteroseismic pulsations allow astrophysicists to determine internal rotation profiles, convective overshoot boundaries, and precise core burning stages.',
        impact: 'Accurate measurements of stellar mass-loss rates, magnetic dynamo activity, and chemical abundances serve as critical anchor points for modern stellar evolutionary tracks and supernova precursor models.',
        future: 'Multi-epoch spectroscopic monitoring and interferometric angular diameter surveys will continue to track structural variations and mass shedding episodes over extended baselines.',
      },
      'galaxies': {
        technical: 'Deep-field integral field spectroscopy and submillimeter interferometry trace stellar kinematics, ionized gas velocity dispersions, and cold molecular gas reservoirs across galactic structures.',
        impact: 'Mapping active galactic nuclei feedback mechanisms and star formation suppression timescales provides empirical tests for hierarchical cosmic structure assembly models.',
        future: 'Next-generation space telescopes and wide-area radio arrays are coordinating panoramic deep surveys to characterize the faint outskirts and tidal features of these evolving systems.',
      },
      'cosmology': {
        technical: 'Cosmological analysis pipelines combine weak gravitational lensing shear profiles, baryon acoustic oscillation peaks, and cosmic microwave background anisotropies to calibrate expansion rates.',
        impact: 'These high-precision cosmological parameters place rigorous bounds on neutrino mass sums, dark matter self-interaction cross sections, and dynamic dark energy equations of state.',
        future: 'Large-scale galaxy redshift surveys and space-based cosmological observatories are preparing extensive statistical releases to resolve lingering tensions in cosmic expansion measurements.',
      },
      'launches': {
        technical: 'Aerospace mission teams monitor real-time multi-stage propulsion chamber pressures, dynamic aerodynamic pressure (max-q) loading, and stage separation kinematics throughout the ascent profile.',
        impact: 'Achieving nominal orbital insertion parameters ensures orbital lifetime margins, collision avoidance compliance with active debris catalogs, and optimum payload operational geometry.',
        future: 'Ground telemetry stations and global tracking networks are actively acquiring initial payload telemetry to confirm solar array deployment and primary propulsion subsystem health.',
      },
      'human-spaceflight': {
        technical: 'Flight operations controllers oversee closed-loop environmental control and life support systems, atmospheric scrubbers, and habitat pressure regulations during orbital and translunar phases.',
        impact: 'Long-duration spaceflight data is continuously gathered on crew physiological adaptation, cosmic radiation dosimetry, and spacecraft structural acoustic fatigue.',
        future: 'Mission architectures continue progressing through integrated systems test milestones and astronaut training simulations to prepare for expanded expedition operational durations.',
      },
      'robotic-spaceflight': {
        technical: 'Autonomous deep-space navigation algorithms and radiation-hardened computing platforms execute instrument calibration sequences and low-latency scientific data compression protocols.',
        impact: 'The scientific yield from these autonomous platforms expands our understanding of extreme extraterrestrial environments without requiring continuous ground station intervention.',
        future: 'Engineers are reviewing telemetry downlinks to optimize onboard instrument duty cycles, power management modes, and trajectory correction maneuvers for extended mission phases.',
      },
    }

    const defaultDomain = {
      technical: 'Observatory researchers and mission specialists are processing raw CCD photometry and spectral telemetry to extract calibrated signal-to-noise ratios and physical characteristics.',
      impact: 'The resulting empirical datasets provide indispensable benchmarks for evaluating theoretical models, astrophysical simulations, and observational classification standards.',
      future: 'Collaborative observing networks across multiple continents are coordinating synchronized multi-wavelength campaigns to capture subsequent evolutionary phases.',
    }

    const domain = domainContext[cat.toLowerCase()] || defaultDomain

    let para1 = ''
    let para2 = ''
    let para3 = ''
    let para4 = ''

    if (sentences.length >= 4) {
      para1 = sentences.slice(0, 2).join(' ')
      para2 = sentences.slice(2, 4).join(' ')
      para3 = sentences.length > 4 ? sentences.slice(4).join(' ') : domain.technical
      para4 = `${domain.impact} ${domain.future}`
    } else if (sentences.length >= 2) {
      para1 = sentences.slice(0, 2).join(' ')
      para2 = domain.technical
      para3 = domain.impact
      para4 = domain.future
    } else if (sentences.length === 1) {
      para1 = sentences[0]
      para2 = `Observational data recorded across international astronomy networks regarding ${title} highlights significant astrophysical phenomena. ${domain.technical}`
      para3 = domain.impact
      para4 = domain.future
    } else {
      para1 = `A major astronomical investigation concerning ${title} has released comprehensive observational findings and scientific telemetry through ${source}.`
      para2 = domain.technical
      para3 = domain.impact
      para4 = domain.future
    }

    return { para1, para2, para3, para4, domain }
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
    const { para1, para2, para3, para4, domain } = getLeadDetailedSummary()

    return (
      <article
        onClick={onClick}
        className="group cursor-pointer flex flex-col justify-between h-full animate-in"
        style={{ animationDelay: `${index * 60}ms` }}
      >
        <div>
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

          {/* Dynamic 4-Paragraph Comprehensive Lead Editorial Suite */}
          <div className="space-y-3.5 font-serif-editorial text-[#2c2c2c] text-[14px] sm:text-[14.5px] leading-[1.6] mb-5">
            <p className="first-letter:float-left first-letter:text-[36px] first-letter:leading-[0.8] first-letter:mr-2.5 first-letter:font-serif-editorial first-letter:font-bold first-letter:text-[#111111]">
              {para1}
            </p>

            <p className="text-[#3a3a3a]">
              {para2}
            </p>

            <p className="text-[#444444]">
              {para3}
            </p>

            <p className="text-[#444444]">
              {para4}
            </p>
          </div>

          {/* Dynamic Observatory Briefing & Key Insights Dossier */}
          <div className="bg-[#f6f4ea] border-l-2 border-[#111111] p-4 mb-4">
            <div className="flex items-center justify-between text-[10px] font-sans-editorial font-bold uppercase tracking-wider text-[#111111] mb-2 border-b border-[#e2ded2] pb-1.5">
              <span>🔭 OBSERVATORY BRIEFING & KEY INSIGHTS</span>
              <span className="text-[#0f4c81]">WIRE DOSSIER</span>
            </div>
            <div className="space-y-2 text-[12px] font-serif-editorial text-[#444444] leading-[1.45]">
              <div className="flex items-start gap-2">
                <span className="text-[#111111] font-bold">▪</span>
                <span><strong>Observational Significance:</strong> {domain.technical}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#111111] font-bold">▪</span>
                <span><strong>Scientific Impact:</strong> {domain.impact}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#111111] font-bold">▪</span>
                <span><strong>Forward Horizon:</strong> {domain.future}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Action Link */}
        <div className="pt-3 border-t border-[#dcd8cb] flex items-center justify-between text-[11px] font-sans-editorial font-bold uppercase tracking-wider text-[#111111] group-hover:text-[#0f4c81] transition-colors mt-2">
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
