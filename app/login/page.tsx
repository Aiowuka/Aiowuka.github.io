import { redirect } from 'next/navigation'
import { currentProfile } from '@/lib/access'
import LoginForm from './login-form'

export const dynamic = 'force-dynamic'

export default async function LoginPage() {
  const { profile } = await currentProfile()
  if (profile) redirect('/private')

  return <main className="auth-shell">
    <a href="/">← AIowuka</a>
    <LoginForm />
  </main>
}
