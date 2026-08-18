import { Metadata } from 'next'
import AgenciesDirectoryClient from './AgenciesDirectoryClient'

export const metadata: Metadata = {
  title: 'Government Space Agencies of the World | Khagolshastra',
  description:
    'Global directory and intelligence dispatches for national and government space agencies across North America, South America, Europe, Asia, Africa, and Oceania.',
}

export default function AgenciesPage() {
  return <AgenciesDirectoryClient />
}
