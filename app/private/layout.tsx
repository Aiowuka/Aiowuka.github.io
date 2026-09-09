import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Private space',
  robots: { index: false, follow: false, noarchive: true, nocache: true },
}

export default function PrivateLayout({ children }: { children: ReactNode }) {
  return children
}
