import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'LexScopic — Free & Affordable Things To Do in Lexington, KY',
  description: 'Curated events, all in one place.',
  metadataBase: new URL('https://lexscopic.com'),
  openGraph: {
    title: 'LexScopic',
    description: 'Free & affordable things to do in Lexington, KY',
    url: 'https://lexscopic.com',
    siteName: 'LexScopic',
    images: ['/og.png'],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LexScopic',
    description: 'Free & affordable things to do in Lexington, KY',
    images: ['/og.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
