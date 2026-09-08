import { sendMagicLink } from './actions'

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ sent?: string }> }) {
  const params = await searchParams
  return <main className="auth-shell"><a href="/">← AIowuka</a><div className="panel" style={{marginTop:24}}><h1 style={{fontSize:48}}>Sign in</h1><p className="muted">使用邮箱魔法链接登录。登录后仍需由站点所有者批准，才能查看 MEMBER 内容。</p>{params.sent && <p>登录链接已发送，请检查邮箱。</p>}<form action={sendMagicLink}><div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" required autoComplete="email" /></div><button className="button primary" type="submit">发送登录链接</button></form></div></main>
}
