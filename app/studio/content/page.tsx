import { createClient } from '@/lib/supabase/server'
import { saveContentItem } from '../actions'

const visibilityOptions = ['public', 'member', 'selected', 'owner']
const typeOptions = ['research', 'project', 'note', 'photo', 'music']

function ContentForm({ item, media }: { item?: any; media: any[] }) {
  return (
    <form action={saveContentItem} className="studio-form studio-paper">
      {item?.id ? <input type="hidden" name="id" value={item.id} /> : null}
      <div className="studio-form-grid">
        <label>Type<select name="content_type" defaultValue={item?.content_type ?? 'note'}>{typeOptions.map((v) => <option key={v}>{v}</option>)}</select></label>
        <label>Slug<input name="slug" required defaultValue={item?.slug ?? ''} /></label>
        <label>Title<input name="title" required defaultValue={item?.title ?? ''} /></label>
        <label>Visibility<select name="visibility" defaultValue={item?.visibility ?? 'owner'}>{visibilityOptions.map((v) => <option key={v}>{v}</option>)}</select></label>
        <label>Sort order<input name="sort_order" type="number" defaultValue={item?.sort_order ?? 0} /></label>
        <label>Cover media<select name="cover_media_id" defaultValue={item?.cover_media_id ?? ''}><option value="">None</option>{media.map((m) => <option value={m.id} key={m.id}>{m.title || m.file_name}</option>)}</select></label>
      </div>
      <label>Summary<textarea name="summary" rows={3} defaultValue={item?.summary ?? ''} /></label>
      <label>Body<textarea name="body_markdown" rows={12} defaultValue={item?.body_markdown ?? ''} /></label>
      <label>Metadata JSON<textarea name="metadata" rows={4} defaultValue={item ? JSON.stringify(item.metadata ?? {}, null, 2) : '{}'} /></label>
      <div className="studio-checks">
        <label><input type="checkbox" name="published" defaultChecked={item?.published ?? false} /> Published</label>
        <label><input type="checkbox" name="featured" defaultChecked={item?.featured ?? false} /> Featured</label>
      </div>
      <button className="studio-primary" type="submit">{item ? 'Save content' : 'Create content'}</button>
    </form>
  )
}

export default async function StudioContent() {
  const supabase = await createClient()
  const [{ data: items }, { data: media }] = await Promise.all([
    supabase.from('content_items').select('*').order('updated_at', { ascending: false }),
    supabase.from('media_assets').select('id,title,file_name').order('created_at', { ascending: false }),
  ])

  return (
    <>
      <header className="studio-header"><p className="micro-label">WRITING / WORK / LIFE</p><h1>Content</h1><p>Research、Projects、Notes、Photos、Music 都从同一套内容系统发布，并独立控制访问范围。</p></header>

      <section className="studio-section">
        <div className="studio-section-head"><div><p className="micro-label">NEW</p><h2>Create content</h2></div></div>
        <ContentForm media={media ?? []} />
      </section>

      <section className="studio-section">
        <div className="studio-section-head"><div><p className="micro-label">LIBRARY</p><h2>Existing content</h2></div><span className="studio-status">{(items ?? []).length} items</span></div>
        {(items ?? []).length === 0 ? <div className="studio-empty">还没有内容。你在上面创建的第一篇内容会自动出现在对应页面。</div> : null}
        {(items ?? []).map((item) => (
          <details className="studio-item" key={item.id}>
            <summary>
              <div><strong>{item.title}</strong><span>/{item.slug} · {item.content_type}</span></div>
              <span>{item.visibility} · {item.published ? 'live' : 'draft'}{item.featured ? ' · featured' : ''}</span>
            </summary>
            <ContentForm item={item} media={media ?? []} />
          </details>
        ))}
      </section>
    </>
  )
}
