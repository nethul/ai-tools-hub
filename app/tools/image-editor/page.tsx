import React from 'react';
import Link from 'next/link';
import ImageEditorInterface from '@/components/image-editor/ImageEditorInterface';

export const metadata = {
    title: 'Image Editor - AI Tool Verse',
    description: 'Edit images with filters, adjustments, and transforms. All processing happens privately in your browser.',
};

const ImageEditorPage = () => {
    return (
        <main className="min-h-screen bg-slate-950 text-slate-200">
            <div className="max-w-7xl mx-auto px-4 pt-24 mb-6">
                <Link href="/#tools" className="inline-flex items-center text-slate-400 hover:text-amber-400 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                    Back to Tools
                </Link>
            </div>

            <div className="px-4 text-center">
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent mb-4 tracking-tight">
                    Image Editor
                </h1>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-8">
                    Apply filters, adjust properties, and transform your images.
                    Everything is processed privately in your browser.
                </p>
            </div>

            <ImageEditorInterface />
        </main>
    );
};

export default ImageEditorPage;
