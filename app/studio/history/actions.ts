'use server'

import { revalidatePath } from 'next/cache'
import { requireOwner } from '@/lib/access'
import { createClient } from '@/lib/supabase/server'

type Snapshot = Record<string, unknown>

function text(formData: FormData, key: string, required = false) {
  const value = String(formData.get(key) ?? '').trim()
  if (required && !value) throw new Error(`MISSING_${key.toUpperCase()}`)
  return value
}

function pick(snapshot: Snapshot, keys: string[]) {
  return Object.fromEntries(keys.filter((key) => key in snapshot).map((key) => [key, snapshot[key]]))
}

function refreshAll() {
  revalidatePath('/')
  revalidatePath('/studio')
  revalidatePath('/studio/history')
  revalidatePath('/studio/pages')
  revalidatePath('/studio/content')
  revalidatePath('/studio/navigation')
  revalidatePath('/studio/settings')
  revalidatePath('/private')
}

export async function restoreVersion(formData: FormData) {
  await requireOwner()
  const supabase = await createClient()
  const versionId = Number(text(formData, 'version_id', true))
  if (!Number.isInteger(versionId) || versionId <= 0) throw new Error('INVALID_VERSION_ID')

  const { data: version, error: lookupError } = await supabase
    .from('content_versions')
    .select('id,entity_type,entity_key,snapshot')
    .eq('id', versionId)
    .maybeSingle()
  if (lookupError) throw lookupError
  if (!version || !version.snapshot || typeof version.snapshot !== 'object' || Array.isArray(version.snapshot)) throw new Error('VERSION_NOT_FOUND')

  const snapshot = version.snapshot as Snapshot
  let error: { message?: string } | null = null

  if (version.entity_type === 'page') {
    const payload = pick(snapshot, ['id','slug','title','nav_label','summary','template','collection_type','visibility','published','sort_order','show_in_nav','created_by','created_at','updated_at'])
    const result = await supabase.from('pages').upsert(payload, { onConflict: 'id' })
    error = result.error
  } else if (version.entity_type === 'block') {
    const payload = pick(snapshot, ['id','page_id','block_key','kind','label','title','body_markdown','data','visibility','published','sort_order','created_by','created_at','updated_at'])
    const result = await supabase.from('page_blocks').upsert(payload, { onConflict: 'id' })
    error = result.error
  } else if (version.entity_type === 'content') {
    const payload = pick(snapshot, ['id','slug','title','summary','body_markdown','visibility','published','sort_order','created_by','created_at','updated_at','content_type','featured','metadata','published_at','cover_media_id'])
    const result = await supabase.from('content_items').upsert(payload, { onConflict: 'id' })
    error = result.error
  } else if (version.entity_type === 'navigation') {
    const payload = pick(snapshot, ['id','label','href','page_id','audience','enabled','sort_order','created_by','created_at','updated_at'])
    const result = await supabase.from('navigation_items').upsert(payload, { onConflict: 'id' })
    error = result.error
  } else if (version.entity_type === 'setting') {
    const payload = pick(snapshot, ['key','value','is_public','updated_by','updated_at'])
    const result = await supabase.from('site_settings').upsert(payload, { onConflict: 'key' })
    error = result.error
  } else {
    throw new Error('UNSUPPORTED_VERSION_TYPE')
  }

  if (error) throw error
  refreshAll()
}
