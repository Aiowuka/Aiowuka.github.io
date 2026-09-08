import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { currentProfile } from '@/lib/access'
import LoginForm from './login-form'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Login',
  robots: { index: false, follow: false, noarchive: true, nocache: true },
}

export default async function LoginPage() {
  const { profile } = await currentProfile()
  if (profile) redirect('/private')

  return (
    <main className="login-page">
      <section className="login-side">
        <Link className="portal-wordmark" href="/">Aiowuka</Link>
        <div>
          <p className="portal-handnote">敲敲门。</p>
          <p>这里不是注册就能自动进入的会员站。邮箱验证码只用来确认“你是谁”，真正能看到什么仍由我单独授权。</p>
        </div>
        <Link href="/">← 回到公开主页</Link>
      </section>
      <section className="login-main">
        <LoginForm />
      </section>
    </main>
  )
}
