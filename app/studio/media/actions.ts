'use server'

import { revalidatePath } from 'next/cache'
import { requireOwner } from '@/lib/access'
import { createClient } from '@/lib/supabase/server'

const VISIBILITIES = ['public', 'member', 'selected', 'owner'] as const

function value(formData: FormData, key: string, required = false) {
  const result = String(formData.get(key) ?? '').trim()
  if (required && !result) throw new Error(`MISSING_${key.toUpperCase()}`)
  return result
}

function visibility(formData: FormData) {
  const result = value(formData, 'visibility', true)
  if (!VISIBILITIES.includes(result as (typeof VISIBILITIES)[number])) throw new Error('INVALID_VISIBILITY')
  return result as (typeof VISIBILITIES)[number]
}

function safeStoragePath(path: string) {
  return path.length <= 240 && !path.includes('..') && /^[a-zA-Z0-9/_ .-]+$/.test(path)
}

export async function registerUploadedMedia(formData: FormData) {
  const { claims } = await requireOwner()
  const supabase = await createClient()
  const storagePath = value(formData, 'storage_path', true)
  if (!safeStoragePath(storagePath)) throw new Error('INVALID_STORAGE_PATH')

  const byteSize = Number(value(formData, 'byte_size') || '0')
  if (!Number.isFinite(byteSize) || byteSize < 0 || byteSize > 20 * 1024 * 1024) throw new Error('INVALID_FILE_SIZE')

  const { error } = await supabase.from('media_assets').insert({
    storage_path: storagePath,
    file_name: value(formData, 'file_name', true),
    mime_type: value(formData, 'mime_type') || null,
    byte_size: byteSize || null,
    title: value(formData, 'title') || value(formData, 'file_name', true),
    alt_text: value(formData, 'alt_text') || null,
    caption: value(formData, 'caption') || null,
    visibility: visibility(formData),
    created_by: String(claims!.sub),
  })
  if (error) throw error
  revalidatePath('/studio/media')
  revalidatePath('/studio/content')
  revalidatePath('/')
}

export async function deleteMedia(formData: FormData) {
  await requireOwner()
  const supabase = await createClient()
  const id = value(formData, 'id', true)
  const { data: media, error: lookupError } = await supabase
    .from('media_assets')
    .select('storage_path')
    .eq('id', id)
    .maybeSingle()
  if (lookupError) throw lookupError
  if (!media) return

  const { error: storageError } = await supabase.storage.from('site-media').remove([media.storage_path])
  if (storageError) throw storageError
  const { error: dbError } = await supabase.from('media_assets').delete().eq('id', id)
  if (dbError) throw dbError

  revalidatePath('/studio/media')
  revalidatePath('/studio/content')
  revalidatePath('/')
}
