import { createClient } from '@/lib/supabase/server'
import { saveMediaMetadata } from '../actions'
import { clearHomepageHeroMedia, deleteMedia, setHomepageHeroMedia } from './actions'
import MediaUploader from './media-uploader'
import './media.css'

const visibilityOptions = ['public', 'member', 'selected', 'owner']

export default async function StudioMedia() {
  const supabase = await createClient()
  const [{ data: media }, { data: heroSetting }] = await Promise.all([
    supabase.from('media_assets').select('*').order('created_at', { ascending: false }),
    supabase.from('site_settings').select('value').eq('key', 'hero_media_id').maybeSingle(),
  ])
  const heroMediaId = typeof heroSetting?.value === 'string' ? heroSetting.value : null
  const paths = (media ?? []).map((m) => m.storage_path)
  const signed = paths.length ? await supabase.storage.from('site-media').createSignedUrls(paths, 60 * 60) : { data: [] as any[], error: null }
  const previews = new Map<string, string>()
  ;(signed.data ?? []).forEach((entry: any, index: number) => {
    const url = entry?.signedUrl || entry?.signedURL
    if (url) previews.set(paths[index], url)
  })

  return (
    <>
      <header className="studio-header"><p className="micro-label">ASSETS</p><h1>Media</h1><p>真实照片、封面和音频素材从这里上传。文件直接进入 Supabase Storage，内容权限仍由数据库控制。</p></header>

      <section className="studio-section">
        <div className="studio-section-head"><div><p className="micro-label">UPLOAD</p><h2>Add media</h2></div></div>
        <MediaUploader />
      </section>

      <section className="studio-section">
        <div className="studio-section-head">
          <div><p className="micro-label">HOMEPAGE</p><h2>Hero image</h2></div>
          <span className="studio-status">{heroMediaId ? 'custom image' : 'CSS fallback'}</span>
        </div>
        <div className="studio-paper studio-hero-control">
          <p>{heroMediaId ? '首页正在使用 Media Library 里的真实照片。' : '首页目前使用内置的 CSS 占位视觉。上传一张 PUBLIC 图片后，可以直接设为 Hero。'}</p>
          {heroMediaId ? <form action={clearHomepageHeroMedia}><button type="submit">Use CSS fallback</button></form> : null}
        </div>
      </section>

      <section className="studio-section">
        <div className="studio-section-head"><div><p className="micro-label">LIBRARY</p><h2>Media library</h2></div><span className="studio-status">{(media ?? []).length} files</span></div>
        <div className="studio-media-grid">
          {(media ?? []).map((item) => {
            const preview = previews.get(item.storage_path)
            const isImage = item.mime_type?.startsWith('image/')
            const isHero = heroMediaId === item.id
            return (
              <article className={`studio-media-card${isHero ? ' is-hero' : ''}`} key={item.id}>
                <div className="studio-media-preview">
                  {preview && isImage ? <img src={preview} alt={item.alt_text || item.title || item.file_name} /> : <span>{item.mime_type || 'FILE'}</span>}
                  {isHero ? <span className="studio-media-hero-badge">HOMEPAGE HERO</span> : null}
                </div>
                <form action={saveMediaMetadata} className="studio-form compact">
                  <input type="hidden" name="id" value={item.id} />
                  <label>Title<input name="title" defaultValue={item.title ?? ''} /></label>
                  <label>Alt<input name="alt_text" defaultValue={item.alt_text ?? ''} /></label>
                  <label>Caption<textarea name="caption" rows={2} defaultValue={item.caption ?? ''} /></label>
                  <label>Visibility<select name="visibility" defaultValue={item.visibility}>{visibilityOptions.map((v) => <option key={v}>{v}</option>)}</select></label>
                  <button type="submit">Save</button>
                </form>
                {isImage && item.visibility === 'public' && !isHero ? (
                  <form action={setHomepageHeroMedia} className="studio-media-action">
                    <input type="hidden" name="id" value={item.id} />
                    <button type="submit">Use as homepage hero</button>
                  </form>
                ) : null}
                {isImage && item.visibility !== 'public' ? <p className="studio-media-hint">Set visibility to PUBLIC before using this image on the public homepage.</p> : null}
                <details className="studio-danger-zone">
                  <summary>Delete file…</summary>
                  <form action={deleteMedia}>
                    <input type="hidden" name="id" value={item.id} />
                    <p>This removes the database record and the Storage object.</p>
                    <button type="submit">Delete permanently</button>
                  </form>
                </details>
              </article>
            )
          })}
        </div>
      </section>
    </>
  )
}
