import React from 'react';
import SummarizerInterface from '../../../components/text-summarizer/SummarizerInterface';

export default function TextSummarizerPage() {
    return (
        <main className="min-h-screen bg-slate-950 text-slate-200 py-24 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <a href="/#tools" className="inline-flex items-center text-slate-400 hover:text-violet-400 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                        Back to Tools
                    </a>
                </div>
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400 mb-6">
                        AI Text Summarizer
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Transform long articles, documents, and text into concise, easy-to-read summaries instantly.
                    </p>
                </div>

                <SummarizerInterface />
            </div>
        </main>
    );
}
