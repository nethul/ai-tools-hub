import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Social Media Caption Generator | AI Tools Hub',
    description: 'Generate viral, engaging captions and hashtags for Instagram, TikTok, LinkedIn, and Twitter using AI.',
};

export default function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
