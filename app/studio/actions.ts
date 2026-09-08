'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireOwner } from '@/lib/access'

const VISIBILITIES = ['public', 'member', 'selected', 'owner'] as const
const CONTENT_TYPES = ['research', 'project', 'note', 'photo', 'music'] as const
const PAGE_TEMPLATES = ['home', 'collection', 'now', 'about', 'standard'] as const

function text(formData: FormData, key: string, required = false) {
  const value = String(formData.get(key) ?? '').trim()
  if (required && !value) throw new Error(`MISSING_${key.toUpperCase()}`)
  return value
}

function integer(formData: FormData, key: string, fallback = 0) {
  const value = Number.parseInt(String(formData.get(key) ?? ''), 10)
  return Number.isFinite(value) ? value : fallback
}

function visibility(formData: FormData) {
  const value = text(formData, 'visibility')
  if (!VISIBILITIES.includes(value as (typeof VISIBILITIES)[number])) throw new Error('INVALID_VISIBILITY')
  return value as (typeof VISIBILITIES)[number]
}

function parseTags(formData: FormData) {
  const raw = text(formData, 'tags')
  if (!raw) return []
  const tags = [...new Set(raw.split(/[,，\n]+/).map((tag) => tag.trim().replace(/^#+/, '')).filter(Boolean))]
  if (tags.length > 16 || tags.some((tag) => tag.length > 48)) throw new Error('INVALID_TAGS')
  return tags
}

function sectionFor(contentType: string) {
  if (contentType === 'project') return 'projects'
  if (contentType === 'photo') return 'photos'
  if (contentType === 'music') return 'music'
  if (contentType === 'research') return 'research'
  return 'notes'
}

function refreshCms(paths: string[] = []) {
  revalidatePath('/')
  revalidatePath('/studio')
  for (const path of paths) revalidatePath(path)
}

export async function savePage(formData: FormData) {
  const { claims } = await requireOwner()
  const supabase = await createClient()
  const id = text(formData, 'id')
  const slug = text(formData, 'slug', true)
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error('INVALID_SLUG')

  const template = text(formData, 'template') || 'standard'
  if (!PAGE_TEMPLATES.includes(template as (typeof PAGE_TEMPLATES)[number])) throw new Error('INVALID_TEMPLATE')

  const payload = {
    slug,
    title: text(formData, 'title', true),
    nav_label: text(formData, 'nav_label') || null,
    summary: text(formData, 'summary') || null,
    template,
    collection_type: text(formData, 'collection_type') || null,
    visibility: visibility(formData),
    published: formData.get('published') === 'on',
    show_in_nav: formData.get('show_in_nav') === 'on',
    sort_order: integer(formData, 'sort_order'),
  }

  const previous = id
    ? (await supabase.from('pages').select('slug').eq('id', id).maybeSingle()).data
    : null
  const result = id
    ? await supabase.from('pages').update(payload).eq('id', id)
    : await supabase.from('pages').insert({ ...payload, created_by: String(claims!.sub) })
  if (result.error) throw result.error
  refreshCms([
    slug === 'home' ? '/' : `/${slug}`,
    previous?.slug && previous.slug !== slug ? (previous.slug === 'home' ? '/' : `/${previous.slug}`) : '',
  ].filter(Boolean))
}

export async function saveBlock(formData: FormData) {
  const { claims } = await requireOwner()
  const supabase = await createClient()
  const id = text(formData, 'id')
  const pageId = text(formData, 'page_id', true)
  const blockKey = text(formData, 'block_key', true)
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(blockKey)) throw new Error('INVALID_BLOCK_KEY')

  let data: Record<string, unknown> = {}
  const rawData = text(formData, 'data')
  if (rawData) {
    try { data = JSON.parse(rawData) as Record<string, unknown> } catch { throw new Error('INVALID_BLOCK_JSON') }
  }

  const payload = {
    page_id: pageId,
    block_key: blockKey,
    kind: text(formData, 'kind') || 'text',
    label: text(formData, 'label') || null,
    title: text(formData, 'title') || null,
    body_markdown: String(formData.get('body_markdown') ?? ''),
    data,
    visibility: visibility(formData),
    published: formData.get('published') === 'on',
    sort_order: integer(formData, 'sort_order'),
  }

  const result = id
    ? await supabase.from('page_blocks').update(payload).eq('id', id)
    : await supabase.from('page_blocks').insert({ ...payload, created_by: String(claims!.sub) })
  if (result.error) throw result.error
  refreshCms()
}

export async function saveContentItem(formData: FormData) {
  const { claims } = await requireOwner()
  const supabase = await createClient()
  const id = text(formData, 'id')
  const slug = text(formData, 'slug', true)
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error('INVALID_SLUG')

  const contentType = text(formData, 'content_type')
  if (!CONTENT_TYPES.includes(contentType as (typeof CONTENT_TYPES)[number])) throw new Error('INVALID_CONTENT_TYPE')

  let metadata: Record<string, unknown> = {}
  const rawMetadata = text(formData, 'metadata')
  if (rawMetadata) {
    try { metadata = JSON.parse(rawMetadata) as Record<string, unknown> } catch { throw new Error('INVALID_METADATA_JSON') }
  }

  const previous = id
    ? (await supabase.from('content_items').select('slug,content_type,published_at').eq('id', id).maybeSingle()).data
    : null
  const published = formData.get('published') === 'on'
  const coverMediaId = text(formData, 'cover_media_id') || null
  const payload = {
    slug,
    title: text(formData, 'title', true),
    summary: text(formData, 'summary') || null,
    body_markdown: String(formData.get('body_markdown') ?? ''),
    content_type: contentType,
    visibility: visibility(formData),
    published,
    featured: formData.get('featured') === 'on',
    tags: parseTags(formData),
    sort_order: integer(formData, 'sort_order'),
    metadata,
    cover_media_id: coverMediaId,
    published_at: published ? (previous?.published_at || new Date().toISOString()) : null,
  }

  const result = id
    ? await supabase.from('content_items').update(payload).eq('id', id)
    : await supabase.from('content_items').insert({ ...payload, created_by: String(claims!.sub) })
  if (result.error) throw result.error

  const section = sectionFor(contentType)
  const paths = [`/${section}`, `/${section}/${slug}`]
  if (previous) {
    const oldSection = sectionFor(previous.content_type)
    paths.push(`/${oldSection}`, `/${oldSection}/${previous.slug}`)
  }
  refreshCms([...new Set(paths)])
}

export async function saveNavigationItem(formData: FormData) {
  const { claims } = await requireOwner()
  const supabase = await createClient()
  const id = text(formData, 'id')
  const audience = text(formData, 'audience') || 'public'
  if (!['public', 'member', 'owner'].includes(audience)) throw new Error('INVALID_AUDIENCE')

  const payload = {
    label: text(formData, 'label', true),
    href: text(formData, 'href', true),
    page_id: text(formData, 'page_id') || null,
    audience,
    enabled: formData.get('enabled') === 'on',
    sort_order: integer(formData, 'sort_order'),
  }
  const result = id
    ? await supabase.from('navigation_items').update(payload).eq('id', id)
    : await supabase.from('navigation_items').insert({ ...payload, created_by: String(claims!.sub) })
  if (result.error) throw result.error
  refreshCms()
}

export async function saveSetting(formData: FormData) {
  const { claims } = await requireOwner()
  const supabase = await createClient()
  const key = text(formData, 'key', true)
  const raw = String(formData.get('value') ?? '')
  let value: unknown = raw
  try { value = JSON.parse(raw) } catch { value = raw }

  const { error } = await supabase.from('site_settings').upsert({
    key,
    value,
    is_public: formData.get('is_public') === 'on',
    updated_by: String(claims!.sub),
  })
  if (error) throw error
  refreshCms()
}

export async function approveMember(formData: FormData) {
  await requireOwner()
  const supabase = await createClient()
  const id = text(formData, 'id', true)
  const { error } = await supabase.from('profiles').update({ approved: true }).eq('id', id)
  if (error) throw error
  refreshCms(['/private'])
}

export async function blockMember(formData: FormData) {
  await requireOwner()
  const supabase = await createClient()
  const id = text(formData, 'id', true)
  const { error } = await supabase.from('profiles').update({ approved: false }).eq('id', id)
  if (error) throw error
  refreshCms(['/private'])
}

export async function grantContentAccess(formData: FormData) {
  const { claims } = await requireOwner()
  const supabase = await createClient()
  const contentId = text(formData, 'content_id', true)
  const userId = text(formData, 'user_id', true)
  const { error } = await supabase.from('content_access').upsert(
    { content_id: contentId, user_id: userId, created_by: String(claims!.sub) },
    { onConflict: 'content_id,user_id' },
  )
  if (error) throw error
  refreshCms(['/private'])
}

export async function revokeContentAccess(formData: FormData) {
  await requireOwner()
  const supabase = await createClient()
  const { error } = await supabase.from('content_access').delete()
    .eq('content_id', text(formData, 'content_id', true))
    .eq('user_id', text(formData, 'user_id', true))
  if (error) throw error
  refreshCms(['/private'])
}

export async function grantPageAccess(formData: FormData) {
  const { claims } = await requireOwner()
  const supabase = await createClient()
  const pageId = text(formData, 'page_id', true)
  const userId = text(formData, 'user_id', true)
  const { error } = await supabase.from('page_access').upsert(
    { page_id: pageId, user_id: userId, created_by: String(claims!.sub) },
    { onConflict: 'page_id,user_id' },
  )
  if (error) throw error
  refreshCms()
}

export async function revokePageAccess(formData: FormData) {
  await requireOwner()
  const supabase = await createClient()
  const { error } = await supabase.from('page_access').delete()
    .eq('page_id', text(formData, 'page_id', true))
    .eq('user_id', text(formData, 'user_id', true))
  if (error) throw error
  refreshCms()
}

export async function saveMediaMetadata(formData: FormData) {
  await requireOwner()
  const supabase = await createClient()
  const id = text(formData, 'id', true)
  const { error } = await supabase.from('media_assets').update({
    title: text(formData, 'title') || null,
    alt_text: text(formData, 'alt_text') || null,
    caption: text(formData, 'caption') || null,
    visibility: visibility(formData),
  }).eq('id', id)
  if (error) throw error
  refreshCms()
}
