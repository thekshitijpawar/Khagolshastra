import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-helvetica-neue',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700', '900'],
  variable: '--font-plantin',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'KHAGOLSHASTRA — Astronomy News & Scientific Research Papers',
  description: 'A premier broadsheet news platform and research paper repository covering astrophysics, planetary science, rocket launches, and cosmology.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="bg-[#fdfcf4] text-[#111111] min-h-screen flex flex-col selection:bg-[#ffc500] selection:text-black">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
