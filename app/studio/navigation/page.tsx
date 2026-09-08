import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { saveNavigationItem } from '../actions'
import { deleteNavigationItem } from '../delete-actions'

function CustomNavForm({ item }: { item?: any }) {
  return (
    <form action={saveNavigationItem} className="studio-form studio-paper">
      {item?.id ? <input type="hidden" name="id" value={item.id} /> : null}
      <input type="hidden" name="page_id" value="" />
      <div className="studio-form-grid">
        <label>Label<input name="label" required defaultValue={item?.label ?? ''} /></label>
        <label>Href<input name="href" required defaultValue={item?.href ?? ''} placeholder="https://github.com/Aiowuka" /></label>
        <label>Audience<select name="audience" defaultValue={item?.audience ?? 'public'}><option>public</option><option>member</option><option>owner</option></select></label>
        <label>Sort order<input name="sort_order" type="number" defaultValue={item?.sort_order ?? 100} /></label>
      </div>
      <label className="studio-inline-check"><input type="checkbox" name="enabled" defaultChecked={item?.enabled ?? true} /> Enabled</label>
      <button className="studio-primary" type="submit">{item ? 'Save custom link' : 'Add custom link'}</button>
    </form>
  )
}

export default async function StudioNavigation() {
  const supabase = await createClient()
  const { data: items } = await supabase.from('navigation_items').select('*').order('sort_order')
  const pageItems = (items ?? []).filter((item) => item.page_id)
  const customItems = (items ?? []).filter((item) => !item.page_id)

  return (
    <>
      <header className="studio-header"><p className="micro-label">SITE MAP</p><h1>Navigation</h1><p>普通页面的菜单项由 Pages 自动生成并同步。这里主要用于额外的自定义链接，避免同一件事改两遍。</p></header>

      <section className="studio-section">
        <div className="studio-section-head"><div><p className="micro-label">PAGES</p><h2>Page navigation</h2></div><Link href="/studio/pages">Edit in Pages →</Link></div>
        <div className="studio-nav-readonly">
          {pageItems.map((item) => (
            <div className="studio-nav-row" key={item.id}>
              <div><strong>{item.label}</strong><span>{item.href}</span></div>
              <span>{item.audience} · {item.enabled ? 'on' : 'off'} · {item.sort_order}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="studio-section">
        <div className="studio-section-head"><div><p className="micro-label">CUSTOM</p><h2>Add custom link</h2></div></div>
        <CustomNavForm />
      </section>

      <section className="studio-section">
        <div className="studio-section-head"><div><p className="micro-label">EXTRA LINKS</p><h2>Custom links</h2></div><span className="studio-status">{customItems.length}</span></div>
        {customItems.length === 0 ? <div className="studio-empty">没有额外链接。Home / Now / Research 等页面菜单全部由 Pages 管理。</div> : null}
        {customItems.map((item) => (
          <details className="studio-item" key={item.id}>
            <summary><div><strong>{item.label}</strong><span>{item.href}</span></div><span>{item.audience} · {item.enabled ? 'on' : 'off'} · {item.sort_order}</span></summary>
            <CustomNavForm item={item} />
            <details className="studio-danger-zone">
              <summary>Delete custom link…</summary>
              <form action={deleteNavigationItem}><input type="hidden" name="id" value={item.id} /><button type="submit">Delete link</button></form>
            </details>
          </details>
        ))}
      </section>
    </>
  )
}
