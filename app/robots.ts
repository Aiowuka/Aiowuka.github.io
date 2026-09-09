import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/login', '/private', '/studio', '/auth'],
    },
    sitemap: 'https://aiowuka.me/sitemap.xml',
    host: 'https://aiowuka.me',
  }
}
