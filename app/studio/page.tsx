import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function StudioOverview() {
  const supabase = await createClient()
  const [pages, content, media, profiles, versions] = await Promise.all([
    supabase.from('pages').select('id,published', { count: 'exact' }),
    supabase.from('content_items').select('id,published', { count: 'exact' }),
    supabase.from('media_assets').select('id', { count: 'exact' }),
    supabase.from('profiles').select('id,role,approved'),
    supabase.from('content_versions').select('id', { count: 'exact', head: true }),
  ])

  const contentRows = content.data ?? []
  const pending = (profiles.data ?? []).filter((p) => p.role !== 'owner' && !p.approved).length
  const published = contentRows.filter((item) => item.published).length

  const cards = [
    ['Pages', pages.count ?? 0, '/studio/pages'],
    ['Content', content.count ?? 0, '/studio/content'],
    ['Published', published, '/studio/content'],
    ['Media', media.count ?? 0, '/studio/media'],
    ['Pending access', pending, '/studio/access'],
    ['History', versions.count ?? 0, '/studio/history'],
  ] as const

  return (
    <>
      <header className="studio-header">
        <p className="micro-label">OWNER WORKSPACE</p>
        <h1>Studio</h1>
        <p>以后网站的日常维护都从这里完成。代码负责设计系统，Supabase 负责内容、结构、媒体和访问边界。</p>
      </header>

      <section className="studio-stats">
        {cards.map(([label, value, href]) => (
          <Link href={href} key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </Link>
        ))}
      </section>

      <section className="studio-section">
        <div className="studio-section-head">
          <div><p className="micro-label">WORKFLOW</p><h2>What changes where</h2></div>
          <Link href="/">View site →</Link>
        </div>
        <div className="studio-guide-grid">
          <article><strong>Pages</strong><p>改页面标题、介绍、模板、排序、Blocks 和页面级 PUBLIC / MEMBER / SELECTED / OWNER；菜单会自动同步。</p></article>
          <article><strong>Content</strong><p>写 Research / Project / Note / Photo / Music，设置封面、发布、Featured 和访问范围。</p></article>
          <article><strong>Navigation</strong><p>普通页面菜单由 Pages 自动管理；这里只维护 GitHub 等额外自定义链接。</p></article>
          <article><strong>Media</strong><p>上传真实照片和音频、改权限，并能一键把 PUBLIC 图片设为首页 Hero。</p></article>
          <article><strong>Access</strong><p>批准 MEMBER，并给 SELECTED 页面、Block、内容和媒体逐人授权。</p></article>
          <article><strong>Settings</strong><p>修改 Hero、简介、位置、学校、Portal 文案等站点级内容。</p></article>
          <article><strong>History</strong><p>更新或删除前自动留快照，需要时可以把旧版本恢复回来。</p></article>
        </div>
      </section>
    </>
  )
}
