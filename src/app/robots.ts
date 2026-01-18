import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dashboard/private/'], // Example exclusions
    },
    sitemap: 'https://g-pilot.app/sitemap.xml',
  };
}
