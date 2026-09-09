import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import MarkdownContent from '@/components/markdown-content'
import { PublicFrame } from '@/components/public-frame'
import { currentProfile } from '@/lib/access'
import { getCollectionItems, getMediaAssets, getNavigation, getPageBlocks, getPageBySlug } from '@/lib/cms'

function formatDate(value: string | null | undefined) {
  if (!value) return null
  return new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: '2-digit', timeZone: 'UTC' }).format(new Date(value))
}

function renderBlock(block: Awaited<ReturnType<typeof getPageBlocks>>[number], preview: boolean) {
  if (block.kind === 'status') {
    const lines = block.body_markdown.split('\n').map((line) => line.trim()).filter(Boolean)
    return (
      <section className={`cms-block status-block${preview && !block.published ? ' is-draft' : ''}`} key={block.id}>
        <p className="micro-label">{block.label || 'NOW'}{preview && !block.published ? ' · DRAFT' : ''}</p>
        {block.title ? <h2>{block.title}</h2> : null}
        <ul>{lines.map((line) => <li key={line}>{line}</li>)}</ul>
      </section>
    )
  }

  return (
    <section className={`cms-block${preview && !block.published ? ' is-draft' : ''}`} key={block.id}>
      {block.label || (preview && !block.published) ? <p className="micro-label">{block.label || 'BLOCK'}{preview && !block.published ? ' · DRAFT' : ''}</p> : null}
      {block.title ? <h2>{block.title}</h2> : null}
      <MarkdownContent className="cms-prose markdown-content" children={block.body_markdown} />
    </section>
  )
}

type PageSearch = { tag?: string | string[]; preview?: string | string[] }
type PageProps = {
  params: Promise<{ slug: string }>
  searchParams?: Promise<PageSearch>
}

function first(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value
}

async function ownerPreviewRequested(searchParams?: Promise<PageSearch>) {
  const search = searchParams ? await searchParams : undefined
  if (first(search?.preview) !== '1') return false
  const { profile } = await currentProfile()
  return profile?.role === 'owner'
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params
  if (slug === 'home') return {}
  const preview = await ownerPreviewRequested(searchParams)
  const page = await getPageBySlug(slug, { includeDrafts: preview })
  if (!page) return { robots: { index: false, follow: false } }
  const title = page.nav_label || page.title
  const description = page.summary || `${title} — AIowuka`
  const canonical = `/${slug}`
  return {
    title,
    description,
    alternates: { canonical },
    robots: preview ? { index: false, follow: false, noarchive: true, nocache: true } : undefined,
    openGraph: { title, description, url: canonical, siteName: 'AIowuka', type: 'website' },
    twitter: { card: 'summary', title, description },
  }
}

export default async function CmsPageRoute({ params, searchParams }: PageProps) {
  const { slug } = await params
  if (slug === 'home') redirect('/')

  const search = searchParams ? await searchParams : undefined
  const selectedTag = first(search?.tag)?.trim() || null
  const preview = await ownerPreviewRequested(Promise.resolve(search ?? {}))

  const [navigation, page] = await Promise.all([getNavigation(), getPageBySlug(slug, { includeDrafts: preview })])
  if (!page) notFound()

  const [blocks, items] = await Promise.all([
    getPageBlocks(page.id, { includeDrafts: preview }),
    page.collection_type ? getCollectionItems(page.collection_type, { includeDrafts: preview }) : Promise.resolve([]),
  ])
  const coverMedia = await getMediaAssets(items.map((item) => item.cover_media_id))
  const allTags = [...new Set(items.flatMap((item) => item.tags ?? []))].sort((a, b) => a.localeCompare(b))
  const visibleItems = selectedTag
    ? items.filter((item) => item.tags?.some((tag) => tag.toLocaleLowerCase() === selectedTag.toLocaleLowerCase()))
    : items

  const filterHref = (tag?: string) => {
    const params = new URLSearchParams()
    if (tag) params.set('tag', tag)
    if (preview) params.set('preview', '1')
    const query = params.toString()
    return `/${slug}${query ? `?${query}` : ''}`
  }

  return (
    <PublicFrame navigation={navigation} activeHref={`/${slug}`}>
      {preview ? (
        <div className="draft-preview-banner">
          <span>OWNER PREVIEW · {page.published ? 'PAGE LIVE' : 'PAGE DRAFT'} · DRAFT BLOCKS INCLUDED</span>
          <Link href="/studio/pages">Back to Studio →</Link>
        </div>
      ) : null}
      <section className="cms-page-head">
        <p className="micro-label">{page.template.toUpperCase()} / {page.visibility.toUpperCase()}{!page.published ? ' / DRAFT' : ''}</p>
        <h1>{page.nav_label || page.title}</h1>
        {page.summary ? <p>{page.summary}</p> : null}
      </section>

      {page.template === 'collection' && allTags.length ? (
        <nav className="collection-filters" aria-label="Filter by tag">
          <Link className={!selectedTag ? 'active' : undefined} href={filterHref()}>All</Link>
          {allTags.map((tag) => (
            <Link
              className={selectedTag?.toLocaleLowerCase() === tag.toLocaleLowerCase() ? 'active' : undefined}
              href={filterHref(tag)}
              key={tag}
            >#{tag}</Link>
          ))}
        </nav>
      ) : null}

      {page.template === 'collection' ? (
        <section className="collection-list">
          {visibleItems.length ? visibleItems.map((item, index) => {
            const cover = item.cover_media_id ? coverMedia.get(item.cover_media_id) : null
            const published = formatDate(item.published_at || item.created_at)
            const itemHref = `/${slug}/${item.slug}${preview && !item.published ? '?preview=1' : ''}`
            return (
              <Link className={`collection-row${cover ? ' has-cover' : ''}`} href={itemHref} key={item.id}>
                <span className="collection-index">{String(index + 1).padStart(2, '0')}</span>
                {cover ? (
                  <div className="collection-cover">
                    <img src={cover.url} alt={cover.alt_text || cover.title || item.title} />
                  </div>
                ) : null}
                <div className="collection-copy">
                  <div className="collection-heading">
                    <h2>{item.title}</h2>
                    {item.featured ? <span className="tiny-badge">FEATURED</span> : null}
                    {preview && !item.published ? <span className="tiny-badge">DRAFT</span> : null}
                  </div>
                  {item.summary ? <p>{item.summary}</p> : null}
                  <div className="collection-meta">
                    {item.published && published ? <time dateTime={item.published_at || item.created_at}>{published}</time> : null}
                    {item.tags?.map((tag) => <span key={tag}>#{tag}</span>)}
                  </div>
                </div>
                <span className="collection-arrow">→</span>
              </Link>
            )
          }) : (
            <div className="empty-paper">
              <p>{selectedTag ? `没有 #${selectedTag} 的内容。` : '这里还没有内容。'}</p>
              <span>{selectedTag ? 'Choose another tag or return to All.' : 'Content added in Studio will appear here automatically.'}</span>
            </div>
          )}
        </section>
      ) : null}

      {blocks.length ? <div className="cms-blocks">{blocks.map((block) => renderBlock(block, preview))}</div> : null}

      {!blocks.length && page.template !== 'collection' ? (
        <div className="empty-paper"><p>这个页面还在慢慢长出来。</p></div>
      ) : null}
    </PublicFrame>
  )
}
