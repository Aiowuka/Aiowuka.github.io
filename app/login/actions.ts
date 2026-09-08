'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function isRateLimitError(error: { status?: number; code?: string; message?: string }) {
  return error.status === 429 || error.code === 'over_email_send_rate_limit' || /rate limit/i.test(error.message || '')
}

function normalizeEmail(formData: FormData) {
  return String(formData.get('email') || '').trim().toLowerCase()
}

export async function sendEmailOtp(formData: FormData) {
  const email = normalizeEmail(formData)
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

  redirect('/login?sent=1')
}

export async function verifyEmailOtp(formData: FormData) {
  const email = normalizeEmail(formData)
  const token = String(formData.get('token') || '').trim()

  if (!email || !email.includes('@')) redirect('/login?error=invalid-email')
  if (!/^\d{6,8}$/.test(token)) redirect('/login?error=invalid-code')

  const supabase = await createClient()
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  })

  if (error) redirect('/login?error=invalid-code')
  redirect('/private')
}
