import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/command-center',
          '/settings',
          '/loop',
          '/measurement',
          '/creative',
          '/discovery',
          '/experiments',
          '/accounts',
          '/recommendations',
          '/connected-apps',
          '/mcp',
        ],
      },
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'ClaudeBot',
          'Anthropic-AI',
          'PerplexityBot',
        ],
        allow: '/',
      },
    ],
    sitemap: 'https://perfos.adkit.so/sitemap.xml',
  };
}
