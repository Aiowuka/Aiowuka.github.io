'use client'

import { FormEvent, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

function messageFor(error: { status?: number; code?: string; message?: string } | null) {
  if (!error) return ''
  if (error.status === 429 || error.code === 'over_email_send_rate_limit' || /rate limit/i.test(error.message || '')) {
    return '发送太频繁，请稍后再试。'
  }
  return error.message || '操作失败，请稍后再试。'
}

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function sendOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')

    const normalizedEmail = email.trim().toLowerCase()
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: { shouldCreateUser: true },
    })

    setBusy(false)
    if (error) {
      setError(messageFor(error))
      return
    }

    setEmail(normalizedEmail)
    setSent(true)
  }

  async function verifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')

    const normalizedEmail = email.trim().toLowerCase()
    const normalizedToken = token.trim()
    if (!/^\d{6,8}$/.test(normalizedToken)) {
      setBusy(false)
      setError('请输入邮件中的完整验证码。')
      return
    }

    const supabase = createClient()
    const { data, error } = await supabase.auth.verifyOtp({
      email: normalizedEmail,
      token: normalizedToken,
      type: 'email',
    })

    if (error || !data.session) {
      setBusy(false)
      setError(error?.message || '验证码无效或已过期。')
      return
    }

    window.location.assign('/private')
  }

  return <div className="login-card">
    <span className="micro-label">EMAIL OTP / ACCESS</span>
    <h1>{sent ? '看看邮箱。' : '进来坐坐。'}</h1>
    <p className="muted">{sent ? `验证码已经发到 ${email}` : '输入邮箱，我会给你发一个一次性验证码。登录状态会保留，除非你主动退出。'}</p>
    {error && <p className="login-error">{error}</p>}

    {!sent ? <form onSubmit={sendOtp}>
      <div className="field">
        <label htmlFor="email">你的邮箱</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>
      <button className="button primary" type="submit" disabled={busy}>
        {busy ? '发送中…' : '发送验证码 →'}
      </button>
    </form> : <>
      <form onSubmit={verifyOtp}>
        <div className="field">
          <label htmlFor="token">邮件里的验证码</label>
          <input
            id="token"
            name="token"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6,8}"
            minLength={6}
            maxLength={8}
            required
            autoFocus
            placeholder="••••••••"
            value={token}
            onChange={(event) => setToken(event.target.value.replace(/\D/g, '').slice(0, 8))}
          />
        </div>
        <button className="button primary" type="submit" disabled={busy}>
          {busy ? '验证中…' : '验证并进入 →'}
        </button>
      </form>
      <button className="text-button login-switch" type="button" onClick={() => { setSent(false); setToken(''); setError('') }} disabled={busy}>
        换一个邮箱 / 重新发送
      </button>
    </>}
  </div>
}
