import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { saveBlock, savePage } from '../actions'
import { deleteBlock, deletePage } from '../delete-actions'

const visibilityOptions = ['public', 'member', 'selected', 'owner']
const templateOptions = ['home', 'collection', 'now', 'about', 'standard']
const collectionOptions = ['', 'research', 'project', 'note', 'photo', 'music']

function PageForm({ page }: { page?: any }) {
  const isHome = page?.slug === 'home'
  return (
    <form action={savePage} className="studio-form studio-paper">
      {page?.id ? <input type="hidden" name="id" value={page.id} /> : null}
      <div className="studio-form-grid">
        <label>Slug<input name="slug" defaultValue={page?.slug ?? ''} required placeholder="about" readOnly={isHome} />{isHome ? <span className="studio-field-help">System route. `/` permanently maps to the `home` slug.</span> : null}</label>
        <label>Title<input name="title" defaultValue={page?.title ?? ''} required /></label>
        <label>Nav label<input name="nav_label" defaultValue={page?.nav_label ?? ''} /></label>
        <label>Template
          {isHome ? <input type="hidden" name="template" value="home" /> : null}
          <select name={isHome ? undefined : 'template'} defaultValue={page?.template ?? 'standard'} disabled={isHome}>{templateOptions.map((v) => <option key={v}>{v}</option>)}</select>
          {isHome ? <span className="studio-field-help">Homepage template is a system invariant.</span> : null}
        </label>
        <label>Collection<select name="collection_type" defaultValue={page?.collection_type ?? ''}>{collectionOptions.map((v) => <option value={v} key={v || 'none'}>{v || 'None'}</option>)}</select></label>
        <label>Visibility<select name="visibility" defaultValue={page?.visibility ?? 'owner'}>{visibilityOptions.map((v) => <option key={v}>{v}</option>)}</select></label>
        <label>Sort order<input name="sort_order" type="number" defaultValue={page?.sort_order ?? 0} /></label>
      </div>
      <label>Summary<textarea name="summary" rows={3} defaultValue={page?.summary ?? ''} /></label>
      <div className="studio-checks">
        {isHome ? <input type="hidden" name="published" value="on" /> : null}
        <label><input type="checkbox" name={isHome ? undefined : 'published'} defaultChecked={isHome ? true : (page?.published ?? false)} disabled={isHome} /> Published{isHome ? ' · system locked' : ''}</label>
        <label><input type="checkbox" name="show_in_nav" defaultChecked={page?.show_in_nav ?? true} /> Show in nav</label>
      </div>
      <button className="studio-primary" type="submit">{page ? 'Save page' : 'Create page'}</button>
    </form>
  )
}

function BlockForm({ block, pageId }: { block?: any; pageId: string }) {
  return (
    <div className="studio-block-editor">
      <form action={saveBlock} className="studio-form studio-block-form">
        {block?.id ? <input type="hidden" name="id" value={block.id} /> : null}
        <input type="hidden" name="page_id" value={pageId} />
        <div className="studio-form-grid">
          <label>Block key<input name="block_key" defaultValue={block?.block_key ?? ''} required /></label>
          <label>Kind<select name="kind" defaultValue={block?.kind ?? 'text'}><option value="text">text</option><option value="status">status</option></select></label>
          <label>Label<input name="label" defaultValue={block?.label ?? ''} /></label>
          <label>Title<input name="title" defaultValue={block?.title ?? ''} /></label>
          <label>Visibility<select name="visibility" defaultValue={block?.visibility ?? 'public'}>{visibilityOptions.map((v) => <option key={v}>{v}</option>)}</select></label>
          <label>Sort order<input name="sort_order" type="number" defaultValue={block?.sort_order ?? 0} /></label>
        </div>
        <label>Body<textarea name="body_markdown" rows={7} defaultValue={block?.body_markdown ?? ''} /></label>
        <details className="studio-advanced"><summary>Advanced block data</summary><label>Data JSON<textarea name="data" rows={3} defaultValue={block ? JSON.stringify(block.data ?? {}, null, 2) : '{}'} /></label></details>
        <label className="studio-inline-check"><input type="checkbox" name="published" defaultChecked={block?.published ?? true} /> Published</label>
        <button type="submit">{block ? 'Save block' : 'Add block'}</button>
      </form>
      {block?.id ? (
        <details className="studio-danger-zone">
          <summary>Delete block…</summary>
          <form action={deleteBlock}>
            <input type="hidden" name="id" value={block.id} />
            <p>删除前的版本仍会保存在 History。</p>
            <button type="submit">Delete block</button>
          </form>
        </details>
      ) : null}
    </div>
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
      <header className="studio-header"><p className="micro-label">STRUCTURE</p><h1>Pages</h1><p>页面是网站的长期骨架；Block 是页面内部可以自己修改和排序的内容。页面标题、slug、菜单显示与顺序会自动同步到导航。</p></header>

      <section className="studio-section">
        <div className="studio-section-head"><div><p className="micro-label">NEW</p><h2>Create a page</h2></div></div>
        <PageForm />
      </section>

      {(pages ?? []).map((page) => {
        const isHome = page.slug === 'home'
        const href = isHome ? '/' : `/${page.slug}`
        const previewHref = isHome ? '/?preview=1' : `${href}?preview=1`
        return (
          <section className="studio-section" key={page.id}>
            <div className="studio-section-head">
              <div><p className="micro-label">{href}</p><h2>{page.title}</h2></div>
              <div className="studio-head-actions"><span className="studio-status">{isHome ? 'system · ' : ''}{page.visibility} · {page.published ? 'live' : 'draft'}</span><Link href={previewHref}>{isHome ? 'Preview homepage ↗' : 'Preview page ↗'}</Link></div>
            </div>
            <PageForm page={page} />
            {!isHome ? (
              <details className="studio-danger-zone">
                <summary>Delete page…</summary>
                <form action={deletePage}>
                  <input type="hidden" name="id" value={page.id} />
                  <p>页面和它的 Blocks 会从网站消失；删除前快照会进入 History。Home 页面不可删除。</p>
                  <button type="submit">Delete page</button>
                </form>
              </details>
            ) : null}
            <div className="studio-subsection">
              <div className="studio-section-head small"><div><p className="micro-label">BLOCKS</p><h3>Page content</h3></div><Link href={previewHref}>Preview with drafts →</Link></div>
              {(blocks ?? []).filter((b) => b.page_id === page.id).map((block) => <BlockForm block={block} pageId={page.id} key={block.id} />)}
              <details className="studio-add-details"><summary>+ Add block</summary><BlockForm pageId={page.id} /></details>
            </div>
          </section>
        )
      })}
    </>
  )
}
