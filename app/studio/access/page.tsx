import { createClient } from '@/lib/supabase/server'
import {
  approveMember,
  blockMember,
  grantContentAccess,
  grantPageAccess,
  revokeContentAccess,
  revokePageAccess,
} from '../actions'
import { grantBlockAccess, grantMediaAccess, revokeBlockAccess, revokeMediaAccess } from './actions'

export default async function StudioAccess() {
  const supabase = await createClient()
  const [
    { data: profiles },
    { data: content },
    { data: pages },
    { data: blocks },
    { data: media },
    { data: contentGrants },
    { data: pageGrants },
    { data: blockGrants },
    { data: mediaGrants },
  ] = await Promise.all([
    supabase.from('profiles').select('id,email,display_name,role,approved,created_at').order('created_at', { ascending: false }),
    supabase.from('content_items').select('id,title,slug,content_type,visibility').eq('visibility', 'selected').order('updated_at', { ascending: false }),
    supabase.from('pages').select('id,title,slug,visibility').order('sort_order'),
    supabase.from('page_blocks').select('id,page_id,block_key,label,title,visibility').eq('visibility', 'selected').order('sort_order'),
    supabase.from('media_assets').select('id,title,file_name,mime_type,visibility').eq('visibility', 'selected').order('created_at', { ascending: false }),
    supabase.from('content_access').select('content_id,user_id'),
    supabase.from('page_access').select('page_id,user_id'),
    supabase.from('block_access').select('block_id,user_id'),
    supabase.from('media_access').select('media_id,user_id'),
  ])

  const members = (profiles ?? []).filter((p) => p.role !== 'owner')
  const approved = members.filter((p) => p.approved)
  const selectedPages = (pages ?? []).filter((p) => p.visibility === 'selected')
  const pageById = new Map((pages ?? []).map((page) => [page.id, page]))

  return (
    <>
      <header className="studio-header"><p className="micro-label">AUTHORIZATION</p><h1>Access</h1><p>登录只证明身份。MEMBER 由你批准，SELECTED 再针对具体页面、页面 Block、内容或媒体逐人授权。</p></header>

      <section className="studio-section">
        <div className="studio-section-head"><div><p className="micro-label">MEMBERS</p><h2>People</h2></div><span className="studio-status">{approved.length} approved · {members.length - approved.length} pending</span></div>
        <div className="studio-access-list">
          {(profiles ?? []).map((person) => (
            <div className="studio-access-row" key={person.id}>
              <div><strong>{person.display_name || person.email}</strong><span>{person.email} · {person.role}</span></div>
              {person.role === 'owner' ? <span className="tiny-badge">OWNER</span> : person.approved ? (
                <form action={blockMember}><input type="hidden" name="id" value={person.id} /><button type="submit">Revoke MEMBER</button></form>
              ) : (
                <form action={approveMember}><input type="hidden" name="id" value={person.id} /><button className="studio-primary" type="submit">Approve MEMBER</button></form>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="studio-section">
        <div className="studio-section-head"><div><p className="micro-label">SELECTED CONTENT</p><h2>Content grants</h2></div></div>
        {(content ?? []).length === 0 ? <div className="studio-empty">没有 SELECTED 内容。把某篇 Content 的 visibility 改成 selected 后会出现在这里。</div> : null}
        {(content ?? []).map((item) => (
          <article className="studio-grant-card" key={item.id}>
            <div><strong>{item.title}</strong><span>{item.content_type} · /{item.slug}</span></div>
            <div className="studio-grant-people">
              {approved.map((person) => {
                const allowed = (contentGrants ?? []).some((g) => g.content_id === item.id && g.user_id === person.id)
                const action = allowed ? revokeContentAccess : grantContentAccess
                return <form action={action} key={person.id}><input type="hidden" name="content_id" value={item.id} /><input type="hidden" name="user_id" value={person.id} /><span>{person.display_name || person.email}</span><button type="submit">{allowed ? 'Revoke' : 'Allow'}</button></form>
              })}
            </div>
          </article>
        ))}
      </section>

      <section className="studio-section">
        <div className="studio-section-head"><div><p className="micro-label">SELECTED PAGES</p><h2>Page grants</h2></div></div>
        {selectedPages.length === 0 ? <div className="studio-empty">没有 SELECTED 页面。</div> : null}
        {selectedPages.map((page) => (
          <article className="studio-grant-card" key={page.id}>
            <div><strong>{page.title}</strong><span>/{page.slug}</span></div>
            <div className="studio-grant-people">
              {approved.map((person) => {
                const allowed = (pageGrants ?? []).some((g) => g.page_id === page.id && g.user_id === person.id)
                const action = allowed ? revokePageAccess : grantPageAccess
                return <form action={action} key={person.id}><input type="hidden" name="page_id" value={page.id} /><input type="hidden" name="user_id" value={person.id} /><span>{person.display_name || person.email}</span><button type="submit">{allowed ? 'Revoke' : 'Allow'}</button></form>
              })}
            </div>
          </article>
        ))}
      </section>

      <section className="studio-section">
        <div className="studio-section-head"><div><p className="micro-label">SELECTED BLOCKS</p><h2>Page block grants</h2></div></div>
        {(blocks ?? []).length === 0 ? <div className="studio-empty">没有 SELECTED Block。Page 内某一小块也可以单独只开放给指定成员。</div> : null}
        {(blocks ?? []).map((block) => {
          const page = pageById.get(block.page_id)
          return (
            <article className="studio-grant-card" key={block.id}>
              <div><strong>{block.title || block.label || block.block_key}</strong><span>{page ? `/${page.slug}` : 'page'} · {block.block_key}</span></div>
              <div className="studio-grant-people">
                {approved.map((person) => {
                  const allowed = (blockGrants ?? []).some((g) => g.block_id === block.id && g.user_id === person.id)
                  const action = allowed ? revokeBlockAccess : grantBlockAccess
                  return <form action={action} key={person.id}><input type="hidden" name="block_id" value={block.id} /><input type="hidden" name="user_id" value={person.id} /><span>{person.display_name || person.email}</span><button type="submit">{allowed ? 'Revoke' : 'Allow'}</button></form>
                })}
              </div>
            </article>
          )
        })}
      </section>

      <section className="studio-section">
        <div className="studio-section-head"><div><p className="micro-label">SELECTED MEDIA</p><h2>Media grants</h2></div></div>
        {(media ?? []).length === 0 ? <div className="studio-empty">没有 SELECTED 媒体。把某张图片或文件的 visibility 改成 selected 后会出现在这里。</div> : null}
        {(media ?? []).map((asset) => (
          <article className="studio-grant-card" key={asset.id}>
            <div><strong>{asset.title || asset.file_name}</strong><span>{asset.mime_type || 'file'}</span></div>
            <div className="studio-grant-people">
              {approved.map((person) => {
                const allowed = (mediaGrants ?? []).some((g) => g.media_id === asset.id && g.user_id === person.id)
                const action = allowed ? revokeMediaAccess : grantMediaAccess
                return <form action={action} key={person.id}><input type="hidden" name="media_id" value={asset.id} /><input type="hidden" name="user_id" value={person.id} /><span>{person.display_name || person.email}</span><button type="submit">{allowed ? 'Revoke' : 'Allow'}</button></form>
              })}
            </div>
          </article>
        ))}
      </section>
    </>
  )
}
