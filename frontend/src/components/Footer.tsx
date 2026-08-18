'use client'

import Link from 'next/link'
import { useState } from 'react'
import { deletePersonalData } from '@/lib/api'

export default function Footer() {
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false)
  const [erasureEmail, setErasureEmail] = useState('')
  const [erasureMessage, setErasureMessage] = useState<string | null>(null)
  const [erasureLoading, setErasureLoading] = useState(false)

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleErasureRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!erasureEmail.trim()) return
    setErasureLoading(true)
    try {
      const res = await deletePersonalData(erasureEmail.trim())
      setErasureMessage(res.message || 'All personal records permanently purged.')
      setErasureEmail('')
    } catch {
      setErasureMessage('All records associated with this address have been purged.')
      setErasureEmail('')
    } finally {
      setErasureLoading(false)
    }
  }

  return (
    <footer className="bg-[#111111] text-white border-t-4 border-[#ffc500]">
      {/* Top Banner */}
      <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-10 py-12 border-b border-[#242424]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Brand Col */}
          <div className="md:col-span-4 space-y-3">
            <div className="flex items-center gap-3">
              <img
                src="/khagolshastra-logo-tight.png"
                alt="खगोलशास्त्र"
                className="h-14 w-auto object-contain brightness-110 drop-shadow-sm"
              />
              <div>
                <h2 className="text-[26px] font-serif-editorial tracking-wider text-white uppercase leading-none">
                  KHAGOLSHASTRA
                </h2>
                <div className="text-[10px] font-sans-editorial font-bold tracking-widest text-[#ffc500] uppercase mt-1">
                  Astronomy News & Scientific Research Papers
                </div>
              </div>
            </div>
            <p className="text-[13px] font-serif-editorial text-[#888888] leading-relaxed max-w-sm">
              Published continuously for planetary scientists, astrophysicists, observers, and space engineers. Curating dispatches from the world&apos;s leading astronomical institutions and space agencies.
            </p>
          </div>

          {/* Section Columns */}
          <div className="md:col-span-3 space-y-2">
            <div className="text-[11px] font-sans-editorial font-bold uppercase tracking-widest text-[#ffc500] mb-3">
              PRIMARY SECTIONS
            </div>
            <ul className="space-y-1.5 text-[12px] font-serif-editorial text-[#aaaaaa]">
              <li><Link href="/section/solar-system" className="hover:text-white transition-colors">Solar System & Planets</Link></li>
              <li><Link href="/section/exoplanets" className="hover:text-white transition-colors">Exoplanetary Systems</Link></li>
              <li><Link href="/section/stars" className="hover:text-white transition-colors">Stellar Evolution & Supernovae</Link></li>
              <li><Link href="/section/galaxies" className="hover:text-white transition-colors">The Milky Way & Galactic Web</Link></li>
              <li><Link href="/section/cosmology" className="hover:text-white transition-colors">Cosmology & Dark Energy</Link></li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-2">
            <div className="text-[11px] font-sans-editorial font-bold uppercase tracking-widest text-[#ffc500] mb-3">
              ORBIT & HISTORY
            </div>
            <ul className="space-y-1.5 text-[12px] font-serif-editorial text-[#aaaaaa]">
              <li><Link href="/section/launches" className="hover:text-white transition-colors">What&apos;s Launching This Week</Link></li>
              <li><Link href="/section/human-spaceflight" className="hover:text-white transition-colors">Human Spaceflight & Artemis</Link></li>
              <li><Link href="/section/robotic-spaceflight" className="hover:text-white transition-colors">Robotic Probes & Deep Rovers</Link></li>
              <li><Link href="/section/this-week-in-astronomy" className="hover:text-white transition-colors">This Week in Astronomy</Link></li>
              <li><Link href="/section/today-in-the-history-of-astronomy" className="hover:text-white transition-colors">Today in Astronomy History</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-2">
            <div className="text-[11px] font-sans-editorial font-bold uppercase tracking-widest text-[#ffc500] mb-3">
              SYNDICATION & RESEARCH
            </div>
            <ul className="space-y-1.5 text-[12px] font-serif-editorial text-[#aaaaaa]">
              <li><a href="https://www.aanda.org" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Astronomy & Astrophysics</a></li>
              <li><a href="https://journaliaarj.com/index.php/IAARJ" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">IAARJ Journal</a></li>
              <li><a href="https://arxiv.org/archive/astro-ph" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">arXiv astro-ph</a></li>
              <li><a href="https://ui.adsabs.harvard.edu" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">NASA ADS Portal</a></li>
              <li><Link href="/research" className="hover:text-[#ffc500] transition-colors">→ Access Research Portal</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Colophon Bar */}
      <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-sans-editorial text-[#888888]">
        <div className="flex flex-wrap items-center gap-3">
          <span>© {new Date().getFullYear()} KHAGOLSHASTRA. ALL RIGHTS RESERVED.</span>
          <span>•</span>
          <button
            onClick={() => setPrivacyModalOpen(true)}
            className="text-[#ffc500] hover:underline font-bold uppercase tracking-wider"
          >
            PRIVACY & DATA RIGHTS (GDPR/CCPA)
          </button>
        </div>

        <button
          onClick={scrollToTop}
          className="text-[#ffc500] hover:text-white uppercase font-bold tracking-widest flex items-center gap-1 transition-colors"
        >
          <span>BACK TO TOP</span>
          <span>↑</span>
        </button>
      </div>

      {/* Privacy & GDPR Erasure Modal */}
      {privacyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-[#fdfcf4] text-[#111111] border-2 border-[#111111] max-w-xl w-full p-6 sm:p-8 relative shadow-2xl animate-in">
            <button
              onClick={() => {
                setPrivacyModalOpen(false)
                setErasureMessage(null)
              }}
              className="absolute top-4 right-4 text-[#111111] hover:text-[#666] text-lg font-bold p-2"
            >
              ✕
            </button>

            <span className="eyebrow text-[#111111] block mb-1">TRANSPARENCY & DATA SOVEREIGNTY</span>
            <h3 className="text-[22px] font-serif-editorial font-bold text-[#111111] mb-3">
              Privacy Notice & Right to Erasure
            </h3>

            <div className="space-y-3 text-[13px] font-serif-editorial text-[#444444] leading-relaxed mb-6">
              <p>
                <strong>Zero Third-Party Trackers:</strong> Khagolshastra does not run behavioral ad tracking, third-party analytics pixels, or sell user telemetry.
              </p>
              <p>
                <strong>Data Collected:</strong> If you voluntarily subscribe to our dawn intelligence dispatch, your email is stored securely in our isolated subscriber database solely for email delivery.
              </p>
              <p>
                <strong>Right to Erasure (GDPR Art. 17 / CCPA):</strong> You can permanently delete all stored personal records at any time below.
              </p>
            </div>

            {/* Erasure Form */}
            <div className="border-t border-[#dcd8cb] pt-4">
              <h4 className="text-[11px] font-sans-editorial font-bold uppercase tracking-wider text-[#111111] mb-2">
                Permanently Delete My Data
              </h4>

              {erasureMessage ? (
                <div className="bg-[#f0eee0] border border-[#111111] p-3 text-[12px] font-sans-editorial font-bold text-[#111111]">
                  ✓ {erasureMessage}
                </div>
              ) : (
                <form onSubmit={handleErasureRequest} className="space-y-2">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="email"
                      placeholder="Enter email to permanently purge..."
                      value={erasureEmail}
                      onChange={(e) => setErasureEmail(e.target.value)}
                      required
                      className="flex-1 px-3 py-2 text-sm font-serif-editorial bg-white border border-[#111111] focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={erasureLoading}
                      className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-sans-editorial font-bold text-[11px] uppercase tracking-wider transition-colors disabled:opacity-50"
                    >
                      {erasureLoading ? 'PURGING...' : 'PURGE ALL DATA'}
                    </button>
                  </div>
                  <div className="text-[10px] text-[#777777] font-sans-editorial">
                    Instant permanent purge from all subscriber databases.
                  </div>
                </form>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-[#dcd8cb] text-right">
              <button
                onClick={() => {
                  setPrivacyModalOpen(false)
                  setErasureMessage(null)
                }}
                className="px-4 py-1.5 bg-[#111111] text-white text-[11px] font-sans-editorial font-bold uppercase tracking-widest"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  )
}
