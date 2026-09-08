'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireOwner } from '@/lib/access'

export async function approveMember(formData: FormData) { await requireOwner(); const id=String(formData.get('id')); const supabase=await createClient(); await supabase.from('profiles').update({approved:true}).eq('id',id); revalidatePath('/admin') }
export async function blockMember(formData: FormData) { await requireOwner(); const id=String(formData.get('id')); const supabase=await createClient(); await supabase.from('profiles').update({approved:false}).eq('id',id); revalidatePath('/admin') }
export async function saveContent(formData: FormData) { const { claims }=await requireOwner(); const supabase=await createClient(); const visibility=String(formData.get('visibility')); if(!['public','member','selected','owner'].includes(visibility)) throw new Error('INVALID_VISIBILITY'); const slug=String(formData.get('slug')).trim(); await supabase.from('content_items').insert({slug,title:String(formData.get('title')).trim(),summary:String(formData.get('summary')||''),body_markdown:String(formData.get('body')||''),visibility,published:formData.get('published')==='on',created_by:claims!.sub}); revalidatePath('/admin'); revalidatePath('/private') }
