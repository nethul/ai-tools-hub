import React from 'react';
import Link from 'next/link';
import WordFinderReplacerInterface from '@/components/word-finder-replacer/WordFinderReplacerInterface';

const WordFinderReplacerPage = () => {
    return (
        <main className="min-h-screen bg-slate-950 text-slate-200">
            <div className="max-w-7xl mx-auto px-4 pt-24 mb-6">
                <Link href="/#tools" className="inline-flex items-center text-slate-400 hover:text-indigo-400 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                    Back to Tools
                </Link>
            </div>

            <div className="px-4 text-center">
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent mb-4 tracking-tight">
                    Word Finder & Replacer
                </h1>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-8">
                    Find words with live highlighting and replace them selectively.
                    All processing happens locally in your browser.
                </p>
            </div>

            <WordFinderReplacerInterface />
        </main>
    );
};

export default WordFinderReplacerPage;
