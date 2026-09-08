'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireOwner } from '@/lib/access'

const VISIBILITIES = ['public', 'member', 'selected', 'owner'] as const

type Visibility = (typeof VISIBILITIES)[number]

function requiredString(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? '').trim()
  if (!value) throw new Error(`MISSING_${key.toUpperCase()}`)
  return value
}

function visibilityFrom(formData: FormData): Visibility {
  const value = String(formData.get('visibility') ?? '')
  if (!VISIBILITIES.includes(value as Visibility)) throw new Error('INVALID_VISIBILITY')
  return value as Visibility
}

function refreshAdminAndPrivate() {
  revalidatePath('/admin')
  revalidatePath('/private')
}

export async function approveMember(formData: FormData) {
  await requireOwner()
  const id = requiredString(formData, 'id')
  const supabase = await createClient()
  const { error } = await supabase.from('profiles').update({ approved: true }).eq('id', id)
  if (error) throw error
  refreshAdminAndPrivate()
}

export async function blockMember(formData: FormData) {
  await requireOwner()
  const id = requiredString(formData, 'id')
  const supabase = await createClient()
  const { error } = await supabase.from('profiles').update({ approved: false }).eq('id', id)
  if (error) throw error
  refreshAdminAndPrivate()
}

export async function saveContent(formData: FormData) {
  const { claims } = await requireOwner()
  const supabase = await createClient()
  const visibility = visibilityFrom(formData)
  const slug = requiredString(formData, 'slug')
  const title = requiredString(formData, 'title')

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error('INVALID_SLUG')

  const { error } = await supabase.from('content_items').insert({
    slug,
    title,
    summary: String(formData.get('summary') ?? '').trim(),
    body_markdown: String(formData.get('body') ?? ''),
    visibility,
    published: formData.get('published') === 'on',
    created_by: claims!.sub,
  })
  if (error) throw error
  refreshAdminAndPrivate()
}

export async function updateContentSettings(formData: FormData) {
  await requireOwner()
  const id = requiredString(formData, 'id')
  const visibility = visibilityFrom(formData)
  const supabase = await createClient()
  const { error } = await supabase
    .from('content_items')
    .update({ visibility, published: formData.get('published') === 'on' })
    .eq('id', id)
  if (error) throw error
  refreshAdminAndPrivate()
}

export async function grantSelectedAccess(formData: FormData) {
  const { claims } = await requireOwner()
  const contentId = requiredString(formData, 'content_id')
  const userId = requiredString(formData, 'user_id')
  const supabase = await createClient()
  const { error } = await supabase.from('content_access').upsert(
    { content_id: contentId, user_id: userId, created_by: claims!.sub },
    { onConflict: 'content_id,user_id' },
  )
  if (error) throw error
  refreshAdminAndPrivate()
}

export async function revokeSelectedAccess(formData: FormData) {
  await requireOwner()
  const contentId = requiredString(formData, 'content_id')
  const userId = requiredString(formData, 'user_id')
  const supabase = await createClient()
  const { error } = await supabase
    .from('content_access')
    .delete()
    .eq('content_id', contentId)
    .eq('user_id', userId)
  if (error) throw error
  refreshAdminAndPrivate()
}
