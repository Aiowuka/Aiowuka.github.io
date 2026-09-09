import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { currentProfile } from '@/lib/access'
import StudioNav from './studio-nav'
import './studio.css'
import './studio-extras.css'

export const metadata: Metadata = {
  title: 'Studio',
  robots: { index: false, follow: false, noarchive: true, nocache: true },
}

export default async function StudioLayout({ children }: { children: ReactNode }) {
  const { profile } = await currentProfile()
  if (!profile) redirect('/login')
  if (profile.role !== 'owner') redirect('/private')

  return (
    <div className="studio-shell">
      <aside className="studio-rail">
        <div>
          <Link className="studio-mark" href="/studio">AIowuka Studio</Link>
          <p>Content, structure, media and access.</p>
        </div>
        <StudioNav />
        <div className="studio-rail-bottom">
          <Link href="/">← View site</Link>
          <Link href="/private">Private space ↗</Link>
          <form action="/auth/signout" method="post"><button type="submit">Sign out</button></form>
        </div>
      </aside>
      <main className="studio-main">{children}</main>
    </div>
  )
}
