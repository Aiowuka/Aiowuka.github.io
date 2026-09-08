import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { PublicFrame } from '@/components/public-frame'
import { getCollectionItems, getMediaAssets, getNavigation, getPageBlocks, getPageBySlug } from '@/lib/cms'

function renderBlock(block: Awaited<ReturnType<typeof getPageBlocks>>[number]) {
  if (block.kind === 'status') {
    const lines = block.body_markdown.split('\n').map((line) => line.trim()).filter(Boolean)
    return (
      <section className="cms-block status-block" key={block.id}>
        <p className="micro-label">{block.label || 'NOW'}</p>
        {block.title ? <h2>{block.title}</h2> : null}
        <ul>{lines.map((line) => <li key={line}>{line}</li>)}</ul>
      </section>
    )
  }

  return (
    <section className="cms-block" key={block.id}>
      {block.label ? <p className="micro-label">{block.label}</p> : null}
      {block.title ? <h2>{block.title}</h2> : null}
      <div className="cms-prose">{block.body_markdown}</div>
    </section>
  )
}

export default async function CmsPageRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (slug === 'home') redirect('/')

  const [navigation, page] = await Promise.all([getNavigation(), getPageBySlug(slug)])
  if (!page) notFound()

  const [blocks, items] = await Promise.all([
    getPageBlocks(page.id),
    page.collection_type ? getCollectionItems(page.collection_type) : Promise.resolve([]),
  ])
  const coverMedia = await getMediaAssets(items.map((item) => item.cover_media_id))

  return (
    <PublicFrame navigation={navigation} activeHref={`/${slug}`}>
      <section className="cms-page-head">
        <p className="micro-label">{page.template.toUpperCase()} / {page.visibility.toUpperCase()}</p>
        <h1>{page.nav_label || page.title}</h1>
        {page.summary ? <p>{page.summary}</p> : null}
      </section>

      {page.template === 'collection' ? (
        <section className="collection-list">
          {items.length ? items.map((item, index) => {
            const cover = item.cover_media_id ? coverMedia.get(item.cover_media_id) : null
            return (
              <Link className={`collection-row${cover ? ' has-cover' : ''}`} href={`/${slug}/${item.slug}`} key={item.id}>
                <span className="collection-index">{String(index + 1).padStart(2, '0')}</span>
                {cover ? (
                  <div className="collection-cover">
                    <img src={cover.url} alt={cover.alt_text || cover.title || item.title} />
                  </div>
                ) : null}
                <div>
                  <div className="collection-heading">
                    <h2>{item.title}</h2>
                    {item.featured ? <span className="tiny-badge">FEATURED</span> : null}
                  </div>
                  {item.summary ? <p>{item.summary}</p> : null}
                </div>
                <span className="collection-arrow">→</span>
              </Link>
            )
          }) : (
            <div className="empty-paper">
              <p>这里还没有内容。</p>
              <span>Content added in Studio will appear here automatically.</span>
            </div>
          )}
        </section>
      ) : null}

      {blocks.length ? <div className="cms-blocks">{blocks.map(renderBlock)}</div> : null}

      {!blocks.length && page.template !== 'collection' ? (
        <div className="empty-paper"><p>这个页面还在慢慢长出来。</p></div>
      ) : null}
    </PublicFrame>
  )
}
