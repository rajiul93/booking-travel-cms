import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { JsonLd } from '@/components/seo/JsonLd'
import { buildMetadata, buildOrganizationJsonLd } from '@/lib/seo/metadata'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = buildMetadata({
  title: 'Dream Tourism — Unforgettable Tours in Italy',
  description:
    'Discover curated tours and authentic experiences across Italy. Book adventures with live availability and secure payments.',
  path: '/',
})

export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen font-sans">
        <JsonLd data={buildOrganizationJsonLd()} />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
