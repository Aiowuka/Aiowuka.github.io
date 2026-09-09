import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import MarkdownContent from '@/components/markdown-content'
import { createClient } from '@/lib/supabase/server'
import { currentProfile } from '@/lib/access'
import { getMediaAsset } from '@/lib/cms'

export const dynamic = 'force-dynamic'

function formatDate(value: string | null | undefined) {
  if (!value) return null
  return new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: '2-digit', timeZone: 'UTC' }).format(new Date(value))
}

export default async function ContentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { profile } = await currentProfile()
  if (!profile) redirect('/login')

  const { slug } = await params
  const supabase = await createClient()
  const { data: item } = await supabase
    .from('content_items')
    .select('title,summary,body_markdown,visibility,content_type,tags,cover_media_id,published_at,created_at,updated_at')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()

  if (!item) notFound()
  const cover = await getMediaAsset(item.cover_media_id)
  const published = formatDate(item.published_at || item.created_at)
  const updated = formatDate(item.updated_at)

  return (
    <main className="private-article">
      <header className="article-topbar">
        <Link className="portal-wordmark" href="/">Aiowuka</Link>
        <div><Link href="/private">← 私人空间</Link><Link href="/">主页</Link></div>
      </header>

      <article>
        <div className="article-meta">
          <span>{item.visibility.toUpperCase()}</span>
          <span>{item.content_type.toUpperCase()}</span>
          {published ? <time dateTime={item.published_at || item.created_at}>{published}</time> : null}
        </div>
        <h1>{item.title}</h1>
        {item.summary && <p className="article-summary">{item.summary}</p>}
        {item.tags?.length ? <div className="article-tags">{item.tags.map((tag: string) => <span key={tag}>#{tag}</span>)}</div> : null}
        {cover ? (
          <figure className="article-cover">
            <img src={cover.url} alt={cover.alt_text || cover.title || item.title} />
            {cover.caption ? <figcaption>{cover.caption}</figcaption> : null}
          </figure>
        ) : null}
        <div className="article-rule" />
        <MarkdownContent className="article-body markdown-content" children={item.body_markdown} />
        <footer className="article-date-footer">
          <span>Published {published || '—'}</span>
          {updated && updated !== published ? <span>Updated {updated}</span> : null}
        </footer>
      </article>

      <footer className="article-footer">
        <Link href="/private">← 回到私人空间</Link>
        <span>AIowuka · notes for a smaller room</span>
      </footer>
    </main>
  )
}
