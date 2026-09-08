'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

async function authBaseUrl() {
  const requestHeaders = await headers()
  const origin = requestHeaders.get('origin')
  if (origin) return origin.replace(/\/$/, '')

  const forwardedHost = requestHeaders.get('x-forwarded-host') || requestHeaders.get('host')
  const forwardedProto = requestHeaders.get('x-forwarded-proto') || 'https'
  if (forwardedHost) return `${forwardedProto}://${forwardedHost}`

  if (process.env.VERCEL_ENV === 'production') {
    return process.env.NEXT_PUBLIC_SITE_URL || 'https://aiowuka.me'
  }

  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
}

export async function sendMagicLink(formData: FormData) {
  const email = String(formData.get('email') || '').trim().toLowerCase()
  if (!email || !email.includes('@')) redirect('/login?error=invalid-email')

  const supabase = await createClient()
  const baseUrl = await authBaseUrl()
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${baseUrl}/auth/callback` },
  })

  if (error) redirect('/login?error=send-failed')
  redirect('/login?sent=1')
}
