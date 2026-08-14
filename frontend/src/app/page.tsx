import { fetchArticles } from '@/lib/api'
import HomeClient from '@/components/HomeClient'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  // Fetch articles across all key categories
  const [
    allRes,
    solarRes,
    exoplanetRes,
    starGalaxyRes,
    cosmologyRes,
    launchRes,
    spaceflightRes,
    historyRes,
  ] = await Promise.all([
    fetchArticles({ limit: 60 }),
    fetchArticles({ category: 'solar-system', limit: 8 }),
    fetchArticles({ category: 'exoplanets', limit: 8 }),
    fetchArticles({ category: 'galaxies', limit: 8 }),
    fetchArticles({ category: 'cosmology', limit: 8 }),
    fetchArticles({ category: 'launches', limit: 8 }),
    fetchArticles({ category: 'human-spaceflight', limit: 8 }),
    fetchArticles({ category: 'today-in-the-history-of-astronomy', limit: 8 }),
  ])

  return (
    <HomeClient
      allArticles={allRes.items || []}
      solarArticles={solarRes.items || []}
      exoplanetArticles={exoplanetRes.items || []}
      starGalaxyArticles={starGalaxyRes.items || []}
      cosmologyArticles={cosmologyRes.items || []}
      launchArticles={launchRes.items || []}
      spaceflightArticles={spaceflightRes.items || []}
      historyArticles={historyRes.items || []}
    />
  )
}
