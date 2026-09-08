import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { currentProfile } from '@/lib/access'
import { approveMember, blockMember, saveContent } from './actions'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const { profile } = await currentProfile(); if (!profile) redirect('/login'); if (profile.role !== 'owner') redirect('/private')
  const supabase = await createClient()
  const [{ data: profiles }, { data: items }] = await Promise.all([
    supabase.from('profiles').select('id,email,display_name,role,approved,created_at').order('created_at',{ascending:false}),
    supabase.from('content_items').select('id,slug,title,summary,visibility,published,updated_at').order('updated_at',{ascending:false})
  ])
  return <main className="admin-shell"><div className="row"><Link href="/">← Home</Link><form action="/auth/signout" method="post"><button className="button">Sign out</button></form></div><h1 style={{fontSize:58}}>Admin</h1><section className="panel stack"><h2>成员授权</h2>{(profiles||[]).map(p=><div className="row" key={p.id}><div><strong>{p.display_name||p.email}</strong><div className="muted">{p.email} · {p.role}</div></div>{p.role==='owner'?<span className="badge">OWNER</span>:p.approved?<form action={blockMember}><input type="hidden" name="id" value={p.id}/><button className="button">撤销 MEMBER</button></form>:<form action={approveMember}><input type="hidden" name="id" value={p.id}/><button className="button primary">批准 MEMBER</button></form>}</div>)}</section><section className="panel stack" style={{marginTop:24}}><h2>新增内容</h2><form action={saveContent}><div className="field"><label>Slug</label><input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*"/></div><div className="field"><label>标题</label><input name="title" required/></div><div className="field"><label>摘要</label><textarea name="summary"/></div><div className="field"><label>正文</label><textarea name="body" rows={10}/></div><div className="field"><label>可见范围</label><select name="visibility" defaultValue="owner"><option value="public">PUBLIC</option><option value="member">MEMBER</option><option value="selected">SELECTED</option><option value="owner">OWNER</option></select></div><label><input type="checkbox" name="published"/> 发布</label><div style={{marginTop:16}}><button className="button primary">保存</button></div></form></section><section className="panel stack" style={{marginTop:24}}><h2>现有内容</h2>{(items||[]).map(i=><div className="row" key={i.id}><div><strong>{i.title}</strong><div className="muted">/{i.slug}</div></div><span className="badge">{i.visibility} · {i.published?'live':'draft'}</span></div>)}</section></main>
}
