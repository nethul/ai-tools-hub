'use client';
import React, { useState } from 'react';

export default function SEOMetaPage() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tone, setTone] = useState('Professional & Persuasive');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        if (!title.trim()) return;
        setLoading(true);
        setResult('');
        try {
            const response = await fetch('/api/seo-meta', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content, tone }),
            });
            if (!response.body) throw new Error('No response body');
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                setResult((prev) => prev + decoder.decode(value, { stream: true }));
            }
        } catch (error) {
            console.error(error);
            setResult("Failed to generate meta descriptions.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-950 text-slate-200 py-24 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-500 mb-6">
                        AI SEO Meta Description Generator
                    </h1>
                    <p className="text-slate-400 text-lg">Generate 3 high-CTR, perfectly optimized meta descriptions to boost your Google rankings.</p>
                </div>
                
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Page Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Best Wedding Photographer in Perth"
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none text-slate-200"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Short Description / Key Points (Optional)</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Briefly describe what the page is about..."
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none text-slate-200"
                            rows={3}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Tone & Strategy</label>
                        <select
                            value={tone}
                            onChange={(e) => setTone(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none text-slate-200"
                        >
                            <option value="Professional & Persuasive">Professional & Persuasive</option>
                            <option value="Urgent & Action-Oriented">Urgent & Action-Oriented</option>
                            <option value="Informational & Helpful">Informational & Helpful</option>
                            <option value="Click-Driven & Catchy">Click-Driven & Catchy</option>
                        </select>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={!title || loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white font-bold py-4 rounded-xl disabled:opacity-50 transition-all"
                    >
                        {loading ? 'Analyzing Content...' : 'Generate SEO Meta Descriptions'}
                    </button>
                    
                    {result && (
                        <div className="mt-8">
                            <h2 className="text-slate-400 text-sm font-medium mb-4 uppercase tracking-widest">Generated Recommendations:</h2>
                            <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl whitespace-pre-wrap text-lg leading-loose border-l-4 border-l-blue-500">
                                {result}
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-12 text-slate-500 text-sm italic text-center">
                    Note: Our AI follows the latest 2026 Google guidelines, keeping descriptions between 150-160 characters for maximum visibility.
                </div>
            </div>
        </main>
    );
}
