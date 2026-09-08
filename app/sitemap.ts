import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const SITE = 'https://aiowuka.me'

function sectionFor(contentType: string) {
  if (contentType === 'project') return 'projects'
  if (contentType === 'photo') return 'photos'
  if (contentType === 'music') return 'music'
  if (contentType === 'research') return 'research'
  return 'notes'
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  )

  const [{ data: pages }, { data: content }] = await Promise.all([
    supabase.from('pages').select('slug,updated_at').eq('published', true).order('sort_order'),
    supabase.from('content_items').select('slug,content_type,updated_at,published_at').eq('published', true),
  ])

  const routes: MetadataRoute.Sitemap = [
    { url: SITE, changeFrequency: 'weekly', priority: 1 },
  ]

  for (const page of pages ?? []) {
    if (page.slug === 'home') continue
    routes.push({
      url: `${SITE}/${page.slug}`,
      lastModified: page.updated_at ? new Date(page.updated_at) : undefined,
      changeFrequency: page.slug === 'now' ? 'weekly' : 'monthly',
      priority: page.slug === 'about' ? 0.7 : 0.8,
    })
  }

  for (const item of content ?? []) {
    routes.push({
      url: `${SITE}/${sectionFor(item.content_type)}/${item.slug}`,
      lastModified: item.updated_at ? new Date(item.updated_at) : undefined,
      changeFrequency: 'monthly',
      priority: 0.7,
    })
  }

  return routes
}
