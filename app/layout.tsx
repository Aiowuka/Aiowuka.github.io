import type { Metadata } from 'next'
import './globals.css'
import './portal.css'
import './article.css'
import './admin.css'
import './language-shell.css'
import './cms-public.css'
import './cms-media.css'
import './markdown.css'
import './blog-meta.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://aiowuka.me'),
  title: {
    default: 'AIowuka — personal index',
    template: '%s — AIowuka',
  },
  description: 'AIowuka — research, projects, photos, music, notes, and ongoing life.',
  applicationName: 'AIowuka',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'AIowuka — personal index',
    description: 'Research, projects, photos, music, notes, and ongoing life.',
    url: '/',
    siteName: 'AIowuka',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AIowuka — personal index',
    description: 'Research, projects, photos, music, notes, and ongoing life.',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>
}
