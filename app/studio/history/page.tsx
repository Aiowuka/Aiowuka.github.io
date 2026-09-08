import { createClient } from '@/lib/supabase/server'
import { restoreVersion } from './actions'

type Version = {
  id: number
  entity_type: string
  entity_key: string
  action: string
  snapshot: Record<string, unknown>
  created_at: string
}

function snapshotName(version: Version) {
  const snapshot = version.snapshot || {}
  if (typeof snapshot.title === 'string' && snapshot.title) return snapshot.title
  if (typeof snapshot.label === 'string' && snapshot.label) return snapshot.label
  if (typeof snapshot.key === 'string' && snapshot.key) return snapshot.key
  if (typeof snapshot.slug === 'string' && snapshot.slug) return `/${snapshot.slug}`
  return version.entity_key
}

function snapshotSummary(version: Version) {
  const snapshot = version.snapshot || {}
  const bits = [
    typeof snapshot.visibility === 'string' ? snapshot.visibility : null,
    typeof snapshot.published === 'boolean' ? (snapshot.published ? 'live' : 'draft') : null,
    typeof snapshot.content_type === 'string' ? snapshot.content_type : null,
  ].filter(Boolean)
  return bits.join(' · ')
}

export default async function StudioHistory() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('content_versions')
    .select('id,entity_type,entity_key,action,snapshot,created_at')
    .order('created_at', { ascending: false })
    .limit(120)
  const versions = (data ?? []) as Version[]

  return (
    <>
      <header className="studio-header">
        <p className="micro-label">UNDO / AUDIT</p>
        <h1>History</h1>
        <p>Pages、Blocks、Content、Navigation 和 Settings 在更新或删除前都会自动保存快照。Restore 会把该快照重新写回当前网站。</p>
      </header>

      <section className="studio-section">
        <div className="studio-section-head">
          <div><p className="micro-label">RECENT</p><h2>Version history</h2></div>
          <span className="studio-status">latest {versions.length}</span>
        </div>
        {versions.length === 0 ? <div className="studio-empty">还没有历史版本。第一次修改内容后，这里会自动出现记录。</div> : null}
        <div className="studio-history-list">
          {versions.map((version) => (
            <article className="studio-history-item" key={version.id}>
              <div className="studio-history-main">
                <p className="micro-label">{version.entity_type.toUpperCase()} · {version.action}</p>
                <h3>{snapshotName(version)}</h3>
                <p>{snapshotSummary(version) || 'snapshot'}</p>
                <time dateTime={version.created_at}>{new Date(version.created_at).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}</time>
              </div>
              <div className="studio-history-actions">
                <form action={restoreVersion}>
                  <input type="hidden" name="version_id" value={version.id} />
                  <button type="submit">Restore this version</button>
                </form>
                <details className="studio-advanced">
                  <summary>Inspect snapshot</summary>
                  <pre>{JSON.stringify(version.snapshot, null, 2)}</pre>
                </details>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
