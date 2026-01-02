import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Viral News Hunter - AI-Powered Trending News Discovery | AI Tools Hub',
    description: 'Discover viral, trending news from any niche using AI. Find breaking stories and enhance them for social media with AI-generated images and optimized copy.',
    keywords: ['viral news', 'trending news', 'AI news', 'social media', 'content creation', 'news finder'],
};

export default function ViralNewsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
