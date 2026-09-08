import Link from 'next/link'
import type { ReactNode } from 'react'
import { getSettings, settingText, type NavItem } from '@/lib/cms'

function Multiline({ text }: { text: string }) {
  return <>{text.split(/\n|\. /).map((line, index, parts) => <span key={`${line}-${index}`}>{line}{index < parts.length - 1 ? <br /> : null}</span>)}</>
}

export async function PublicFrame({
  navigation,
  activeHref,
  children,
}: {
  navigation: NavItem[]
  activeHref?: string
  children: ReactNode
}) {
  const settings = await getSettings(['site_name', 'location', 'school', 'rail_mantra', 'rail_note', 'topbar_note'])
  const siteName = settingText(settings, 'site_name', 'AIowuka')
  const location = settingText(settings, 'location', 'Nanjing, China')
  const school = settingText(settings, 'school', 'NUAA')
  const railMantra = settingText(settings, 'rail_mantra', 'Same planet. Different perspective.')
  const railNote = settingText(settings, 'rail_note', 'Good ideas usually start somewhere messy.')
  const topbarNote = settingText(settings, 'topbar_note', "AIowuka's little corner of the internet")

  return (
    <div className="journal-shell">
      <aside className="personal-rail">
        <div>
          <Link href="/" className="scribble-mark">{siteName}</Link>
          <p className="rail-mantra"><Multiline text={railMantra} /></p>
        </div>

        <nav className="rail-nav" aria-label="Primary navigation">
          {navigation.map((item) => (
            <Link className={item.href === activeHref ? 'active' : undefined} href={item.href} key={item.id}>
              {item.href === activeHref ? <span /> : null}
              {item.label}
            </Link>
          ))}
        </nav>

        <p className="rail-note"><Multiline text={railNote} /></p>

        <div className="rail-bottom">
          <p>{location}<br/>{school} ✈</p>
          <div className="keep-dot"><i /> KEEP EXPLORING</div>
        </div>
      </aside>

      <main className="journal-main">
        <header className="journal-topbar">
          <span>{topbarNote}</span>
          <div className="topbar-actions">
            <Link href="/private">Portal ↗</Link>
          </div>
        </header>
        {children}
      </main>
    </div>
  )
}
