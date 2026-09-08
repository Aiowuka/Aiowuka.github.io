'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const items = [
  ['Overview', '/studio'],
  ['Pages', '/studio/pages'],
  ['Content', '/studio/content'],
  ['Media', '/studio/media'],
  ['Navigation', '/studio/navigation'],
  ['Access', '/studio/access'],
  ['Settings', '/studio/settings'],
  ['History', '/studio/history'],
] as const

export default function StudioNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Studio navigation">
      {items.map(([label, href]) => {
        const active = href === '/studio' ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)
        return <Link className={active ? 'active' : undefined} href={href} aria-current={active ? 'page' : undefined} key={href}>{label}</Link>
      })}
    </nav>
  )
}
