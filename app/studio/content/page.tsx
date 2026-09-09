import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { saveContentItem } from '../actions'
import { deleteContentItem } from '../delete-actions'

const visibilityOptions = ['public', 'member', 'selected', 'owner']
const typeOptions = ['research', 'project', 'note', 'photo', 'music']

function formatDate(value?: string | null) {
  if (!value) return 'Not published yet'
  return new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: '2-digit', timeZone: 'UTC' }).format(new Date(value))
}

function sectionFor(contentType: string) {
  if (contentType === 'project') return 'projects'
  if (contentType === 'photo') return 'photos'
  if (contentType === 'music') return 'music'
  if (contentType === 'research') return 'research'
  return 'notes'
}

function ContentForm({ item, media }: { item?: any; media: any[] }) {
  return (
    <form action={saveContentItem} className="studio-form studio-paper">
      {item?.id ? <input type="hidden" name="id" value={item.id} /> : null}
      <div className="studio-form-grid">
        <label>Type<select name="content_type" defaultValue={item?.content_type ?? 'note'}>{typeOptions.map((v) => <option key={v}>{v}</option>)}</select></label>
        <label>Slug<input name="slug" required defaultValue={item?.slug ?? ''} placeholder="my-note" /></label>
        <label>Title<input name="title" required defaultValue={item?.title ?? ''} /></label>
        <label>Visibility<select name="visibility" defaultValue={item?.visibility ?? 'owner'}>{visibilityOptions.map((v) => <option key={v}>{v}</option>)}</select></label>
        <label>Sort order<input name="sort_order" type="number" defaultValue={item?.sort_order ?? 0} /></label>
        <label>Cover image<select name="cover_media_id" defaultValue={item?.cover_media_id ?? ''}><option value="">None</option>{media.map((m) => <option value={m.id} key={m.id}>{m.title || m.file_name} · {m.visibility}</option>)}</select></label>
      </div>
      <label>Summary<textarea name="summary" rows={3} defaultValue={item?.summary ?? ''} placeholder="一两句话说明这篇内容是什么。" /></label>
      <label>Tags<input name="tags" defaultValue={(item?.tags ?? []).join(', ')} placeholder="AI, research, UAV, life" /><span className="studio-field-help">用逗号分隔。公开页面会直接显示这些标签。</span></label>
      <label>Body<textarea name="body_markdown" rows={16} defaultValue={item?.body_markdown ?? ''} placeholder={'支持 Markdown。\n\n## 小标题\n\n- 列表\n- 代码\n- 链接'} /></label>
      {item ? <p className="studio-publish-context">First published: <strong>{formatDate(item.published_at)}</strong> · Last updated: <strong>{formatDate(item.updated_at)}</strong></p> : null}
      <details className="studio-advanced">
        <summary>Advanced metadata</summary>
        <label>Metadata JSON<textarea name="metadata" rows={4} defaultValue={item ? JSON.stringify(item.metadata ?? {}, null, 2) : '{}'} /></label>
      </details>
      <div className="studio-checks">
        <label><input type="checkbox" name="published" defaultChecked={item?.published ?? false} /> Published</label>
        <label><input type="checkbox" name="featured" defaultChecked={item?.featured ?? false} /> Featured</label>
      </div>
      <button className="studio-primary" type="submit">{item ? 'Save content' : 'Create content'}</button>
    </form>
  )
}

type Search = { q?: string | string[]; type?: string | string[]; status?: string | string[]; visibility?: string | string[] }

function first(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value
}

