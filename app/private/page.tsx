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

  return (
    <main className="auth-shell">
      <div className="row">
        <Link href="/">← 返回主页（保持登录）</Link>
        <form action="/auth/signout" method="post">
          <button className="button">退出登录</button>
        </form>
      </div>

      <h1 style={{ fontSize: 58 }}>Private</h1>

      {!profile.approved && profile.role !== 'owner' ? (
        <div className="panel">
          <h2>等待授权</h2>
          <p className="muted">你的账号已经验证，但站点所有者还没有批准 MEMBER 权限。公开内容仍可正常访问。</p>
        </div>
      ) : (
        <div className="content-list">
          {(items || []).length ? (
            items!.map((item) => (
              <article className="content-card" key={item.id}>
                <div className="row">
                  <h2>{item.title}</h2>
                  <span className="badge">{item.visibility}</span>
                </div>
                <p className="muted">{item.summary}</p>
                <Link href={`/private/${item.slug}`}>阅读 →</Link>
              </article>
            ))
          ) : (
            <p className="muted">目前还没有对你开放的私人内容。</p>
          )}
        </div>
      )}
    </main>
  )
}
