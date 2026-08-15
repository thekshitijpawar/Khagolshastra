import { Metadata } from 'next'
import SunspotsSection from '@/components/SunspotsSection'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Live Sunspots & Solar Dynamics Observatory | NASA SOHO Telemetry | Khagolshastra',
  description:
    'Real-time live sunspot imaging, magnetic field polarities, solar flare monitoring, and space weather indices from NASA/ESA SOHO and SDO satellites at the Sun-Earth L1 Lagrange point.',
}

export default function SunspotsPage() {
  return (
    <main className="bg-[#fdfcf4] min-h-screen text-[#111111]">
      {/* Breadcrumb Header */}
      <div className="border-b border-[#dcd8cb] bg-[#fbfaf0] px-4 sm:px-6 lg:px-10 py-4">
        <div className="max-w-[1340px] mx-auto flex items-center justify-between text-[11px] font-sans-editorial font-bold uppercase tracking-wider text-[#888884]">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-[#111111] transition-colors">
              HOME
            </Link>
            <span>/</span>
            <span className="text-[#111111]">SUNSPOTS OBSERVATORY</span>
          </div>
          <div>NASA SOHO / SDO REAL-TIME HELIOPHYSICS</div>
        </div>
      </div>

      {/* Sunspots Interactive Observatory Section */}
      <SunspotsSection />

      {/* Heliophysics Reference Guide */}
      <section className="px-4 sm:px-6 lg:px-10 py-12 border-b border-[#111111] bg-[#fdfcf4]">
        <div className="max-w-[1340px] mx-auto">
          <div className="border-b-2 border-[#111111] pb-3 mb-8">
            <span className="eyebrow text-[#111111] block mb-1">REFERENCE GUIDE</span>
            <h2 className="text-[26px] sm:text-[32px] font-serif-editorial font-normal text-[#111111]">
              Heliophysics, Solar Cycles & Space Weather Primer
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white border border-[#dcd8cb] p-5 shadow-2xs">
              <h3 className="text-[17px] font-serif-editorial text-[#111111] font-normal mb-2">
                1. What Are Sunspots?
              </h3>
              <p className="text-[13px] font-serif-editorial text-[#555555] leading-relaxed">
                Sunspots are magnetic storm zones on the solar photosphere. Strong localized magnetic fields inhibit hot plasma convection, creating cooler dark patches (Umbra at ~3,800 K surrounded by the striated Penumbra at ~5,400 K).
              </p>
            </div>

            <div className="bg-white border border-[#dcd8cb] p-5 shadow-2xs">
              <h3 className="text-[17px] font-serif-editorial text-[#111111] font-normal mb-2">
                2. Solar Cycle 25
              </h3>
              <p className="text-[13px] font-serif-editorial text-[#555555] leading-relaxed">
                Every 11 years, the Sun’s magnetic poles flip. During the Solar Maximum phase, sunspot numbers peak, elevating the frequency of Coronal Mass Ejections (CMEs) and auroral geomagnetic displays across Earth.
              </p>
            </div>

            <div className="bg-white border border-[#dcd8cb] p-5 shadow-2xs">
              <h3 className="text-[17px] font-serif-editorial text-[#111111] font-normal mb-2">
                3. The SOHO Mission at L1
              </h3>
              <p className="text-[13px] font-serif-editorial text-[#555555] leading-relaxed">
                Launched jointly by NASA and ESA, SOHO orbits the First Lagrangian Point (L1), 1.5 million km ahead of Earth. It has provided uninterrupted 24/7 solar imaging for over 28 years.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
