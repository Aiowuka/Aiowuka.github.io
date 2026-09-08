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
  metadata: Record<string, unknown>
  cover_media_id: string | null
  updated_at: string
  created_at: string
}

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

export async function getPageBlocks(pageId: string): Promise<PageBlock[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('page_blocks')
    .select('id,page_id,block_key,kind,label,title,body_markdown,data,visibility,published,sort_order')
    .eq('page_id', pageId)
    .eq('published', true)
    .order('sort_order')
  if (error) return []
  return (data ?? []) as PageBlock[]
}

export async function getCollectionItems(contentType: string): Promise<ContentItem[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('content_items')
    .select('id,slug,title,summary,body_markdown,content_type,visibility,published,featured,metadata,cover_media_id,updated_at,created_at')
    .eq('content_type', contentType)
    .eq('published', true)
    .order('featured', { ascending: false })
    .order('sort_order')
    .order('created_at', { ascending: false })
  if (error) return []
  return (data ?? []) as ContentItem[]
}

export async function getContentItem(contentType: string, slug: string): Promise<ContentItem | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('content_items')
    .select('id,slug,title,summary,body_markdown,content_type,visibility,published,featured,metadata,cover_media_id,updated_at,created_at')
    .eq('content_type', contentType)
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()
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

export function settingText(settings: Record<string, unknown>, key: string, fallback: string) {
  const value = settings[key]
  return typeof value === 'string' ? value : fallback
}
