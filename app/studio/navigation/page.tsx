import { createClient } from '@/lib/supabase/server'
import { saveNavigationItem } from '../actions'

function NavForm({ item, pages }: { item?: any; pages: any[] }) {
  return (
    <form action={saveNavigationItem} className="studio-form studio-paper">
      {item?.id ? <input type="hidden" name="id" value={item.id} /> : null}
      <div className="studio-form-grid">
        <label>Label<input name="label" required defaultValue={item?.label ?? ''} /></label>
        <label>Href<input name="href" required defaultValue={item?.href ?? ''} placeholder="/research" /></label>
        <label>Page<select name="page_id" defaultValue={item?.page_id ?? ''}><option value="">Custom link</option>{pages.map((p) => <option value={p.id} key={p.id}>/{p.slug} · {p.title}</option>)}</select></label>
        <label>Audience<select name="audience" defaultValue={item?.audience ?? 'public'}><option>public</option><option>member</option><option>owner</option></select></label>
        <label>Sort order<input name="sort_order" type="number" defaultValue={item?.sort_order ?? 0} /></label>
      </div>
      <label className="studio-inline-check"><input type="checkbox" name="enabled" defaultChecked={item?.enabled ?? true} /> Enabled</label>
      <button className="studio-primary" type="submit">{item ? 'Save navigation' : 'Add navigation'}</button>
    </form>
  )
}

export default async function StudioNavigation() {
  const supabase = await createClient()
  const [{ data: items }, { data: pages }] = await Promise.all([
    supabase.from('navigation_items').select('*').order('sort_order'),
    supabase.from('pages').select('id,slug,title').order('sort_order'),
  ])

  return (
    <>
      <header className="studio-header"><p className="micro-label">SITE MAP</p><h1>Navigation</h1><p>这里控制左侧菜单。每一项现在都是实际 route，不再是首页里的定位锚点。</p></header>
      <section className="studio-section">
        <div className="studio-section-head"><div><p className="micro-label">NEW</p><h2>Add menu item</h2></div></div>
        <NavForm pages={pages ?? []} />
      </section>
      <section className="studio-section">
        <div className="studio-section-head"><div><p className="micro-label">ORDER</p><h2>Menu items</h2></div></div>
        {(items ?? []).map((item) => <details className="studio-item" key={item.id}><summary><div><strong>{item.label}</strong><span>{item.href}</span></div><span>{item.audience} · {item.enabled ? 'on' : 'off'} · {item.sort_order}</span></summary><NavForm item={item} pages={pages ?? []} /></details>)}
      </section>
    </>
  )
}
