'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { ShieldCheck, Search, Info } from 'lucide-react';
import { AppStatus, FactCheckResult } from './components/FactCheckTypes';
import { analyzeClaim } from '../../../services/fact-checker-gemini';
import { InputArea } from './components/InputArea';
import { VerdictBadge } from './components/VerdictBadge';
import { SourceCard } from './components/SourceCard';

export default function FactCheckerPage() {
    const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
    const [text, setText] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [result, setResult] = useState<FactCheckResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!text && !image) return;

        setStatus(AppStatus.ANALYZING);
        setError(null);
        setResult(null);

        try {
            const data = await analyzeClaim(text, image);
            setResult(data);
            setStatus(AppStatus.SUCCESS);
        } catch (err: any) {
            console.error(err);
            setError("Failed to verify facts. Please try again. Ensure your API key is configured.");
            setStatus(AppStatus.ERROR);
        }
    };

    const handleReset = () => {
        setStatus(AppStatus.IDLE);
        setResult(null);
        setError(null);
        setText('');
        setImage(null);
    };

    return (
        <div className="min-h-screen p-4 sm:p-6 md:p-8">
            <div className="max-w-5xl mx-auto">
                {/* Back Link */}
                <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors mb-8 group">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:-translate-x-1 transition-transform">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                    </svg>
                    <span>Back to Tools</span>
                </Link>

                {/* Header */}
                <header className="mb-12 text-center space-y-4">
                    <div className="inline-flex items-center justify-center p-3 bg-slate-800/80 rounded-2xl shadow-xl ring-1 ring-slate-700 mb-4 backdrop-blur-md">
                        <ShieldCheck className="w-8 h-8 text-violet-400 mr-3" />
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-cyan-400">
                            Fact Checker
                        </h1>
                    </div>
                    <p className="text-slate-400 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
                        Verify claims with confidence using AI and Google Search.
                    </p>
                </header>

                <main className="animate-fade-in pb-12">
                    {/* Intro - Only show when IDLE */}
                    {status === AppStatus.IDLE && (
                        <div className="text-center mb-10 space-y-3 animate-fade-in-up">
                            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-100 tracking-tight">
                                Verify claims with <span className="text-violet-400">confidence</span>.
                            </h1>
                            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                                Upload an image or paste text. We'll cross-reference millions of sources using Google Search to separate fact from fiction.
                            </p>
                        </div>
                    )}

                    {/* Form */}
                    {(status === AppStatus.IDLE || status === AppStatus.ANALYZING || status === AppStatus.ERROR) && (
                        <div className={`transition-all duration-500 ${status === AppStatus.ANALYZING ? 'opacity-50 pointer-events-none blur-[1px]' : 'opacity-100'}`}>
                            <InputArea
                                text={text}
                                setText={setText}
                                image={image}
                                setImage={setImage}
                                onSubmit={handleSubmit}
                                isLoading={status === AppStatus.ANALYZING}
                            />
                        </div>
                    )}

                    {/* Error State */}
                    {status === AppStatus.ERROR && (
                        <div className="mt-6 max-w-3xl mx-auto p-4 bg-rose-900/20 border border-rose-800 rounded-xl text-rose-400 flex items-center gap-3">
                            <Info className="w-5 h-5 flex-shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    {/* Results */}
                    {status === AppStatus.SUCCESS && result && (
                        <div className="animate-fade-in-up space-y-8">

                            {/* Verdict Header */}
                            <div className="bg-slate-800 rounded-2xl shadow-xl shadow-slate-900/50 border border-slate-700 overflow-hidden">
                                <div className="bg-slate-900/50 border-b border-slate-700 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Analysis Verdict</span>
                                    </div>
                                    <VerdictBadge verdict={result.verdict} />
                                </div>

                                <div className="p-6 md:p-8">
                                    <article className="prose prose-invert prose-lg max-w-none prose-headings:font-bold prose-h3:text-xl prose-a:text-violet-400 hover:prose-a:text-violet-300">
                                        <ReactMarkdown>{result.text}</ReactMarkdown>
                                    </article>
                                </div>
                            </div>

                            {/* Sources Section */}
                            <div>
                                <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
                                    <Search className="w-5 h-5 text-violet-500" />
                                    Verified Sources
                                </h3>

                                {result.groundingChunks && result.groundingChunks.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {result.groundingChunks.map((chunk, idx) => (
                                            <SourceCard key={idx} chunk={chunk} index={idx} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center bg-slate-800 rounded-xl border border-slate-700 border-dashed text-slate-500">
                                        <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                        <p>No direct web sources were cited in the API response, but internal knowledge was applied.</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-center pt-8">
                                <button
                                    onClick={handleReset}
                                    className="px-8 py-3 bg-slate-800 border border-slate-600 shadow-sm text-slate-200 font-medium rounded-full hover:bg-slate-700 hover:border-slate-500 transition-all"
                                >
                                    Analyze Another Claim
                                </button>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
