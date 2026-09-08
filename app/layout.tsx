import type { Metadata } from 'next'
import './globals.css'
import './portal.css'
import './article.css'
import './admin.css'

export const metadata: Metadata = {
  title: 'AIowuka — 记录、构建，然后继续出发',
  description: 'AIowuka 的个人网站：研究、项目、照片、音乐，以及正在发生的生活。',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>
}
