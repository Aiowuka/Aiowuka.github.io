import { createClient } from '@/lib/supabase/server'
import { saveMediaMetadata, uploadMedia } from '../actions'

const visibilityOptions = ['public', 'member', 'selected', 'owner']

export default async function StudioMedia() {
  const supabase = await createClient()
  const { data: media } = await supabase.from('media_assets').select('*').order('created_at', { ascending: false })
  const paths = (media ?? []).map((m) => m.storage_path)
  const signed = paths.length ? await supabase.storage.from('site-media').createSignedUrls(paths, 60 * 60) : { data: [] as any[], error: null }
  const previews = new Map<string, string>()
  ;(signed.data ?? []).forEach((entry: any, index: number) => {
    const url = entry?.signedUrl || entry?.signedURL
    if (url) previews.set(paths[index], url)
  })

  return (
    <>
      <header className="studio-header"><p className="micro-label">ASSETS</p><h1>Media</h1><p>真实照片、封面和以后需要的音频素材从这里上传。Storage 是私有桶，访问仍受 RLS 控制。</p></header>

      <section className="studio-section">
        <div className="studio-section-head"><div><p className="micro-label">UPLOAD</p><h2>Add media</h2></div></div>
        <form action={uploadMedia} className="studio-form studio-paper" encType="multipart/form-data">
          <label>File<input type="file" name="file" accept="image/*,audio/*" required /></label>
          <div className="studio-form-grid">
            <label>Title<input name="title" /></label>
            <label>Alt text<input name="alt_text" /></label>
            <label>Visibility<select name="visibility" defaultValue="owner">{visibilityOptions.map((v) => <option key={v}>{v}</option>)}</select></label>
          </div>
          <label>Caption<textarea name="caption" rows={3} /></label>
          <button className="studio-primary" type="submit">Upload</button>
        </form>
      </section>

      <section className="studio-section">
        <div className="studio-section-head"><div><p className="micro-label">LIBRARY</p><h2>Media library</h2></div><span className="studio-status">{(media ?? []).length} files</span></div>
        <div className="studio-media-grid">
          {(media ?? []).map((item) => {
            const preview = previews.get(item.storage_path)
            const isImage = item.mime_type?.startsWith('image/')
            return (
              <article className="studio-media-card" key={item.id}>
                <div className="studio-media-preview">
                  {preview && isImage ? <img src={preview} alt={item.alt_text || item.title || item.file_name} /> : <span>{item.mime_type || 'FILE'}</span>}
                </div>
                <form action={saveMediaMetadata} className="studio-form compact">
                  <input type="hidden" name="id" value={item.id} />
                  <label>Title<input name="title" defaultValue={item.title ?? ''} /></label>
                  <label>Alt<input name="alt_text" defaultValue={item.alt_text ?? ''} /></label>
                  <label>Caption<textarea name="caption" rows={2} defaultValue={item.caption ?? ''} /></label>
                  <label>Visibility<select name="visibility" defaultValue={item.visibility}>{visibilityOptions.map((v) => <option key={v}>{v}</option>)}</select></label>
                  <button type="submit">Save</button>
                </form>
              </article>
            )
          })}
        </div>
      </section>
    </>
  )
}
