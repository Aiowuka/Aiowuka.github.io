import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import MarkdownContent from '@/components/markdown-content'
import { PublicFrame } from '@/components/public-frame'
import { getContentItem, getMediaAsset, getNavigation, getPageBySlug } from '@/lib/cms'

function formatDate(value: string | null | undefined) {
  if (!value) return null
  return new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: '2-digit', timeZone: 'UTC' }).format(new Date(value))
}

type ArticleProps = { params: Promise<{ slug: string; itemSlug: string }> }

export async function generateMetadata({ params }: ArticleProps): Promise<Metadata> {
  const { slug, itemSlug } = await params
  const page = await getPageBySlug(slug)
  if (!page?.collection_type) return { robots: { index: false, follow: false } }
  const item = await getContentItem(page.collection_type, itemSlug)
  if (!item) return { robots: { index: false, follow: false } }

  const description = item.summary || `${item.title} — AIowuka`
  const canonical = `/${slug}/${item.slug}`
  return {
    title: item.title,
    description,
    keywords: item.tags,
    alternates: { canonical },
    openGraph: {
      title: item.title,
      description,
      url: canonical,
      siteName: 'AIowuka',
      type: 'article',
      publishedTime: item.published_at || item.created_at,
      modifiedTime: item.updated_at,
      tags: item.tags,
    },
    twitter: { card: 'summary', title: item.title, description },
  }
}

export default async function ContentDetailPage({ params }: ArticleProps) {
  const { slug, itemSlug } = await params
  const [navigation, page] = await Promise.all([getNavigation(), getPageBySlug(slug)])
  if (!page?.collection_type) notFound()

  const item = await getContentItem(page.collection_type, itemSlug)
  if (!item) notFound()
  const cover = await getMediaAsset(item.cover_media_id)
  const published = formatDate(item.published_at || item.created_at)
  const updated = formatDate(item.updated_at)

  return (
    <PublicFrame navigation={navigation} activeHref={`/${slug}`}>
      <article className="cms-article">
        <Link className="article-back" href={`/${slug}`}>← {page.nav_label || page.title}</Link>
        <div className="article-meta">
          <span>{item.content_type.toUpperCase()}</span>
          {published ? <time dateTime={item.published_at || item.created_at}>{published}</time> : null}
          {item.featured ? <span>FEATURED</span> : null}
        </div>
        <h1>{item.title}</h1>
        {item.summary ? <p className="article-lead">{item.summary}</p> : null}
        {item.tags?.length ? <div className="article-tags">{item.tags.map((tag) => <Link href={`/${slug}?tag=${encodeURIComponent(tag)}`} key={tag}>#{tag}</Link>)}</div> : null}
        {cover ? (
          <figure className="article-cover">
            <img src={cover.url} alt={cover.alt_text || cover.title || item.title} />
            {cover.caption ? <figcaption>{cover.caption}</figcaption> : null}
          </figure>
        ) : null}
        <MarkdownContent className="article-body markdown-content" children={item.body_markdown} />
        <footer className="article-date-footer">
          <span>Published {published || '—'}</span>
          {updated && updated !== published ? <span>Updated {updated}</span> : null}
        </footer>
      </article>
    </PublicFrame>
  )
}
