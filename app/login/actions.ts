'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function isRateLimitError(error: { status?: number; code?: string; message?: string }) {
  return error.status === 429 || error.code === 'over_email_send_rate_limit' || /rate limit/i.test(error.message || '')
}

export async function sendEmailOtp(formData: FormData) {
  const email = String(formData.get('email') || '').trim().toLowerCase()
  if (!email || !email.includes('@')) redirect('/login?error=invalid-email')

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  })

  if (error) {
    if (isRateLimitError(error)) redirect('/login?error=rate-limit')
    redirect('/login?error=send-failed')
  }

  const cookieStore = await cookies()
  cookieStore.set('aiowuka_login_email', email, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/login',
    maxAge: 10 * 60,
  })

  redirect('/login?sent=1')
}

export async function verifyEmailOtp(formData: FormData) {
  const token = String(formData.get('token') || '').trim()
  if (!/^\d{6}$/.test(token)) redirect('/login?sent=1&error=invalid-code')

  const cookieStore = await cookies()
  const email = cookieStore.get('aiowuka_login_email')?.value
  if (!email) redirect('/login?error=expired-flow')

  const supabase = await createClient()
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  })

  if (error) redirect('/login?sent=1&error=invalid-code')

  cookieStore.delete('aiowuka_login_email')
  redirect('/private')
}
