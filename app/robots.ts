import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Conversion page — reachable only after a submit, and noindex'd anyway.
      disallow: '/obrigado',
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
