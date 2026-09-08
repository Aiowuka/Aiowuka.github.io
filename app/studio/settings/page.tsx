import { createClient } from '@/lib/supabase/server'
import { saveSetting } from '../actions'

function SettingForm({ setting }: { setting?: any }) {
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
  return (
    <>
      <header className="studio-header"><p className="micro-label">GLOBAL CONTENT</p><h1>Settings</h1><p>Hero、简介、位置、学校、Portal 文案等跨页面内容放在这里。</p></header>
      <section className="studio-section"><div className="studio-section-head"><div><p className="micro-label">NEW</p><h2>Create setting</h2></div></div><SettingForm /></section>
      <section className="studio-section">
        <div className="studio-section-head"><div><p className="micro-label">KEY / VALUE</p><h2>Site settings</h2></div></div>
        {(settings ?? []).map((setting) => <details className="studio-item" key={setting.key}><summary><div><strong>{setting.key}</strong><span>{typeof setting.value === 'string' ? setting.value.slice(0, 72) : 'JSON value'}</span></div><span>{setting.is_public ? 'public' : 'owner'}</span></summary><SettingForm setting={setting} /></details>)}
      </section>
    </>
  )
}
