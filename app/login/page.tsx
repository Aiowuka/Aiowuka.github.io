import { sendEmailOtp, verifyEmailOtp } from './actions'

const errorCopy: Record<string, string> = {
  'invalid-email': '邮箱地址无效。',
  'rate-limit': '发送太频繁，请稍后再试。',
  'send-failed': '邮件发送失败，请稍后再试。',
  'invalid-code': '验证码无效或已过期。',
  'expired-flow': '本次登录已过期，请重新发送验证码。',
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string }> }) {
  const params = await searchParams
  const error = params.error ? errorCopy[params.error] : null

  return <main className="auth-shell">
    <a href="/">← AIowuka</a>
    <div className="panel" style={{marginTop:24}}>
      <h1 style={{fontSize:48}}>Sign in</h1>
      <p className="muted">使用邮箱 6 位验证码登录。登录后仍需由站点所有者批准，才能查看 MEMBER 内容。</p>
      {error && <p>{error}</p>}
      {params.sent ? <>
        <p>验证码已发送。请输入邮件中的 6 位数字。</p>
        <form action={verifyEmailOtp}>
          <div className="field">
            <label htmlFor="token">Verification code</label>
            <input id="token" name="token" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required />
          </div>
          <button className="button primary" type="submit">验证并登录</button>
        </form>
        <p className="muted" style={{marginTop:16}}><a href="/login">重新发送</a></p>
      </> : <form action={sendEmailOtp}>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <button className="button primary" type="submit">发送 6 位验证码</button>
      </form>}
    </div>
  </main>
}