export default async function StudioContent({ searchParams }: { searchParams?: Promise<Search> }) {
  const supabase = await createClient()
  const [{ data: items }, { data: allMedia }] = await Promise.all([
    supabase.from('content_items').select('*').order('updated_at', { ascending: false }),
    supabase.from('media_assets').select('id,title,file_name,mime_type,visibility').order('created_at', { ascending: false }),
  ])
  const media = (allMedia ?? []).filter((m) => m.mime_type?.startsWith('image/'))

  const search = searchParams ? await searchParams : undefined
  const q = (first(search?.q) || '').trim().toLocaleLowerCase()
  const type = first(search?.type) || 'all'
  const status = first(search?.status) || 'all'
  const visible = first(search?.visibility) || 'all'
  const allItems = items ?? []
  const filtered = allItems.filter((item) => {
    if (type !== 'all' && item.content_type !== type) return false
    if (visible !== 'all' && item.visibility !== visible) return false
    if (status === 'published' && !item.published) return false
    if (status === 'draft' && item.published) return false
    if (status === 'featured' && !item.featured) return false
    if (q) {
      const haystack = [item.title, item.slug, item.summary, ...(item.tags ?? [])].filter(Boolean).join(' ').toLocaleLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  })
  const hasFilters = Boolean(q || type !== 'all' || status !== 'all' || visible !== 'all')

  return (
    <>
      <header className="studio-header"><p className="micro-label">WRITING / WORK / LIFE</p><h1>Content</h1><p>Research、Projects、Notes、Photos、Music 都从同一套内容系统发布，并独立控制访问范围。</p></header>

      <section className="studio-section">
        <div className="studio-section-head"><div><p className="micro-label">NEW</p><h2>Create content</h2></div><Link href="/studio/media">Media library →</Link></div>
        <ContentForm media={media} />
      </section>

      <section className="studio-section">
        <div className="studio-section-head"><div><p className="micro-label">LIBRARY</p><h2>Existing content</h2></div><span className="studio-status">{filtered.length} shown · {allItems.length} total</span></div>
        <form className="studio-library-filter" method="get">
          <label className="studio-filter-search">Search<input name="q" defaultValue={first(search?.q) || ''} placeholder="title, slug, summary or tag" /></label>
          <label>Type<select name="type" defaultValue={type}><option value="all">All types</option>{typeOptions.map((v) => <option key={v} value={v}>{v}</option>)}</select></label>
          <label>Status<select name="status" defaultValue={status}><option value="all">All status</option><option value="published">Published</option><option value="draft">Draft</option><option value="featured">Featured</option></select></label>
          <label>Visibility<select name="visibility" defaultValue={visible}><option value="all">All access</option>{visibilityOptions.map((v) => <option key={v} value={v}>{v}</option>)}</select></label>
          <button type="submit">Filter</button>
          {hasFilters ? <Link href="/studio/content">Clear</Link> : null}
        </form>

        {allItems.length === 0 ? <div className="studio-empty">还没有内容。你在上面创建的第一篇内容会自动出现在对应页面。</div> : null}
        {allItems.length > 0 && filtered.length === 0 ? <div className="studio-empty">没有匹配当前筛选条件的内容。清除筛选后可以看到全部。</div> : null}
        {filtered.map((item) => {
          const href = `/${sectionFor(item.content_type)}/${item.slug}`
          const previewHref = item.published ? href : `${href}?preview=1`
          return (
            <details className="studio-item" key={item.id}>
              <summary>
                <div><strong>{item.title}</strong><span>/{item.slug} · {item.content_type}{item.tags?.length ? ` · #${item.tags.join(' #')}` : ''}</span></div>
                <span>{item.visibility} · {item.published ? formatDate(item.published_at) : 'draft'}{item.featured ? ' · featured' : ''}</span>
              </summary>
              <div className="studio-preview-row"><Link href={previewHref}>{item.published ? 'Open article ↗' : 'Preview draft ↗'}</Link><Link href={`/${sectionFor(item.content_type)}`}>Open collection →</Link></div>
              <ContentForm item={item} media={media} />
              <details className="studio-danger-zone">
                <summary>Delete content…</summary>
                <form action={deleteContentItem}>
                  <input type="hidden" name="id" value={item.id} />
                  <p>删除后会从网站消失。删除前的快照仍会保存在 History，可用于恢复。</p>
                  <button type="submit">Delete permanently</button>
                </form>
              </details>
            </details>
          )
        })}
      </section>
    </>
  )
}
