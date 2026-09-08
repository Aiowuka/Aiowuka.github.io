import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { currentProfile } from '@/lib/access'

export const dynamic = 'force-dynamic'

export default async function PrivatePage() {
  const { profile } = await currentProfile()
  if (!profile) redirect('/login')

  const supabase = await createClient()
  const { data: items } = await supabase
    .from('content_items')
    .select('id,slug,title,summary,visibility,updated_at')
    .eq('published', true)
    .order('sort_order')
    .order('created_at', { ascending: false })

  const name = profile.display_name || '朋友'
  const isOwner = profile.role === 'owner'

  return (
    <main className="portal-page">
      <header className="portal-header">
        <Link className="portal-wordmark" href="/">Aiowuka</Link>
        <div className="portal-actions">
          {isOwner && <Link href="/studio">Studio ↗</Link>}
          <Link href="/">Home</Link>
          <form action="/auth/signout" method="post"><button className="text-button">Sign out</button></form>
        </div>
      </header>

      <section className="portal-intro">
        <div>
          <span className="micro-label">PRIVATE ROOM</span>
          <h1>欢迎回来，<br/>{name}。</h1>
        </div>
        <p className="portal-handnote">有些东西，<br/>适合小范围地分享。</p>
      </section>

      {!profile.approved && !isOwner ? (
        <section className="waiting-paper">
          <span className="pin-dot" />
          <div>
            <h2>还差一次授权</h2>
            <p>你的邮箱已经验证成功，但还没有获得 MEMBER 权限。公开内容依然可以正常浏览；等我批准后，这里会自动出现对你开放的内容。</p>
          </div>
        </section>
      ) : (
        <section className="private-library">
          <div className="library-label">
            <span>FOR YOU</span>
            <p>{isOwner ? '作为 OWNER，你可以看到所有受保护内容，并从 Studio 修改整个网站。' : '这里只显示你当前有权限阅读的内容。'}</p>
          </div>

          <div className="library-list">
            {(items || []).length ? items!.map((item, index) => (
              <Link className="library-item" href={`/private/${item.slug}`} key={item.id}>
                <span className="library-no">{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <span className="micro-label">{item.visibility}</span>
                  <h2>{item.title}</h2>
                  <p>{item.summary || '没有摘要。直接打开看看。'}</p>
                </div>
                <span className="library-arrow">→</span>
              </Link>
            )) : (
              <div className="empty-note">
                <p className="portal-handnote">这里暂时还是空的。</p>
                <span>等我放点东西进来。</span>
              </div>
            )}
          </div>
        </section>
      )}

      <footer className="portal-footer">
        <span>AIowuka · private room</span>
        <span>Access is personal, not automatic.</span>
      </footer>
    </main>
  )
}
