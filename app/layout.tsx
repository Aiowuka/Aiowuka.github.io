import type { Metadata } from 'next'
import './globals.css'
import './portal.css'
import './article.css'
import './admin.css'
import './language-shell.css'
import './cms-public.css'
import './cms-media.css'

export const metadata: Metadata = {
  title: 'AIowuka — personal index',
  description: 'AIowuka — research, projects, photos, music, notes, and ongoing life.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>
}
