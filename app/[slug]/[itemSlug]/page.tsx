import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PublicFrame } from '@/components/public-frame'
import { getContentItem, getNavigation, getPageBySlug } from '@/lib/cms'

export default async function ContentDetailPage({
  params,
}: {
  params: Promise<{ slug: string; itemSlug: string }>
}) {
  const { slug, itemSlug } = await params
  const [navigation, page] = await Promise.all([getNavigation(), getPageBySlug(slug)])
  if (!page?.collection_type) notFound()

  const item = await getContentItem(page.collection_type, itemSlug)
  if (!item) notFound()

  return (
    <PublicFrame navigation={navigation} activeHref={`/${slug}`}>
      <article className="cms-article">
        <Link className="article-back" href={`/${slug}`}>← {page.nav_label || page.title}</Link>
        <div className="article-meta">
          <span>{item.content_type.toUpperCase()}</span>
          <span>{item.visibility.toUpperCase()}</span>
          {item.featured ? <span>FEATURED</span> : null}
        </div>
        <h1>{item.title}</h1>
        {item.summary ? <p className="article-lead">{item.summary}</p> : null}
        <div className="article-body">{item.body_markdown}</div>
      </article>
    </PublicFrame>
  )
}
