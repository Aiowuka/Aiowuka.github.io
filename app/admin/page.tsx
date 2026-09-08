import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { currentProfile } from '@/lib/access'
import {
  approveMember,
  blockMember,
  grantSelectedAccess,
  revokeSelectedAccess,
  saveContent,
  updateContentSettings,
} from './actions'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const { profile } = await currentProfile()
  if (!profile) redirect('/login')
  if (profile.role !== 'owner') redirect('/private')

  const supabase = await createClient()
  const [{ data: profiles }, { data: items }, { data: grants }] = await Promise.all([
    supabase.from('profiles').select('id,email,display_name,role,approved,created_at').order('created_at', { ascending: false }),
    supabase.from('content_items').select('id,slug,title,summary,visibility,published,updated_at').order('updated_at', { ascending: false }),
    supabase.from('content_access').select('content_id,user_id'),
  ])

  const allProfiles = profiles ?? []
  const allItems = items ?? []
  const approvedMembers = allProfiles.filter((p) => p.role !== 'owner' && p.approved)
  const pendingMembers = allProfiles.filter((p) => p.role !== 'owner' && !p.approved)
  const publishedItems = allItems.filter((item) => item.published)

  return (
    <main className="admin-shell">
      <div className="row">
        <div>
          <Link className="portal-wordmark" href="/">Aiowuka</Link>
          <div className="micro-label" style={{ marginTop: 8 }}>OWNER WORKBENCH</div>
        </div>
        <div className="row">
          <Link href="/private">私人空间</Link>
          <Link href="/">主页</Link>
          <form action="/auth/signout" method="post"><button className="button">退出登录</button></form>
        </div>
      </div>

      <h1>后台。</h1>
      <p className="muted" style={{ maxWidth: 620, lineHeight: 1.8 }}>这里是网站的工作台，不是给访客看的页面。成员批准、内容发布和 SELECTED 授权都从这里完成。</p>

      <section className="admin-stats" aria-label="Admin overview">
        <div><span>WAITING</span><strong>{pendingMembers.length}</strong><small>待批准</small></div>
        <div><span>CONTENT</span><strong>{allItems.length}</strong><small>全部内容</small></div>
        <div><span>LIVE</span><strong>{publishedItems.length}</strong><small>已发布</small></div>
        <div><span>MEMBERS</span><strong>{approvedMembers.length}</strong><small>已批准</small></div>
      </section>

      <section className="panel stack">
        <div>
          <span className="micro-label">ACCESS / PEOPLE</span>
          <h2 style={{ marginTop: 8 }}>成员授权</h2>
        </div>
        <p className="muted">登录只证明身份。只有你批准后，对方才获得 MEMBER 权限。</p>
        {allProfiles.map((p) => (
          <div className="row" key={p.id}>
            <div>
              <strong>{p.display_name || p.email}</strong>
              <div className="muted">{p.email} · {p.role}</div>
            </div>
            {p.role === 'owner' ? (
              <span className="badge">OWNER</span>
            ) : p.approved ? (
              <form action={blockMember}>
                <input type="hidden" name="id" value={p.id} />
                <button className="button">撤销 MEMBER</button>
              </form>
            ) : (
              <form action={approveMember}>
                <input type="hidden" name="id" value={p.id} />
                <button className="button primary">批准 MEMBER</button>
              </form>
            )}
          </div>
        ))}
      </section>

      <section className="panel stack">
        <div>
          <span className="micro-label">WRITE / PUBLISH</span>
          <h2 style={{ marginTop: 8 }}>新增内容</h2>
        </div>
        <form action={saveContent}>
          <div className="field"><label>Slug</label><input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="example-note" /></div>
          <div className="field"><label>标题</label><input name="title" required /></div>
          <div className="field"><label>摘要</label><textarea name="summary" rows={3} /></div>
          <div className="field"><label>正文</label><textarea name="body" rows={12} /></div>
          <div className="field">
            <label>可见范围</label>
            <select name="visibility" defaultValue="owner">
              <option value="public">PUBLIC · 所有人</option>
              <option value="member">MEMBER · 你批准的成员</option>
              <option value="selected">SELECTED · 你逐个指定的人</option>
              <option value="owner">OWNER · 只有你</option>
            </select>
          </div>
          <label><input type="checkbox" name="published" /> 发布</label>
          <div style={{ marginTop: 18 }}><button className="button primary">保存内容 →</button></div>
        </form>
      </section>

      <section className="panel stack">
        <div>
          <span className="micro-label">CONTENT / PERMISSIONS</span>
          <h2 style={{ marginTop: 8 }}>内容权限</h2>
        </div>
        <p className="muted">你可以随时改变可见范围或撤回发布；SELECTED 内容还可以精确指定到个人。</p>
        {allItems.length === 0 && <p className="muted">还没有内容。</p>}
        {allItems.map((item) => {
          const itemGrants = new Set((grants ?? []).filter((g) => g.content_id === item.id).map((g) => g.user_id))
          return (
            <article className="content-card stack" key={item.id}>
              <div className="row">
                <div>
                  <strong>{item.title}</strong>
                  <div className="muted">/{item.slug}</div>
                </div>
                <span className="badge">{item.visibility} · {item.published ? 'live' : 'draft'}</span>
              </div>

              <form action={updateContentSettings} className="row">
                <input type="hidden" name="id" value={item.id} />
                <select name="visibility" defaultValue={item.visibility} aria-label={`Visibility for ${item.title}`}>
                  <option value="public">PUBLIC</option>
                  <option value="member">MEMBER</option>
                  <option value="selected">SELECTED</option>
                  <option value="owner">OWNER</option>
                </select>
                <label><input type="checkbox" name="published" defaultChecked={item.published} /> 发布</label>
                <button className="button">更新权限</button>
              </form>

              {item.visibility === 'selected' && (
                <div className="stack">
                  <div className="muted">SELECTED 授权名单</div>
                  {approvedMembers.length === 0 ? (
                    <p className="muted">还没有已批准的 MEMBER。先在上方批准成员。</p>
                  ) : approvedMembers.map((member) => {
                    const allowed = itemGrants.has(member.id)
                    const action = allowed ? revokeSelectedAccess : grantSelectedAccess
                    return (
                      <div className="row" key={member.id}>
                        <div>
                          <strong>{member.display_name || member.email}</strong>
                          <div className="muted">{member.email}</div>
                        </div>
                        <form action={action}>
                          <input type="hidden" name="content_id" value={item.id} />
                          <input type="hidden" name="user_id" value={member.id} />
                          <button className={allowed ? 'button' : 'button primary'}>
                            {allowed ? '撤销访问' : '允许访问'}
                          </button>
                        </form>
                      </div>
                    )
                  })}
                </div>
              )}
            </article>
          )
        })}
      </section>
    </main>
  )
}
