import { notFound } from 'next/navigation'
import { fetchArticles } from '@/lib/api'
import SectionClient from './SectionClient'

export const dynamic = 'force-dynamic'

const SUBSECTIONS: Record<string, { title: string; description: string }> = {
  'solar-system': { title: 'Solar System & Planetary Science', description: 'Planets, moons, comets, and interplanetary probe updates across the solar neighborhood.' },
  'exoplanets': { title: 'Exoplanets & Alien Worlds', description: 'New worlds, habitable zones, planetary atmospheres, and biosignature spectroscopy.' },
  'stars': { title: 'Stars & Stellar Astrophysics', description: 'Stellar evolution, supernovae, binary systems, and naked-eye targets.' },
  'milky-way': { title: 'The Milky Way Galaxy', description: 'Our galactic home, stellar streams, spiral arms, and central black hole architecture.' },
  'galaxies': { title: 'Galaxies & Extragalactic Astronomy', description: 'Cosmic mergers, quasars, dark matter halos, and the cosmic web across deep time.' },
  'exotic-objects': { title: 'Exotic Objects & High Energy Physics', description: 'Supermassive black holes, neutron stars, magnetars, and gravitational wave astronomy.' },
  'cosmology': { title: 'Cosmology & The Early Universe', description: 'The cosmic microwave background, dark energy, inflation, and cosmic dawn physics.' },
  'this-week-in-astronomy': { title: 'This Week in Astronomy', description: 'Observing highlights, celestial conjunctions, and night sky guides for observers.' },
  'today-in-the-history-of-astronomy': { title: 'Today in the History of Astronomy', description: 'Archival dispatches, historic spaceflights, and pivotal moments in science.' },
  'launches': { title: 'Rocket Launches & Orbital Manifests', description: 'Commercial and government launch timelines, Falcon 9, Starship, and payload telemetry.' },
  'human-spaceflight': { title: 'Human Spaceflight & Space Stations', description: 'Astronaut missions, Lunar Artemis architecture, orbital habitats, and crewed exploration.' },
  'robotic-spaceflight': { title: 'Robotic Spaceflight & Deep Explorers', description: 'Mars rovers, outer solar system orbiters, and autonomous sample return missions.' },
  'news': { title: 'Breaking News & Space Intelligence', description: 'Global breaking space updates from international observatories and agencies.' },
}

export async function generateStaticParams() {
  return Object.keys(SUBSECTIONS).map((slug) => ({ slug }))
}

export default async function SectionPage({ params }: { params: { slug: string } }) {
  const sectionInfo = SUBSECTIONS[params.slug]
  if (!sectionInfo) {
    notFound()
  }

  const res = await fetchArticles({ category: params.slug, limit: 30 })

  return (
    <SectionClient
      section={{ ...sectionInfo, slug: params.slug }}
      articles={res.items || []}
    />
  )
}
