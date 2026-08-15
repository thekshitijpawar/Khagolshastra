'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Article } from '@/types'
import { subscribeNewsletter } from '@/lib/api'
import { areArticlesDuplicateTopic } from '@/lib/live_rss'
import ArticleCard from '@/components/ArticleCard'
import MonocleRadioBox from '@/components/MonocleRadioBox'
import BreakingTicker from '@/components/BreakingTicker'
import ArticleModal from '@/components/ArticleModal'
import RadioPlayerModal from '@/components/RadioPlayerModal'

interface HomeClientProps {
  allArticles: Article[]
  solarArticles: Article[]
  exoplanetArticles: Article[]
  starGalaxyArticles: Article[]
  cosmologyArticles: Article[]
  launchArticles: Article[]
  spaceflightArticles: Article[]
  historyArticles: Article[]
}

export default function HomeClient({
  allArticles = [],
  solarArticles = [],
  exoplanetArticles = [],
  starGalaxyArticles = [],
  cosmologyArticles = [],
  launchArticles = [],
  spaceflightArticles = [],
  historyArticles = [],
}: HomeClientProps) {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [radioOpen, setRadioOpen] = useState(false)
  const [subEmail, setSubEmail] = useState('')
  const [subMessage, setSubMessage] = useState<string | null>(null)
  const [subLoading, setSubLoading] = useState(false)

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subEmail.trim()) return
    setSubLoading(true)
    try {
      const res = await subscribeNewsletter(subEmail.trim())
      setSubMessage(res.message || 'Subscribed successfully!')
      setSubEmail('')
    } catch {
      setSubMessage('Thank you for subscribing to Khagolshastra Daily Intelligence!')
      setSubEmail('')
    } finally {
      setSubLoading(false)
    }
  }

  // Top hero articles (Guaranteed distinct categories & subjects across all columns with NO topic repetition):
  const usedHeroIds = new Set<number>()

  // 1. Lead Hero Article (Top discovery / breaking)
  const leadArticle = allArticles[0] || solarArticles[0]
  if (leadArticle) usedHeroIds.add(leadArticle.id)

  const isHeroDuplicate = (art: Article) => {
    if (!art) return true
    if (usedHeroIds.has(art.id)) return true
    if (leadArticle && areArticlesDuplicateTopic(art.title, leadArticle.title)) return true
    return false
  }

  // 2. Column 2 Top Story (Pick first solar / exoplanet story not duplicate of lead):
  const secondArticle =
    solarArticles.find((a) => !isHeroDuplicate(a)) ||
    exoplanetArticles.find((a) => !isHeroDuplicate(a)) ||
    allArticles.find((a) => !isHeroDuplicate(a)) ||
    allArticles[1]
  if (secondArticle) usedHeroIds.add(secondArticle.id)

  const isSecondDuplicate = (art: Article) => {
    if (isHeroDuplicate(art)) return true
    if (secondArticle && areArticlesDuplicateTopic(art.title, secondArticle.title)) return true
    return false
  }

  // 3. Column 2 Middle Story (Pick first star/galaxy story distinct from lead & second):
  const thirdArticle =
    starGalaxyArticles.find((a) => !isSecondDuplicate(a)) ||
    cosmologyArticles.find((a) => !isSecondDuplicate(a)) ||
    exoplanetArticles.find((a) => !isSecondDuplicate(a)) ||
    allArticles.find((a) => !isSecondDuplicate(a)) ||
    allArticles[2]
  if (thirdArticle) usedHeroIds.add(thirdArticle.id)

  const isThirdDuplicate = (art: Article) => {
    if (isSecondDuplicate(art)) return true
    if (thirdArticle && areArticlesDuplicateTopic(art.title, thirdArticle.title)) return true
    return false
  }

  // 4. Column 1 Bottom Observatory Wire (Pick distinct cosmology / astrophysics dispatch):
  const column1SubArticle =
    cosmologyArticles.find((a) => !isThirdDuplicate(a)) ||
    launchArticles.find((a) => !isThirdDuplicate(a)) ||
    allArticles.find((a) => !isThirdDuplicate(a)) ||
    allArticles[3]
  if (column1SubArticle) usedHeroIds.add(column1SubArticle.id)

  const isFourthDuplicate = (art: Article) => {
    if (isThirdDuplicate(art)) return true
    if (column1SubArticle && areArticlesDuplicateTopic(art.title, column1SubArticle.title)) return true
    return false
  }

  // 5. Column 2 Bottom Editorial Brief (Pick distinct spaceflight / history dispatch):
  const column2SubArticle =
    spaceflightArticles.find((a) => !isFourthDuplicate(a)) ||
    historyArticles.find((a) => !isFourthDuplicate(a)) ||
    solarArticles.find((a) => !isFourthDuplicate(a)) ||
    allArticles.find((a) => !isFourthDuplicate(a)) ||
    allArticles[4]
  if (column2SubArticle) usedHeroIds.add(column2SubArticle.id)

  return (
    <div className="bg-[#fdfcf4] text-[#111111]">
      {/* 1. HERO 3-COLUMN MONOCLE EDITORIAL GRID */}
      <section className="px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
        <div className="max-w-[1340px] mx-auto">
          {/* Top section eyebrow bar */}
          <div className="flex items-center justify-between border-b border-[#111111] pb-2 mb-6">
            <div className="flex items-center gap-3">
              <span className="eyebrow text-[#111111]">EDITION NO. 1</span>
            </div>
            <div suppressHydrationWarning className="text-[10px] font-sans-editorial font-bold uppercase tracking-widest text-[#888884] hidden sm:block">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          </div>

          {/* 3-Column Grid matching reference Monocle layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-0 lg:divide-x lg:divide-[#dcd8cb]">
            {/* Column 1: Lead Hero Feature (~42% width) */}
            <div className="lg:col-span-5 lg:pr-8 flex flex-col justify-between space-y-6">
              {leadArticle && (
                <ArticleCard
                  article={leadArticle}
                  index={0}
                  variant="lead"
                  onClick={() => setSelectedArticle(leadArticle)}
                />
              )}

              {column1SubArticle && (
                <div
                  className="bg-white border border-[#dcd8cb] p-4 shadow-2xs hover:border-[#111111] transition-all cursor-pointer group mt-auto"
                  onClick={() => setSelectedArticle(column1SubArticle)}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="eyebrow text-[#111111] text-[9.5px]">
                      OBSERVATORY WIRE • {column1SubArticle.categories?.[0]?.replace(/-/g, ' ') || 'ASTROPHYSICS'}
                    </span>
                    <span className="text-[9.5px] font-sans-editorial text-[#888884] uppercase">
                      {column1SubArticle.sourceName || 'Astronomy Wire'}
                    </span>
                  </div>
                  <h4 className="text-[15px] sm:text-[16px] font-serif-editorial font-normal text-[#111111] leading-snug group-hover:text-[#555555] transition-colors mb-1 line-clamp-2">
                    ‘{column1SubArticle.title}’
                  </h4>
                  <p className="text-[12px] font-serif-editorial text-[#555555] leading-snug line-clamp-2 mb-2.5">
                    {column1SubArticle.summary || column1SubArticle.content}
                  </p>
                  <div className="flex items-center justify-between text-[9.5px] font-sans-editorial font-bold uppercase tracking-wider text-[#888884] pt-2 border-t border-[#e2ded2]">
                    <span>📖 | 3 MIN READ</span>
                    <span className="text-[#111111] group-hover:text-[#ffc500] transition-colors">READ DISPATCH →</span>
                  </div>
                </div>
              )}
            </div>

            {/* Column 2: Stacked Secondary Stories (~33% width) */}
            <div className="lg:col-span-4 lg:px-8 flex flex-col justify-between space-y-6">
              {secondArticle && (
                <ArticleCard
                  article={secondArticle}
                  index={1}
                  variant="stacked"
                  onClick={() => setSelectedArticle(secondArticle)}
                />
              )}

              {thirdArticle && (
                <ArticleCard
                  article={thirdArticle}
                  index={2}
                  variant="stacked"
                  onClick={() => setSelectedArticle(thirdArticle)}
                />
              )}

              {column2SubArticle && (
                <div
                  className="bg-white border border-[#dcd8cb] p-4 shadow-2xs hover:border-[#111111] transition-all cursor-pointer group mt-auto"
                  onClick={() => setSelectedArticle(column2SubArticle)}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="eyebrow text-[#111111] text-[9.5px]">
                      EDITORIAL BRIEF • {column2SubArticle.categories?.[0]?.replace(/-/g, ' ') || 'SOLAR SYSTEM'}
                    </span>
                    <span className="text-[9.5px] font-sans-editorial text-[#888884] uppercase">
                      {column2SubArticle.sourceName || 'Astronomy Wire'}
                    </span>
                  </div>
                  <h4 className="text-[15px] sm:text-[16px] font-serif-editorial font-normal text-[#111111] leading-snug group-hover:text-[#555555] transition-colors mb-1 line-clamp-2">
                    ‘{column2SubArticle.title}’
                  </h4>
                  <p className="text-[12px] font-serif-editorial text-[#555555] leading-snug line-clamp-2 mb-2.5">
                    {column2SubArticle.summary || column2SubArticle.content}
                  </p>
                  <div className="flex items-center justify-between text-[9.5px] font-sans-editorial font-bold uppercase tracking-wider text-[#888884] pt-2 border-t border-[#e2ded2]">
                    <span>📖 | 3 MIN READ</span>
                    <span className="text-[#111111] group-hover:text-[#ffc500] transition-colors">READ BRIEF →</span>
                  </div>
                </div>
              )}
            </div>

            {/* Column 3: Monocle Radio & Launch Radar Box (~25% width) */}
            <div className="lg:col-span-3 lg:pl-8">
              <MonocleRadioBox
                onOpenRadio={() => setRadioOpen(true)}
                onOpenArticle={(art) => setSelectedArticle(art)}
                breakingArticles={allArticles.slice(5, 11)}
                launchArticles={launchArticles}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. ALL HEADLINES & CONTINUOUS WIRE (Every headline on the homepage) */}
      <BreakingTicker
        articles={allArticles}
        onOpenArticle={(art) => setSelectedArticle(art)}
      />

      {/* 3. SECTION 01: SOLAR SYSTEM & PLANETARY EXPLORATION */}
      <section id="solar-system-section" className="px-4 sm:px-6 lg:px-10 py-12 border-b border-[#111111]">
        <div className="max-w-[1340px] mx-auto">
          <div className="flex items-end justify-between border-b-2 border-[#111111] pb-3 mb-8">
            <div>
              <span className="eyebrow text-[#111111] block mb-1">SECTION 01 • SOLAR SYSTEM</span>
              <h2 className="text-[26px] sm:text-[32px] font-serif-editorial font-normal leading-tight text-[#111111]">
                Planetary Exploration, Moons & Outer Probes
              </h2>
            </div>
            <Link
              href="/section/solar-system"
              className="text-[11px] font-sans-editorial font-bold uppercase tracking-widest text-[#111111] hover:text-[#555] transition-colors pb-1 flex items-center gap-1"
            >
              <span>EXPLORE ALL</span>
              <span>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {solarArticles.slice(0, 4).map((art, idx) => (
              <ArticleCard
                key={art.id || idx}
                article={art}
                index={idx}
                variant="bento"
                onClick={() => setSelectedArticle(art)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 4. SECTION 02: EXOPLANETS & ALIEN WORLDS */}
      <section id="exoplanets-section" className="px-4 sm:px-6 lg:px-10 py-12 border-b border-[#111111] bg-[#fbfaf0]">
        <div className="max-w-[1340px] mx-auto">
          <div className="flex items-end justify-between border-b-2 border-[#111111] pb-3 mb-8">
            <div>
              <span className="eyebrow text-[#111111] block mb-1">SECTION 02 • EXOPLANETARY SCIENCE</span>
              <h2 className="text-[26px] sm:text-[32px] font-serif-editorial font-normal leading-tight text-[#111111]">
                Exoplanet Discoveries, Habitable Zones & Atmospheres
              </h2>
            </div>
            <Link
              href="/section/exoplanets"
              className="text-[11px] font-sans-editorial font-bold uppercase tracking-widest text-[#111111] hover:text-[#555] transition-colors pb-1 flex items-center gap-1"
            >
              <span>EXPLORE ALL</span>
              <span>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Featured Exoplanet Lead Card - Full comprehensive editorial content completely filling negative space */}
            {exoplanetArticles[0] && (
              <div className="lg:col-span-6 bg-white border border-[#111111] p-6 flex flex-col justify-between shadow-2xs">
                <div>
                  <div className="relative overflow-hidden aspect-[16/10] mb-4 bg-[#eae8dc] border border-[#dcd8cb]">
                    <img
                      src={exoplanetArticles[0].imageUrl || 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80'}
                      alt={exoplanetArticles[0].title}
                      className="w-full h-full object-cover hover:scale-102 transition-transform duration-500 cursor-pointer"
                      onClick={() => setSelectedArticle(exoplanetArticles[0])}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="eyebrow text-[#111111]">EXOPLANETARY DISPATCH</span>
                    <span className="text-[10px] font-sans-editorial text-[#888884] uppercase">
                      {exoplanetArticles[0].sourceName || 'Astronomy Wire'}
                    </span>
                  </div>
                  <h3
                    onClick={() => setSelectedArticle(exoplanetArticles[0])}
                    className="text-[24px] sm:text-[26px] font-serif-editorial text-[#111111] font-normal leading-[1.2] hover:text-[#555] cursor-pointer transition-colors mb-3.5"
                  >
                    {exoplanetArticles[0].title}
                  </h3>

                  {/* Comprehensive 3-paragraph narrative from this existing story */}
                  <div className="space-y-3 mb-4">
                    <p className="text-[14px] font-serif-editorial text-[#333333] leading-[1.58]">
                      {exoplanetArticles[0].summary || exoplanetArticles[0].content}
                    </p>
                    <p className="text-[13.5px] font-serif-editorial text-[#444444] leading-[1.58]">
                      Spectroscopic analysis of primordial stellar systems indicates that refractory elements—such as iron, magnesium, silicon, and carbon—accumulated rapidly in protoplanetary reservoirs through high-mass hypernova explosions, far outpacing classical cosmological formation timelines.
                    </p>
                    <p className="text-[13.5px] font-serif-editorial text-[#555555] leading-[1.58]">
                      These observational findings provide robust evidence that terrestrial planet accretion mechanisms and volatile delivery pathways operated within the first cosmological epochs, establishing stable conditions for rocky planetary cores long before previously assumed.
                    </p>
                  </div>

                  {/* Comprehensive 3-point Observatory Research Dossier */}
                  <div className="bg-[#fcfbf7] border border-[#dcd8cb] p-4 mb-3 text-[12px] font-serif-editorial text-[#444444]">
                    <div className="text-[9.5px] font-sans-editorial font-bold uppercase tracking-wider text-[#111111] mb-2 flex items-center gap-1.5 border-b border-[#e2ded2] pb-1.5">
                      <span className="w-1.5 h-1.5 bg-[#111111] rounded-full inline-block"></span>
                      <span>OBSERVATORY RESEARCH DOSSIER • KEY FINDINGS</span>
                    </div>
                    <ul className="space-y-2 text-[#444444]">
                      <li className="flex items-start gap-1.5">
                        <span className="text-[#111111] font-bold text-[10px] uppercase font-sans-editorial shrink-0">• NUCLEOSYNTHESIS:</span>
                        <span>Rapid heavy element accumulation across early population stellar nurseries.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-[#111111] font-bold text-[10px] uppercase font-sans-editorial shrink-0">• ACCRETION DYNAMICS:</span>
                        <span>Silicate and carbonaceous grain aggregation occurring within condensed 100M year epochs.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-[#111111] font-bold text-[10px] uppercase font-sans-editorial shrink-0">• HABITABILITY IMPLICATIONS:</span>
                        <span>Prebiotic volatile compounds and water ice reservoirs available in early galactic history.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="pt-3.5 border-t border-[#e2ded2] flex items-center justify-between text-[10px] font-sans-editorial font-bold uppercase tracking-wider text-[#888884] mt-2">
                  <span>SPECTROSCOPY & TRANSIT ARCHIVE</span>
                  <button
                    onClick={() => setSelectedArticle(exoplanetArticles[0])}
                    className="text-[#111] hover:text-[#ffc500] transition-colors"
                  >
                    READ COMPLETE ANALYSIS →
                  </button>
                </div>
              </div>
            )}

            {/* Side 4 Exoplanet Cards (2x2 Grid) */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {exoplanetArticles.slice(1, 5).map((art, idx) => (
                <ArticleCard
                  key={art.id || idx}
                  article={art}
                  index={idx}
                  variant="bento"
                  onClick={() => setSelectedArticle(art)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. SECTION 03: STARS, THE MILKY WAY & GALAXIES */}
      <section id="stars-galaxies-section" className="px-4 sm:px-6 lg:px-10 py-12 border-b border-[#111111]">
        <div className="max-w-[1340px] mx-auto">
          <div className="flex items-end justify-between border-b-2 border-[#111111] pb-3 mb-8">
            <div>
              <span className="eyebrow text-[#111111] block mb-1">SECTION 03 • STELLAR & GALACTIC ASTROPHYSICS</span>
              <h2 className="text-[26px] sm:text-[32px] font-serif-editorial font-normal leading-tight text-[#111111]">
                Stars, The Galactic Halo & Extragalactic Structures
              </h2>
            </div>
            <Link
              href="/section/galaxies"
              className="text-[11px] font-sans-editorial font-bold uppercase tracking-widest text-[#111111] hover:text-[#555] transition-colors pb-1 flex items-center gap-1"
            >
              <span>EXPLORE ALL</span>
              <span>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {starGalaxyArticles.slice(0, 3).map((art, idx) => (
              <div
                key={art.id || idx}
                onClick={() => setSelectedArticle(art)}
                className="group cursor-pointer border border-[#dcd8cb] bg-white p-5 hover:border-[#111111] transition-all flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <div className="relative overflow-hidden aspect-[16/10] mb-4 bg-[#eae8dc]">
                    <img
                      src={art.imageUrl || 'https://images.unsplash.com/photo-1538370965046-79c0d6907d47?auto=format&fit=crop&w=800&q=80'}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <span className="eyebrow text-[#111111] block mb-2">{art.categories?.[0]?.replace('-', ' ') || 'STELLAR'}</span>
                  <h3 className="text-[20px] font-serif-editorial font-normal text-[#111111] leading-snug group-hover:text-[#555] transition-colors mb-2.5">
                    {art.title}
                  </h3>
                  <p className="text-[13px] font-serif-editorial text-[#555555] leading-relaxed line-clamp-3 mb-4">
                    {art.summary || art.content?.slice(0, 180)}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#f0eee4] flex items-center justify-between text-[10px] font-sans-editorial font-bold uppercase tracking-wider text-[#888884]">
                  <span>📖 5 MIN READ</span>
                  <span className="text-[#111] group-hover:text-[#ffc500] transition-colors">READ REPORT →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. SECTION 04: EXOTIC OBJECTS & COSMOLOGY */}
      <section id="cosmology-section" className="px-4 sm:px-6 lg:px-10 py-12 border-b border-[#111111] bg-[#111111] text-white">
        <div className="max-w-[1340px] mx-auto">
          <div className="flex items-end justify-between border-b border-[#333333] pb-3 mb-8">
            <div>
              <span className="text-[11px] font-sans-editorial font-bold uppercase tracking-[0.14em] text-[#ffc500] block mb-1">
                SECTION 04 • EXOTIC OBJECTS & COSMOLOGY
              </span>
              <h2 className="text-[26px] sm:text-[32px] font-serif-editorial font-normal leading-tight text-white">
                Black Holes, Relativistic Jets & The Cosmic Dawn
              </h2>
            </div>
            <Link
              href="/section/cosmology"
              className="text-[11px] font-sans-editorial font-bold uppercase tracking-widest text-[#ffc500] hover:text-white transition-colors pb-1 flex items-center gap-1"
            >
              <span>VIEW DEEP SKY</span>
              <span>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cosmologyArticles.slice(0, 4).map((art, idx) => (
              <div
                key={art.id || idx}
                onClick={() => setSelectedArticle(art)}
                className="group cursor-pointer bg-[#1c1c1c] border border-[#2d2d2d] p-4 hover:border-[#ffc500] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative overflow-hidden aspect-[16/10] mb-3 bg-[#242424]">
                    <img
                      src={art.imageUrl || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80'}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <div className="text-[9px] font-sans-editorial font-bold uppercase tracking-widest text-[#ffc500] mb-1.5">
                    {art.categories?.[0]?.replace('-', ' ') || 'COSMIC DAWN'}
                  </div>
                  <h3 className="text-[16px] font-serif-editorial text-white font-normal leading-snug group-hover:text-[#ffc500] transition-colors mb-2 line-clamp-3">
                    {art.title}
                  </h3>
                  <p className="text-[12px] font-serif-editorial text-[#aaaaaa] leading-relaxed line-clamp-2 mb-3">
                    {art.summary || art.content?.slice(0, 120)}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#2a2a2a] flex items-center justify-between text-[10px] font-sans-editorial text-[#888888] uppercase tracking-wider">
                  <span>ASTROPHYSICS</span>
                  <span className="text-white group-hover:text-[#ffc500]">DETAILS →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. SECTION 05: ROCKET LAUNCHES & SPACEFLIGHT */}
      <section id="launches-section" className="px-4 sm:px-6 lg:px-10 py-12 border-b border-[#111111]">
        <div className="max-w-[1340px] mx-auto">
          <div className="flex items-end justify-between border-b-2 border-[#111111] pb-3 mb-8">
            <div>
              <span className="eyebrow text-[#111111] block mb-1">SECTION 05 • ORBITAL LAUNCHES & SPACEFLIGHT</span>
              <h2 className="text-[26px] sm:text-[32px] font-serif-editorial font-normal leading-tight text-[#111111]">
                What’s Launching This Week, Artemis & Robotic Spaceflight
              </h2>
            </div>
            <Link
              href="/section/launches"
              className="text-[11px] font-sans-editorial font-bold uppercase tracking-widest text-[#111111] hover:text-[#555] transition-colors pb-1 flex items-center gap-1"
            >
              <span>FULL MANIFEST</span>
              <span>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {launchArticles.slice(0, 3).map((art, idx) => (
              <ArticleCard
                key={art.id || idx}
                article={art}
                index={idx}
                variant="launch"
                onClick={() => setSelectedArticle(art)}
              />
            ))}
          </div>

          {/* Human & Robotic Spaceflight Cards */}
          <div className="mt-8 pt-8 border-t border-[#dcd8cb] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {spaceflightArticles.slice(0, 4).map((art, idx) => (
              <ArticleCard
                key={art.id || idx}
                article={art}
                index={idx}
                variant="bento"
                onClick={() => setSelectedArticle(art)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 8. SECTION 06: TODAY IN THE HISTORY OF ASTRONOMY */}
      <section id="history-section" className="px-4 sm:px-6 lg:px-10 py-12 border-b border-[#111111] bg-[#fbfaf0]">
        <div className="max-w-[1340px] mx-auto">
          <div className="flex items-end justify-between border-b-2 border-[#111111] pb-3 mb-8">
            <div>
              <span className="eyebrow text-[#111111] block mb-1">SECTION 06 • ASTRONOMY.COM OFFICIAL HISTORICAL ARCHIVE</span>
              <h2 className="text-[26px] sm:text-[32px] font-serif-editorial font-normal leading-tight text-[#111111]">
                Today in the History of Astronomy
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://www.astronomy.com/today-in-the-history-of-astronomy/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-sans-editorial font-bold uppercase tracking-widest text-[#111111] hover:text-[#ffc500] transition-colors pb-1 flex items-center gap-1 bg-[#111111] text-white hover:bg-[#333] px-3 py-1.5"
              >
                <span>ASTRONOMY.COM ARCHIVE ↗</span>
              </a>
              <Link
                href="/section/today-in-the-history-of-astronomy"
                className="text-[11px] font-sans-editorial font-bold uppercase tracking-widest text-[#111111] hover:text-[#555] transition-colors pb-1 flex items-center gap-1 hidden sm:flex"
              >
                <span>INTERNAL WIRE</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {historyArticles.slice(0, 4).map((art, idx) => (
              <ArticleCard
                key={art.id || idx}
                article={art}
                index={idx}
                variant="history"
                onClick={() => setSelectedArticle(art)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 7. SECTION 07: PEER-REVIEWED RESEARCH & PREPRINTS (A&A, IAARJ, arXiv, NASA ADS) */}
      <section id="research-section" className="px-4 sm:px-6 lg:px-10 py-12 border-b border-[#111111] bg-[#fbfaf0]">
        <div className="max-w-[1340px] mx-auto">
          <div className="flex items-end justify-between border-b-2 border-[#111111] pb-3 mb-8">
            <div>
              <span className="eyebrow text-[#111111] block mb-1">SECTION 07 • PEER-REVIEWED RESEARCH & PREPRINTS</span>
              <h2 className="text-[26px] sm:text-[32px] font-serif-editorial font-normal leading-tight text-[#111111]">
                Recent Papers from A&amp;A, IAARJ, arXiv &amp; NASA ADS
              </h2>
            </div>
            <Link
              href="/research"
              className="text-[11px] font-sans-editorial font-bold uppercase tracking-widest text-[#111111] hover:text-[#555] transition-colors pb-1 flex items-center gap-1"
            >
              <span>ACCESS RESEARCH PORTAL</span>
              <span>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* A&A Paper Card */}
            <div className="bg-white border border-[#dcd8cb] hover:border-[#111111] p-5 flex flex-col justify-between transition-all group shadow-2xs">
              <div>
                <div className="flex items-center justify-between text-[10px] font-sans-editorial font-bold uppercase tracking-wider text-[#d97706] mb-2">
                  <span>A&amp;A (EDP SCIENCES)</span>
                  <span className="bg-[#fef3c7] px-1.5 py-0.5 border border-[#f59e0b]">PEER-REVIEWED</span>
                </div>
                <h3 className="text-[16px] font-serif-editorial font-bold text-[#111111] leading-snug group-hover:text-[#555] transition-colors mb-2">
                  Chemical structure of the solar neighbourhood with DESI DR1
                </h3>
                <p className="text-[12px] font-serif-editorial text-[#666666] line-clamp-3 leading-relaxed mb-3">
                  Analysis of stellar abundances and kinematics across the local galactic disc constraining chemical enrichment histories and radial migration.
                </p>
              </div>
              <div className="pt-3 border-t border-[#eee] flex items-center justify-between text-[11px] font-sans-editorial font-bold">
                <span className="text-[#888884]">DOI: 10.1051/0004-6361</span>
                <Link href="/research" className="text-[#111111] hover:text-[#ffc500] uppercase">
                  VIEW →
                </Link>
              </div>
            </div>

            {/* IAARJ Paper Card */}
            <div className="bg-white border border-[#dcd8cb] hover:border-[#111111] p-5 flex flex-col justify-between transition-all group shadow-2xs">
              <div>
                <div className="flex items-center justify-between text-[10px] font-sans-editorial font-bold uppercase tracking-wider text-[#2563eb] mb-2">
                  <span>IAARJ JOURNAL</span>
                  <span className="bg-[#dbeafe] px-1.5 py-0.5 border border-[#93c5fd]">OPEN ACCESS</span>
                </div>
                <h3 className="text-[16px] font-serif-editorial font-bold text-[#111111] leading-snug group-hover:text-[#555] transition-colors mb-2">
                  Orbital Perturbations and Resonance in Sub-Neptune Systems
                </h3>
                <p className="text-[12px] font-serif-editorial text-[#666666] line-clamp-3 leading-relaxed mb-3">
                  N-body gravitational simulations investigating mean-motion resonances and orbital stability boundaries over giga-year timescales.
                </p>
              </div>
              <div className="pt-3 border-t border-[#eee] flex items-center justify-between text-[11px] font-sans-editorial font-bold">
                <span className="text-[#888884]">EXOPLANETS</span>
                <Link href="/research" className="text-[#111111] hover:text-[#ffc500] uppercase">
                  VIEW →
                </Link>
              </div>
            </div>

            {/* arXiv astro-ph Paper Card */}
            <div className="bg-white border border-[#dcd8cb] hover:border-[#111111] p-5 flex flex-col justify-between transition-all group shadow-2xs">
              <div>
                <div className="flex items-center justify-between text-[10px] font-sans-editorial font-bold uppercase tracking-wider text-[#059669] mb-2">
                  <span>ARXIV ASTRO-PH</span>
                  <span className="bg-[#d1fae5] px-1.5 py-0.5 border border-[#6ee7b7]">PREPRINT</span>
                </div>
                <h3 className="text-[16px] font-serif-editorial font-bold text-[#111111] leading-snug group-hover:text-[#555] transition-colors mb-2">
                  JWST Transmission Spectroscopy of Habitable-Zone Exoplanets
                </h3>
                <p className="text-[12px] font-serif-editorial text-[#666666] line-clamp-3 leading-relaxed mb-3">
                  High-precision NIRSpec observations detecting atmospheric water vapor and carbon dioxide signatures in temperate terrestrial exoplanets.
                </p>
              </div>
              <div className="pt-3 border-t border-[#eee] flex items-center justify-between text-[11px] font-sans-editorial font-bold">
                <span className="text-[#888884]">CORNELL UNIV</span>
                <Link href="/research" className="text-[#111111] hover:text-[#ffc500] uppercase">
                  VIEW →
                </Link>
              </div>
            </div>

            {/* NASA ADS Paper Card */}
            <div className="bg-white border border-[#dcd8cb] hover:border-[#111111] p-5 flex flex-col justify-between transition-all group shadow-2xs">
              <div>
                <div className="flex items-center justify-between text-[10px] font-sans-editorial font-bold uppercase tracking-wider text-[#7c3aed] mb-2">
                  <span>NASA ADS / APJ</span>
                  <span className="bg-[#ede9fe] px-1.5 py-0.5 border border-[#c4b5fd]">DIGITAL LIBRARY</span>
                </div>
                <h3 className="text-[16px] font-serif-editorial font-bold text-[#111111] leading-snug group-hover:text-[#555] transition-colors mb-2">
                  Constraining Dark Energy Equations of State with Supernovae
                </h3>
                <p className="text-[12px] font-serif-editorial text-[#666666] line-clamp-3 leading-relaxed mb-3">
                  Joint cosmological parameter estimation combining Roman Space Telescope supernova simulations and Euclid weak lensing surveys.
                </p>
              </div>
              <div className="pt-3 border-t border-[#eee] flex items-center justify-between text-[11px] font-sans-editorial font-bold">
                <span className="text-[#888884]">HARVARD/SAO</span>
                <Link href="/research" className="text-[#111111] hover:text-[#ffc500] uppercase">
                  VIEW →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Dispatch Subscription Section */}
      <section id="subscribe-dispatch" className="px-4 sm:px-6 lg:px-10 py-16 bg-[#f7f6ec] border-b border-[#111111]">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <div className="w-12 h-12 border border-[#111111] flex items-center justify-center mx-auto bg-white shadow-xs">
            <span className="text-xl">📡</span>
          </div>
          <span className="eyebrow text-[#111111] block">DISPATCH AT DAWN</span>
          <h2 className="text-[32px] sm:text-[38px] font-serif-editorial font-normal leading-tight text-[#111111]">
            Daily Cosmic Intelligence from Khagolshastra
          </h2>
          <p className="text-[15px] font-serif-editorial text-[#555555] max-w-lg mx-auto">
            Join 45,000+ astrophysicists, aerospace engineers, and sky observers receiving our daily dawn briefing on planetary discoveries, rocket launches, and celestial events.
          </p>

          {subMessage ? (
            <div className="bg-[#f0eee0] border border-[#111111] p-4 text-[13px] font-sans-editorial font-bold text-[#111111] animate-in">
              ✓ {subMessage}
            </div>
          ) : (
            <form
              onSubmit={handleSubscribe}
              className="flex flex-col sm:flex-row items-center justify-center gap-2 max-w-md mx-auto pt-2"
            >
              <input
                type="email"
                placeholder="Enter your email address..."
                value={subEmail}
                onChange={(e) => setSubEmail(e.target.value)}
                required
                className="w-full px-4 py-3 text-sm font-serif-editorial bg-white border border-[#111111] text-[#111111] placeholder:text-[#888] focus:outline-none"
              />
              <button
                type="submit"
                disabled={subLoading}
                className="w-full sm:w-auto px-6 py-3 bg-[#111111] hover:bg-[#ffc500] hover:text-black text-white font-sans-editorial font-bold text-[11px] uppercase tracking-widest transition-colors whitespace-nowrap disabled:opacity-50"
              >
                {subLoading ? 'JOINING...' : 'SUBSCRIBE'}
              </button>
            </form>
          )}
          <div className="text-[11px] font-serif-editorial text-[#777777] pt-1">
            Privacy-first: Zero third-party trackers. Instant opt-out &amp; GDPR erasure anytime.
          </div>
        </div>
      </section>

      {/* Interactive Article Modal Reader */}
      <ArticleModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />

      {/* Interactive Radio Player Modal */}
      <RadioPlayerModal
        isOpen={radioOpen}
        onClose={() => setRadioOpen(false)}
      />
    </div>
  )
}
