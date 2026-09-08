import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AIowuka — personal index',
  description: 'AIowuka — AI, agents, flight control, autonomous systems, notes and ongoing work.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>
}
