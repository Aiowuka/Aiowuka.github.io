'use server'

import { revalidatePath } from 'next/cache'
import { requireOwner } from '@/lib/access'
import { createClient } from '@/lib/supabase/server'

function text(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? '').trim()
  if (!value) throw new Error(`MISSING_${key.toUpperCase()}`)
  return value
}

export async function grantMediaAccess(formData: FormData) {
  const { claims } = await requireOwner()
  const supabase = await createClient()
  const mediaId = text(formData, 'media_id')
  const userId = text(formData, 'user_id')
  const { error } = await supabase.from('media_access').upsert(
    { media_id: mediaId, user_id: userId, created_by: String(claims!.sub) },
    { onConflict: 'media_id,user_id' },
  )
  if (error) throw error
  revalidatePath('/studio/access')
  revalidatePath('/private')
}

export async function revokeMediaAccess(formData: FormData) {
  await requireOwner()
  const supabase = await createClient()
  const { error } = await supabase.from('media_access').delete()
    .eq('media_id', text(formData, 'media_id'))
    .eq('user_id', text(formData, 'user_id'))
  if (error) throw error
  revalidatePath('/studio/access')
  revalidatePath('/private')
}
