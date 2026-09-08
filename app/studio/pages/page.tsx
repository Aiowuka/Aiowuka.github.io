import { createClient } from '@/lib/supabase/server'
import { saveBlock, savePage } from '../actions'

const visibilityOptions = ['public', 'member', 'selected', 'owner']
const templateOptions = ['home', 'collection', 'now', 'about', 'standard']

function PageForm({ page }: { page?: any }) {
  return (
    <form action={savePage} className="studio-form studio-paper">
      {page?.id ? <input type="hidden" name="id" value={page.id} /> : null}
      <div className="studio-form-grid">
        <label>Slug<input name="slug" defaultValue={page?.slug ?? ''} required /></label>
        <label>Title<input name="title" defaultValue={page?.title ?? ''} required /></label>
        <label>Nav label<input name="nav_label" defaultValue={page?.nav_label ?? ''} /></label>
        <label>Template<select name="template" defaultValue={page?.template ?? 'standard'}>{templateOptions.map((v) => <option key={v}>{v}</option>)}</select></label>
        <label>Collection type<input name="collection_type" defaultValue={page?.collection_type ?? ''} placeholder="research / project / note..." /></label>
        <label>Visibility<select name="visibility" defaultValue={page?.visibility ?? 'owner'}>{visibilityOptions.map((v) => <option key={v}>{v}</option>)}</select></label>
        <label>Sort order<input name="sort_order" type="number" defaultValue={page?.sort_order ?? 0} /></label>
      </div>
      <label>Summary<textarea name="summary" rows={3} defaultValue={page?.summary ?? ''} /></label>
      <div className="studio-checks">
        <label><input type="checkbox" name="published" defaultChecked={page?.published ?? false} /> Published</label>
        <label><input type="checkbox" name="show_in_nav" defaultChecked={page?.show_in_nav ?? true} /> Show in nav</label>
      </div>
      <button className="studio-primary" type="submit">{page ? 'Save page' : 'Create page'}</button>
    </form>
  )
}

function BlockForm({ block, pageId }: { block?: any; pageId: string }) {
  return (
    <form action={saveBlock} className="studio-form studio-block-form">
      {block?.id ? <input type="hidden" name="id" value={block.id} /> : null}
      <input type="hidden" name="page_id" value={pageId} />
      <div className="studio-form-grid">
        <label>Block key<input name="block_key" defaultValue={block?.block_key ?? ''} required /></label>
        <label>Kind<input name="kind" defaultValue={block?.kind ?? 'text'} /></label>
        <label>Label<input name="label" defaultValue={block?.label ?? ''} /></label>
        <label>Title<input name="title" defaultValue={block?.title ?? ''} /></label>
        <label>Visibility<select name="visibility" defaultValue={block?.visibility ?? 'public'}>{visibilityOptions.map((v) => <option key={v}>{v}</option>)}</select></label>
        <label>Sort order<input name="sort_order" type="number" defaultValue={block?.sort_order ?? 0} /></label>
      </div>
      <label>Body<textarea name="body_markdown" rows={6} defaultValue={block?.body_markdown ?? ''} /></label>
      <label>Data JSON<textarea name="data" rows={3} defaultValue={block ? JSON.stringify(block.data ?? {}, null, 2) : '{}'} /></label>
      <label className="studio-inline-check"><input type="checkbox" name="published" defaultChecked={block?.published ?? true} /> Published</label>
      <button type="submit">{block ? 'Save block' : 'Add block'}</button>
    </form>
  )
}

export default async function StudioPages() {
  const supabase = await createClient()
  const [{ data: pages }, { data: blocks }] = await Promise.all([
    supabase.from('pages').select('*').order('sort_order'),
    supabase.from('page_blocks').select('*').order('sort_order'),
  ])

  return (
    <>
      <header className="studio-header"><p className="micro-label">STRUCTURE</p><h1>Pages</h1><p>页面是网站的长期骨架；Block 是页面内部可以自己修改和排序的内容。</p></header>

      <section className="studio-section">
        <div className="studio-section-head"><div><p className="micro-label">NEW</p><h2>Create a page</h2></div></div>
        <PageForm />
      </section>

      {(pages ?? []).map((page) => (
        <section className="studio-section" key={page.id}>
          <div className="studio-section-head">
            <div><p className="micro-label">/{page.slug}</p><h2>{page.title}</h2></div>
            <span className="studio-status">{page.visibility} · {page.published ? 'live' : 'draft'}</span>
          </div>
          <PageForm page={page} />
          <div className="studio-subsection">
            <div className="studio-section-head small"><div><p className="micro-label">BLOCKS</p><h3>Page content</h3></div></div>
            {(blocks ?? []).filter((b) => b.page_id === page.id).map((block) => <BlockForm block={block} pageId={page.id} key={block.id} />)}
            <details className="studio-add-details"><summary>+ Add block</summary><BlockForm pageId={page.id} /></details>
          </div>
        </section>
      ))}
    </>
  )
}
