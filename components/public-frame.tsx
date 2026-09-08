import Link from 'next/link'
import type { ReactNode } from 'react'
import type { NavItem } from '@/lib/cms'

export function PublicFrame({
  navigation,
  activeHref,
  children,
}: {
  navigation: NavItem[]
  activeHref?: string
  children: ReactNode
}) {
  return (
    <div className="journal-shell">
      <aside className="personal-rail">
        <div>
          <Link href="/" className="scribble-mark">Aiowuka</Link>
          <p className="rail-mantra">Same planet.<br/>Different perspective.</p>
        </div>

        <nav className="rail-nav" aria-label="Primary navigation">
          {navigation.map((item) => (
            <Link className={item.href === activeHref ? 'active' : undefined} href={item.href} key={item.id}>
              {item.href === activeHref ? <span /> : null}
              {item.label}
            </Link>
          ))}
        </nav>

        <p className="rail-note">Good ideas<br/>usually start<br/>somewhere messy.</p>

        <div className="rail-bottom">
          <p>Nanjing, China<br/>NUAA ✈</p>
          <div className="keep-dot"><i /> KEEP EXPLORING</div>
        </div>
      </aside>

      <main className="journal-main">
        <header className="journal-topbar">
          <span>AIowuka's little corner of the internet</span>
          <div className="topbar-actions">
            <Link href="/private">Portal ↗</Link>
          </div>
        </header>
        {children}
      </main>
    </div>
  )
}
