import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { SPACE_AGENCIES, getAgencyBySlug } from '@/lib/agencies'
import AgencyClient from './AgencyClient'

interface Props {
  params: {
    slug: string
  }
}

export function generateStaticParams() {
  return SPACE_AGENCIES.map((agency) => ({
    slug: agency.slug,
  }))
}

export function generateMetadata({ params }: Props): Metadata {
  const agency = getAgencyBySlug(params.slug)
  if (!agency) {
    return {
      title: 'Space Agency News | Khagolshastra',
    }
  }

  return {
    title: `${agency.acronym} News & Dispatches – ${agency.name} | Khagolshastra`,
    description: `Real-time news dispatches, mission updates, and scientific papers from ${agency.name} (${agency.acronym}) in ${agency.country}.`,
  }
}

export default function AgencyPage({ params }: Props) {
  const agency = getAgencyBySlug(params.slug)

  if (!agency) {
    notFound()
  }

  return <AgencyClient agency={agency} />
}
