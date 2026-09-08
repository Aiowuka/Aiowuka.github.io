'use client'

import Link from 'next/link'
import { useEffect } from 'react'

const known: Record<string, string> = {
  INVALID_SLUG: 'Slug 只能使用小写英文、数字和连字符。',
  INVALID_TAGS: 'Tags 数量或长度超出限制。最多 16 个，每个不超过 48 个字符。',
  COVER_NOT_FOUND: '找不到这张封面图。它可能已经被删除。',
  COVER_MUST_BE_IMAGE: '封面必须是图片文件。',
  COVER_VISIBILITY_TOO_PRIVATE: '封面图片的权限比文章更严格。请换一张图片，或先调整图片可见范围。',
  PUBLIC_COVER_ALT_REQUIRED: '公开文章的封面需要填写 Alt text。',
  PUBLIC_IMAGE_ALT_REQUIRED: '公开图片需要填写 Alt text。',
  HOMEPAGE_HERO_MUST_STAY_PUBLIC: '首页 Hero 正在使用这张图片，所以它必须保持 PUBLIC。',
  HOMEPAGE_HERO_ALT_REQUIRED: '首页 Hero 图片必须保留 Alt text。',
  MEDIA_VISIBILITY_BREAKS_CONTENT_COVER: '这张图片正在被权限更公开的文章作为封面使用，不能把图片改得更私密。',
  STORAGE_OBJECT_NOT_FOUND: 'Storage 中没有找到这个文件，请重新上传。',
  INVALID_MEDIA_TYPE: '不支持这种文件类型。',
  INVALID_FILE_SIZE: '文件大小不符合限制。',
}

function friendly(error: Error & { digest?: string }) {
  const key = Object.keys(known).find((code) => error.message?.includes(code))
  return key ? known[key] : '这次修改没有完成。数据不会因为这个错误被自动放宽权限；可以返回对应页面检查输入后再试。'
}

export default function StudioError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])

  return (
    <section className="studio-error-panel">
      <p className="micro-label">STUDIO / ERROR</p>
      <h1>没有保存成功。</h1>
      <p>{friendly(error)}</p>
      <div className="studio-error-actions">
        <button onClick={reset} type="button">Try again</button>
        <Link href="/studio">Back to Studio</Link>
      </div>
      {error.digest ? <small>Reference: {error.digest}</small> : null}
    </section>
  )
}
