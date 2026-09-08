import { createClient } from '@supabase/supabase-js'

const SITE = 'https://aiowuka.me'

function sectionFor(contentType: string) {
  if (contentType === 'project') return 'projects'
  if (contentType === 'photo') return 'photos'
  if (contentType === 'music') return 'music'
  if (contentType === 'research') return 'research'
  return 'notes'
}

function xml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  )

  const { data } = await supabase
    .from('content_items')
    .select('slug,title,summary,content_type,tags,published_at,created_at,updated_at')
    .eq('published', true)
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(50)

  const items = (data ?? []).map((item) => {
    const url = `${SITE}/${sectionFor(item.content_type)}/${item.slug}`
    const published = item.published_at || item.created_at
    const categories = (item.tags ?? []).map((tag: string) => `<category>${xml(tag)}</category>`).join('')
    return `<item>
<title>${xml(item.title)}</title>
<link>${url}</link>
<guid isPermaLink="true">${url}</guid>
<description>${xml(item.summary || '')}</description>
<pubDate>${new Date(published).toUTCString()}</pubDate>
${categories}
</item>`
  }).join('\n')

  const body = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
<title>AIowuka</title>
<link>${SITE}</link>
<description>Research, projects, notes and ongoing life.</description>
<language>zh-CN</language>
<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
</channel>
</rss>`

  return new Response(body, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=900, stale-while-revalidate=3600',
    },
  })
}
