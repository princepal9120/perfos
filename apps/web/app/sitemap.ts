import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://perfos.adkit.so';

  const routes = [
    '',
    '/pricing',
    '/compare',
    '/features/ad-library',
    '/features/ai-ads-generator',
    '/features/ads-cloner',
    '/features/ads-mcp',
    '/features/ads-mcp/meta',
    '/features/ads-mcp/google',
    '/features/ads-mcp/tiktok',
    '/features/ads-mcp/linkedin',
    '/features/ads-mcp/reddit',
    '/features/ads-mcp/x',
    '/features/ads-mcp/microsoft',
    '/features/ads-cli',
    '/features/ads-cli/meta',
    '/features/ads-cli/google',
    '/features/ads-cli/tiktok',
    '/features/ads-cli/linkedin',
    '/features/ads-cli/reddit',
    '/features/ads-cli/x',
    '/features/ads-cli/microsoft',
    '/integrations',
    '/integrations/claude',
    '/integrations/cursor',
    '/integrations/chatgpt',
    '/integrations/grok',
    '/integrations/codex',
    '/integrations/openclaw',
    '/integrations/perplexity',
    '/integrations/hermes',
    '/integrations/claude/meta-ads',
    '/integrations/claude/google-ads',
    '/integrations/claude/linkedin-ads',
    '/integrations/chatgpt/meta-ads',
    '/integrations/chatgpt/google-ads',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority:
      route === ''
        ? 1.0
        : route.startsWith('/features') || route === '/pricing'
          ? 0.8
          : 0.6,
  }));
}
