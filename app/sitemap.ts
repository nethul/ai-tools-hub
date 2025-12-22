import { MetadataRoute } from 'next';
import { client } from '@/sanity/lib/client';
import { groq } from 'next-sanity';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://aitoolverse.app').replace(/\/$/, '');

    // Fetch all blog posts
    const posts = await client.fetch(groq`*[_type == "post" && defined(slug.current)] {
        "slug": slug.current,
        publishedAt
    }`);

    const blogRoutes = posts.map((post: any) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.publishedAt),
        changeFrequency: 'daily' as const,
        priority: 0.7,
    }));

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
        '/tools/fact-checker',
        '/tools/mock-data',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    return [...routes, ...blogRoutes];
}
