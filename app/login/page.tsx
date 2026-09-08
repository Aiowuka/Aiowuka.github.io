import { sendEmailOtp, verifyEmailOtp } from './actions'

const errorCopy: Record<string, string> = {
  'invalid-email': '邮箱地址无效。',
  'rate-limit': '发送太频繁，请稍后再试。',
  'send-failed': '邮件发送失败，请稍后再试。',
  'invalid-code': '验证码无效或已过期。',
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string }> }) {
  const params = await searchParams
  const error = params.error ? errorCopy[params.error] : null

  return <main className="auth-shell">
    <a href="/">← AIowuka</a>
    <div className="panel" style={{marginTop:24}}>
      <h1 style={{fontSize:48}}>Sign in</h1>
      <p className="muted">使用邮箱验证码登录。验证码长度以邮件中的实际内容为准。</p>
      {error && <p>{error}</p>}
      {params.sent && <p>验证码已发送，请检查邮箱。</p>}

      <form action={sendEmailOtp}>
        <div className="field">
          <label htmlFor="send-email">Email</label>
          <input id="send-email" name="email" type="email" required autoComplete="email" />
        </div>
        <button className="button primary" type="submit">发送验证码</button>
      </form>

      <hr style={{margin:'28px 0'}} />

      <form action={verifyEmailOtp}>
        <div className="field">
          <label htmlFor="verify-email">Email</label>
          <input id="verify-email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="field">
          <label htmlFor="token">Verification code</label>
          <input id="token" name="token" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6,8}" minLength={6} maxLength={8} required />
        </div>
        <button className="button primary" type="submit">验证并登录</button>
      </form>
    </div>
  </main>
}
