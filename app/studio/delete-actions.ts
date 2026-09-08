'use server'

import { revalidatePath } from 'next/cache'
import { requireOwner } from '@/lib/access'
import { createClient } from '@/lib/supabase/server'

function value(formData: FormData, key: string, required = false) {
  const result = String(formData.get(key) ?? '').trim()
  if (required && !result) throw new Error(`MISSING_${key.toUpperCase()}`)
  return result
}

function refresh(...paths: string[]) {
  revalidatePath('/')
  revalidatePath('/studio')
  for (const path of paths) revalidatePath(path)
}

export async function deletePage(formData: FormData) {
  await requireOwner()
  const supabase = await createClient()
  const id = value(formData, 'id', true)
  const { data: page, error: lookupError } = await supabase.from('pages').select('slug').eq('id', id).maybeSingle()
  if (lookupError) throw lookupError
  if (!page) return
  if (page.slug === 'home') throw new Error('HOME_PAGE_CANNOT_BE_DELETED')

  const { error } = await supabase.from('pages').delete().eq('id', id)
  if (error) throw error
  refresh('/studio/pages', `/${page.slug}`)
}

export async function deleteBlock(formData: FormData) {
  await requireOwner()
  const supabase = await createClient()
  const id = value(formData, 'id', true)
  const { error } = await supabase.from('page_blocks').delete().eq('id', id)
  if (error) throw error
  refresh('/studio/pages')
}

export async function deleteContentItem(formData: FormData) {
  await requireOwner()
  const supabase = await createClient()
  const id = value(formData, 'id', true)
  const { data: item, error: lookupError } = await supabase
    .from('content_items')
    .select('slug,content_type')
    .eq('id', id)
    .maybeSingle()
  if (lookupError) throw lookupError
  if (!item) return

  const section = item.content_type === 'project' ? 'projects'
    : item.content_type === 'photo' ? 'photos'
      : item.content_type === 'music' ? 'music'
        : item.content_type === 'research' ? 'research' : 'notes'
  const { error } = await supabase.from('content_items').delete().eq('id', id)
  if (error) throw error
  refresh('/studio/content', `/${section}`, `/${section}/${item.slug}`)
}

export async function deleteNavigationItem(formData: FormData) {
  await requireOwner()
  const supabase = await createClient()
  const id = value(formData, 'id', true)
  const { data: item, error: lookupError } = await supabase.from('navigation_items').select('page_id').eq('id', id).maybeSingle()
  if (lookupError) throw lookupError
  if (!item) return
  if (item.page_id) throw new Error('PAGE_LINKED_NAV_IS_MANAGED_FROM_PAGES')

  const { error } = await supabase.from('navigation_items').delete().eq('id', id)
  if (error) throw error
  refresh('/studio/navigation')
}

export async function deleteSetting(formData: FormData) {
  await requireOwner()
  const supabase = await createClient()
  const key = value(formData, 'key', true)
  const { error } = await supabase.from('site_settings').delete().eq('key', key)
  if (error) throw error
  refresh('/studio/settings')
}
