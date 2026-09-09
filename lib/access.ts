import { createClient } from '@/lib/supabase/server'

export async function currentProfile() {
  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()
  const userId = claimsData?.claims?.sub
  if (!userId) return { claims: null, profile: null }
  const { data: profile } = await supabase.from('profiles').select('id,email,display_name,role,approved').eq('id', userId).maybeSingle()
  return { claims: claimsData.claims, profile }
}

export async function requireOwner() {
  const state = await currentProfile()
  if (!state.profile || state.profile.role !== 'owner') throw new Error('OWNER_REQUIRED')
  return state
}
