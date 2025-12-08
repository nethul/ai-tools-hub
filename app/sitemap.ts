import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aitoolverse.app';

    // Static routes
    const routes = [
        '',
        '/about',
        '/contact',
        '/blog',
        '/tools/movie-match',
        '/tools/geo-vision',
        '/tools/chat-with-your-docs',
        '/tools/humanizer',
        '/tools/text-summarizer',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    return routes;
}
