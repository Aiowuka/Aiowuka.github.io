import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { currentProfile } from '@/lib/access'

export const dynamic = 'force-dynamic'

export default async function ContentPage({ params }: { params: Promise<{ slug:string }> }) {
  const { profile } = await currentProfile(); if (!profile) redirect('/login')
  const { slug } = await params
  const supabase = await createClient()
  const { data:item } = await supabase.from('content_items').select('title,summary,body_markdown,visibility').eq('slug',slug).eq('published',true).maybeSingle()
  if (!item) notFound()
  return <main className="auth-shell"><Link href="/private">← Private</Link><h1 style={{fontSize:58}}>{item.title}</h1><p className="muted">{item.visibility}</p>{item.summary && <p className="copy">{item.summary}</p>}<div style={{whiteSpace:'pre-wrap',lineHeight:1.8}}>{item.body_markdown}</div></main>
}
