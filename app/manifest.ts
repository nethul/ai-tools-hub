import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'AI Tools Hub',
        short_name: 'AI Tools',
        description: 'Curated AI-Powered Tools Collection',
        start_url: '/',
        display: 'standalone',
        background_color: '#0f172a',
        theme_color: '#8b5cf6',
        icons: [
            {
                src: '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
        ],
    };
}
