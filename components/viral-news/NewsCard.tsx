'use client';

import React, { useState } from 'react';
import { NewsArticle } from '@/types/viral-news';

interface NewsCardProps {
    article: NewsArticle;
    onUpdate: (updatedArticle: NewsArticle) => void;
}

const NewsCard: React.FC<NewsCardProps> = ({ article, onUpdate }) => {
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [showEnhanced, setShowEnhanced] = useState(false);

    const handleEnhance = async () => {
        if (article.enhancedContent) {
            setShowEnhanced(true);
            return;
        }

        setIsEnhancing(true);
        try {
            const res = await fetch('/api/viral-news/enhance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ article }),
            });

            if (!res.ok) throw new Error('Failed to enhance');

            const data = await res.json();
            onUpdate(data.article);
            setShowEnhanced(true);
        } catch (e) {
            alert("Failed to enhance content. Please try again.");
        } finally {
            setIsEnhancing(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("Copied text to clipboard!");
    };

    return (
        <div className="bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700 hover:border-pink-500/50 transition-all duration-300 shadow-lg hover:shadow-pink-500/10 flex flex-col h-full">
            {/* Header / Score */}
            <div className="p-6 pb-2">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-2 flex-wrap">
                        {article.tags.map(tag => (
                            <span key={tag} className="text-[10px] font-bold uppercase tracking-wider text-pink-400 bg-pink-500/10 px-2 py-1 rounded-full">
                                #{tag}
                            </span>
                        ))}
                    </div>
                    <div className="flex flex-col items-end">
                        <span className={`text-xs font-bold px-2 py-1 rounded bg-gradient-to-r ${article.viralScore > 80 ? 'from-red-500 to-orange-500' : 'from-blue-500 to-cyan-500'}`}>
                            {article.viralScore} Viral Score
                        </span>
                    </div>
                </div>

                <h3 className="text-xl font-bold text-white leading-tight mb-2">
                    {article.headline}
                </h3>

                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                    {article.summary}
                </p>

                {/* Sources */}
                {article.sources.length > 0 && (
                    <div className="mb-4">
                        <p className="text-xs text-slate-500 mb-1">Sources (via Google Search):</p>
                        <ul className="flex flex-wrap gap-2">
                            {article.sources.map((source, idx) => (
                                <li key={idx}>
                                    <a href={source.uri} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:text-blue-300 underline truncate max-w-[150px] block">
                                        {source.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <div className="mt-auto p-6 pt-0">
                {!showEnhanced ? (
                    <button
                        onClick={handleEnhance}
                        disabled={isEnhancing}
                        className="w-full py-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 border border-slate-600 flex items-center justify-center gap-2 transition-colors text-sm font-semibold group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isEnhancing ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Generating Image & Copy...</span>
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-pink-400 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="text-slate-200">Enhance + Generate Image</span>
                            </>
                        )}
                    </button>
                ) : (
                    <div className="bg-gradient-to-br from-pink-500/20 to-rose-500/20 p-4 rounded-lg border border-pink-500/30 animate-in fade-in duration-500">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-pink-400 uppercase tracking-wider">Social-media ready Optimization</span>
                            <button
                                onClick={() => copyToClipboard(article.enhancedContent?.fbPost || "")}
                                className="text-xs text-white bg-pink-500 hover:bg-pink-600 px-2 py-1 rounded transition-colors"
                            >
                                Copy Text
                            </button>
                        </div>

                        {/* Generated Image */}
                        {article.enhancedContent?.generatedImage && (
                            <div className="mb-3 rounded-lg overflow-hidden border border-slate-600 relative group shadow-lg">
                                <img
                                    src={article.enhancedContent.generatedImage}
                                    alt="AI Generated"
                                    className="w-full h-auto object-cover max-h-48 md:max-h-64"
                                />
                                <div className="absolute top-2 right-2">
                                    <span className="bg-black/50 text-white text-[10px] px-2 py-1 rounded backdrop-blur">
                                        Gemini Art
                                    </span>
                                </div>
                            </div>
                        )}

                        <p className="text-sm text-slate-200 whitespace-pre-wrap mb-3 font-medium">
                            {article.enhancedContent?.fbPost}
                        </p>
                        <div className="space-y-2">
                            <div className="text-xs text-blue-300">
                                {article.enhancedContent?.hashtags.map(t => `#${t.replace('#', '')} `)}
                            </div>
                            <div className="text-[10px] text-slate-500">
                                SEO: {article.enhancedContent?.seoKeywords.join(', ')}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NewsCard;
