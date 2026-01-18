import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://g-pilot.app';
  const routes = [
    '',
    '/platform',
    '/platform/infrastructure',
    '/platform/security',
    '/solutions',
    '/solutions/marketing',
    '/solutions/agents',
    '/solutions/workflows',
    '/abilities',
    '/pricing',
    '/onboarding',
    '/privacy',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: route === '' ? 1 : 0.8,
  }));
}
