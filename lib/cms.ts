import { createClient } from '@/lib/supabase/server'

export type NavItem = {
  id: string
  label: string
  href: string
  audience: 'public' | 'member' | 'owner'
  sort_order: number
}

export type CmsPage = {
  id: string
  slug: string
  title: string
  nav_label: string | null
  summary: string | null
  template: string
  collection_type: string | null
  visibility: 'public' | 'member' | 'selected' | 'owner'
  published: boolean
  sort_order: number
  show_in_nav: boolean
}

export type PageBlock = {
  id: string
  page_id: string
  block_key: string
  kind: string
  label: string | null
  title: string | null
  body_markdown: string
  data: Record<string, unknown>
  visibility: 'public' | 'member' | 'selected' | 'owner'
  published: boolean
  sort_order: number
}

export type ContentItem = {
  id: string
  slug: string
  title: string
  summary: string | null
  body_markdown: string
  content_type: string
  visibility: 'public' | 'member' | 'selected' | 'owner'
  published: boolean
  featured: boolean
  tags: string[]
  metadata: Record<string, unknown>
  cover_media_id: string | null
  published_at: string | null
  updated_at: string
  created_at: string
}

export type MediaAsset = {
  id: string
  storage_path: string
  file_name: string
  mime_type: string | null
  title: string | null
  alt_text: string | null
  caption: string | null
  visibility: 'public' | 'member' | 'selected' | 'owner'
  url: string
}

const CONTENT_SELECT = 'id,slug,title,summary,body_markdown,content_type,visibility,published,featured,tags,metadata,cover_media_id,published_at,updated_at,created_at'

export async function getNavigation(): Promise<NavItem[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('navigation_items')
    .select('id,label,href,audience,sort_order')
    .eq('enabled', true)
    .order('sort_order')
  if (error) return []
  return (data ?? []) as NavItem[]
}

export async function getSettings(keys?: string[]) {
  const supabase = await createClient()
  let query = supabase.from('site_settings').select('key,value')
  if (keys?.length) query = query.in('key', keys)
  const { data, error } = await query
  if (error) return {} as Record<string, unknown>
  return Object.fromEntries((data ?? []).map((row) => [row.key, row.value])) as Record<string, unknown>
}

export async function getPageBySlug(slug: string): Promise<CmsPage | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('pages')
    .select('id,slug,title,nav_label,summary,template,collection_type,visibility,published,sort_order,show_in_nav')
    .eq('slug', slug)
    .maybeSingle()
  if (error) return null
  return data as CmsPage | null
}

export async function getPageBlocks(
  pageId: string,
  options: { includeDrafts?: boolean } = {},
): Promise<PageBlock[]> {
  const supabase = await createClient()
  let query = supabase
    .from('page_blocks')
    .select('id,page_id,block_key,kind,label,title,body_markdown,data,visibility,published,sort_order')
    .eq('page_id', pageId)
  if (!options.includeDrafts) query = query.eq('published', true)
  const { data, error } = await query.order('sort_order')
  if (error) return []
  return (data ?? []) as PageBlock[]
}

export async function getCollectionItems(
  contentType: string,
  options: { includeDrafts?: boolean } = {},
): Promise<ContentItem[]> {
  const supabase = await createClient()
  let query = supabase
    .from('content_items')
    .select(CONTENT_SELECT)
    .eq('content_type', contentType)
  if (!options.includeDrafts) query = query.eq('published', true)
  const { data, error } = await query
    .order('featured', { ascending: false })
    .order('sort_order')
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
  if (error) return []
  return (data ?? []) as ContentItem[]
}

export async function getContentItem(
  contentType: string,
  slug: string,
  options: { includeDrafts?: boolean } = {},
): Promise<ContentItem | null> {
  const supabase = await createClient()
  let query = supabase
    .from('content_items')
    .select(CONTENT_SELECT)
    .eq('content_type', contentType)
    .eq('slug', slug)
  if (!options.includeDrafts) query = query.eq('published', true)
  const { data, error } = await query.maybeSingle()
  if (error) return null
  return data as ContentItem | null
}

export async function getPagesBySlugs(slugs: string[]): Promise<CmsPage[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('pages')
    .select('id,slug,title,nav_label,summary,template,collection_type,visibility,published,sort_order,show_in_nav')
    .in('slug', slugs)
    .order('sort_order')
  if (error) return []
  return (data ?? []) as CmsPage[]
}

export async function getMediaAsset(id: string | null | undefined, expiresIn = 60 * 60): Promise<MediaAsset | null> {
  if (!id) return null
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('media_assets')
    .select('id,storage_path,file_name,mime_type,title,alt_text,caption,visibility')
    .eq('id', id)
    .maybeSingle()
  if (error || !data) return null

  const signed = await supabase.storage.from('site-media').createSignedUrl(data.storage_path, expiresIn)
  if (signed.error || !signed.data?.signedUrl) return null
  return { ...data, url: signed.data.signedUrl } as MediaAsset
}

export async function getMediaAssets(ids: Array<string | null | undefined>, expiresIn = 60 * 60) {
  const uniqueIds = [...new Set(ids.filter((id): id is string => Boolean(id)))]
  if (!uniqueIds.length) return new Map<string, MediaAsset>()

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('media_assets')
    .select('id,storage_path,file_name,mime_type,title,alt_text,caption,visibility')
    .in('id', uniqueIds)
  if (error || !data?.length) return new Map<string, MediaAsset>()

  const signed = await supabase.storage.from('site-media').createSignedUrls(data.map((item) => item.storage_path), expiresIn)
  if (signed.error) return new Map<string, MediaAsset>()

  const result = new Map<string, MediaAsset>()
  data.forEach((item, index) => {
    const url = signed.data?.[index]?.signedUrl
    if (url) result.set(item.id, { ...item, url } as MediaAsset)
  })
  return result
}

export function settingText(settings: Record<string, unknown>, key: string, fallback: string) {
  const value = settings[key]
  return typeof value === 'string' ? value : fallback
}
