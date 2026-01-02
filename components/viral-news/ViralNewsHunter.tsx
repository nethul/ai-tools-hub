'use client';

import React, { useState } from 'react';
import { NewsArticle, FetchState } from '@/types/viral-news';
import NewsCard from './NewsCard';

const ViralNewsHunter: React.FC = () => {
    const [niche, setNiche] = useState('');
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [status, setStatus] = useState<FetchState>(FetchState.IDLE);
    const [errorMsg, setErrorMsg] = useState<string>("");

    const handleFetchNews = async () => {
        if (!niche.trim()) {
            setErrorMsg("Please enter a niche to search for.");
            setStatus(FetchState.ERROR);
            return;
        }

        setStatus(FetchState.LOADING);
        setErrorMsg("");

        try {
            const res = await fetch('/api/viral-news', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ niche: niche.trim() }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to fetch news');
            }

            const data = await res.json();
            setNews(data.articles);
            setStatus(FetchState.SUCCESS);
        } catch (e: any) {
            console.error(e);
            setStatus(FetchState.ERROR);
            setErrorMsg(e.message || "Failed to fetch news. Try again later.");
        }
    };

    const handleUpdateArticle = (updated: NewsArticle) => {
        setNews(prev => prev.map(item => item.id === updated.id ? updated : item));
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && status !== FetchState.LOADING) {
            handleFetchNews();
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Niche Input Section */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <div className="relative w-full max-w-md">
                    <input
                        type="text"
                        value={niche}
                        onChange={(e) => setNiche(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter your niche (e.g., AI, Crypto, Gaming...)"
                        className="w-full px-6 py-4 bg-slate-800/50 border border-slate-600 rounded-full text-white placeholder-slate-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                    </div>
                </div>

                <button
                    onClick={handleFetchNews}
                    disabled={status === FetchState.LOADING}
                    className="relative group px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full font-bold text-white shadow-[0_0_20px_rgba(236,72,153,0.5)] transition-all hover:shadow-[0_0_40px_rgba(236,72,153,0.7)] hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden whitespace-nowrap"
                >
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                    <span className="relative flex items-center gap-3">
                        {status === FetchState.LOADING ? 'Scanning the Web...' : 'Scan for Viral News'}
                        {status !== FetchState.LOADING && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        )}
                    </span>
                </button>
            </div>

            {/* Error Message */}
            {status === FetchState.ERROR && (
                <div className="max-w-md mx-auto mb-10 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200 text-center">
                    <p>{errorMsg}</p>
                    <button onClick={handleFetchNews} className="mt-2 text-sm underline hover:text-white">Try Again</button>
                </div>
            )}

            {/* Loading Skeleton */}
            {status === FetchState.LOADING && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 rounded-xl bg-slate-800/50 border border-slate-700 animate-pulse p-6">
                            <div className="h-4 bg-slate-700 rounded w-1/4 mb-4"></div>
                            <div className="h-8 bg-slate-700 rounded w-3/4 mb-4"></div>
                            <div className="h-20 bg-slate-700 rounded w-full mb-4"></div>
                            <div className="h-10 bg-slate-700 rounded w-full mt-auto"></div>
                        </div>
                    ))}
                </div>
            )}

            {/* News Grid */}
            {status === FetchState.SUCCESS && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {news.map((article) => (
                        <NewsCard
                            key={article.id}
                            article={article}
                            onUpdate={handleUpdateArticle}
                        />
                    ))}
                </div>
            )}

            {/* Empty State */}
            {status === FetchState.IDLE && (
                <div className="flex flex-col items-center justify-center opacity-30 mt-10">
                    <svg className="w-24 h-24 text-slate-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                    <p className="text-slate-400">Enter a niche and scan for viral news.</p>
                </div>
            )}

            {/* Attribution */}
            <div className="mt-16 text-center text-slate-500 text-xs">
                <p>Uses Gemini 2.5 Flash with Google Search Grounding</p>
            </div>
        </div>
    );
};

export default ViralNewsHunter;
