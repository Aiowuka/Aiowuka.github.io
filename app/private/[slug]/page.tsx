import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { currentProfile } from '@/lib/access'

export const dynamic = 'force-dynamic'

export default async function ContentPage({ params }: { params: Promise<{ slug:string }> }) {
  const { profile } = await currentProfile()
  if (!profile) redirect('/login')

  const { slug } = await params
  const supabase = await createClient()
  const { data:item } = await supabase
    .from('content_items')
    .select('title,summary,body_markdown,visibility')
    .eq('slug',slug)
    .eq('published',true)
    .maybeSingle()

  if (!item) notFound()

  return (
    <main className="private-article">
      <header className="article-topbar">
        <Link className="portal-wordmark" href="/">Aiowuka</Link>
        <div><Link href="/private">← 私人空间</Link><Link href="/">主页</Link></div>
      </header>

      <article>
        <div className="article-meta"><span>{item.visibility}</span><span>PRIVATE NOTE</span></div>
        <h1>{item.title}</h1>
        {item.summary && <p className="article-summary">{item.summary}</p>}
        <div className="article-rule" />
        <div className="article-body">{item.body_markdown}</div>
      </article>

      <footer className="article-footer">
        <Link href="/private">← 回到私人空间</Link>
        <span>AIowuka · notes for a smaller room</span>
      </footer>
    </main>
  )
}
