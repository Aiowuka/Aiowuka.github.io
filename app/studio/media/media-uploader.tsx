'use client'

import { FormEvent, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { registerUploadedMedia } from './actions'

const MAX_BYTES = 20 * 1024 * 1024

export default function MediaUploader() {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setMessage('')

    const form = event.currentTarget
    const formData = new FormData(form)
    const file = formData.get('file')
    if (!(file instanceof File) || !file.size) {
      setBusy(false)
      setMessage('Choose a file first.')
      return
    }
    if (file.size > MAX_BYTES) {
      setBusy(false)
      setMessage('File is larger than 20 MB.')
      return
    }

    const ext = file.name.toLowerCase().match(/\.[a-z0-9]{1,8}$/)?.[0] || ''
    const storagePath = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}${ext}`
    const supabase = createClient()

    const { error: uploadError } = await supabase.storage.from('site-media').upload(storagePath, file, {
      contentType: file.type || undefined,
      upsert: false,
    })
    if (uploadError) {
      setBusy(false)
      setMessage(uploadError.message)
      return
    }

    const payload = new FormData()
    payload.set('storage_path', storagePath)
    payload.set('file_name', file.name)
    payload.set('mime_type', file.type)
    payload.set('byte_size', String(file.size))
    payload.set('title', String(formData.get('title') || ''))
    payload.set('alt_text', String(formData.get('alt_text') || ''))
    payload.set('caption', String(formData.get('caption') || ''))
    payload.set('visibility', String(formData.get('visibility') || 'owner'))

    try {
      await registerUploadedMedia(payload)
      form.reset()
      setMessage('Uploaded.')
      window.location.reload()
    } catch (error) {
      await supabase.storage.from('site-media').remove([storagePath])
      setBusy(false)
      setMessage(error instanceof Error ? error.message : 'Could not register media.')
    }
  }

  return (
    <form onSubmit={submit} className="studio-form studio-paper">
      <label>File<input type="file" name="file" accept="image/*,audio/*" required disabled={busy} /></label>
      <div className="studio-form-grid">
        <label>Title<input name="title" disabled={busy} /></label>
        <label>Alt text<input name="alt_text" disabled={busy} /></label>
        <label>Visibility<select name="visibility" defaultValue="owner" disabled={busy}><option>public</option><option>member</option><option>selected</option><option>owner</option></select></label>
      </div>
      <label>Caption<textarea name="caption" rows={3} disabled={busy} /></label>
      <button className="studio-primary" type="submit" disabled={busy}>{busy ? 'Uploading…' : 'Upload'}</button>
      {message ? <p className="studio-upload-message">{message}</p> : null}
    </form>
  )
}
