import { createClient } from '@/lib/supabase/server'
import { saveSetting } from '../actions'
import { deleteSetting } from '../delete-actions'

const essentialFields = [
  { key: 'site_name', label: 'Site name', help: '左侧手写名字。', rows: 1 },
  { key: 'location', label: 'Location', help: '左侧底部位置。', rows: 1 },
  { key: 'school', label: 'School', help: '左侧底部学校简称。', rows: 1 },
  { key: 'topbar_note', label: 'Topbar note', help: '页面顶部的小字。', rows: 1 },
  { key: 'rail_mantra', label: 'Rail mantra', help: '名字下面的小句子。', rows: 2 },
  { key: 'rail_note', label: 'Rail note', help: '左侧中部的手写句子。', rows: 2 },
] as const

const homepageFields = [
  { key: 'hero_title', label: 'Hero title', help: '首页最大的英文标题。', rows: 3 },
  { key: 'hero_body', label: 'Hero introduction', help: '首页自我介绍正文，建议中文。', rows: 5 },
  { key: 'hero_photo_note', label: 'Photo handwriting', help: 'Hero 图片上的手写文字。', rows: 3 },
  { key: 'hero_photo_caption', label: 'Photo caption', help: 'Hero 图片左下角的小字。', rows: 2 },
  { key: 'notes_note', label: 'Notes handwriting', help: '首页 Notes 区域手写句。', rows: 2 },
  { key: 'planet_note_top', label: 'Planet note — line 1', help: '黑色便签第一行。', rows: 1 },
  { key: 'planet_note_bottom', label: 'Planet note — line 2', help: '黑色便签第二行。', rows: 1 },
  { key: 'portal_note', label: 'Private portal note', help: '首页私人空间入口的说明。', rows: 4 },
] as const

function EssentialForm({ field, value }: { field: { key: string; label: string; help: string; rows: number }; value: string }) {
  return (
    <form action={saveSetting} className="studio-setting-row">
      <input type="hidden" name="key" value={field.key} />
      <input type="hidden" name="is_public" value="on" />
      <div>
        <strong>{field.label}</strong>
        <span>{field.help}</span>
      </div>
      {field.rows === 1 ? <input name="value" defaultValue={value} /> : <textarea name="value" rows={field.rows} defaultValue={value} />}
      <button type="submit">Save</button>
    </form>
  )
}

function AdvancedSettingForm({ setting }: { setting?: any }) {
  const value = setting ? (typeof setting.value === 'string' ? setting.value : JSON.stringify(setting.value, null, 2)) : ''
  return (
    <form action={saveSetting} className="studio-form studio-paper">
      <div className="studio-form-grid">
        <label>Key<input name="key" required defaultValue={setting?.key ?? ''} readOnly={Boolean(setting?.key)} /></label>
      </div>
      <label>Value<textarea name="value" rows={5} defaultValue={value} /></label>
      <label className="studio-inline-check"><input type="checkbox" name="is_public" defaultChecked={setting?.is_public ?? true} /> Public setting</label>
      <button className="studio-primary" type="submit">{setting ? 'Save setting' : 'Create setting'}</button>
    </form>
  )
}

export default async function StudioSettings() {
  const supabase = await createClient()
  const { data: settings } = await supabase.from('site_settings').select('*').order('key')
  const byKey = new Map((settings ?? []).map((setting) => [setting.key, setting]))
  const essentialKeys = new Set([...essentialFields, ...homepageFields].map((field) => field.key))
  const advanced = (settings ?? []).filter((setting) => !essentialKeys.has(setting.key) && setting.key !== 'hero_media_id')

  const stringValue = (key: string) => {
    const value = byKey.get(key)?.value
    return typeof value === 'string' ? value : value == null ? '' : JSON.stringify(value)
  }

  return (
    <>
      <header className="studio-header"><p className="micro-label">GLOBAL CONTENT</p><h1>Settings</h1><p>这里改的是跨页面出现的个人信息和首页文字。Hero 图片本身在 Media 页面管理。</p></header>

      <section className="studio-section">
        <div className="studio-section-head"><div><p className="micro-label">IDENTITY / SHELL</p><h2>Site identity</h2></div></div>
        <div className="studio-settings-list">{essentialFields.map((field) => <EssentialForm field={field} value={stringValue(field.key)} key={field.key} />)}</div>
      </section>

      <section className="studio-section">
        <div className="studio-section-head"><div><p className="micro-label">HOMEPAGE COPY</p><h2>Homepage text</h2></div></div>
        <div className="studio-settings-list">{homepageFields.map((field) => <EssentialForm field={field} value={stringValue(field.key)} key={field.key} />)}</div>
      </section>

      <section className="studio-section">
        <div className="studio-section-head"><div><p className="micro-label">ADVANCED</p><h2>Custom settings</h2></div></div>
        <details className="studio-add-details"><summary>+ Create custom setting</summary><AdvancedSettingForm /></details>
        {advanced.map((setting) => (
          <details className="studio-item" key={setting.key}>
            <summary><div><strong>{setting.key}</strong><span>{typeof setting.value === 'string' ? setting.value.slice(0, 72) : 'JSON value'}</span></div><span>{setting.is_public ? 'public' : 'owner'}</span></summary>
            <AdvancedSettingForm setting={setting} />
            <details className="studio-danger-zone">
              <summary>Delete setting…</summary>
              <form action={deleteSetting}><input type="hidden" name="key" value={setting.key} /><p>删除后代码会使用默认值；旧值仍在 History。</p><button type="submit">Delete setting</button></form>
            </details>
          </details>
        ))}
      </section>
    </>
  )
}
