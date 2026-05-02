'use client';
import React, { useState } from 'react';

export default function YouTubeTitlePage() {
    const [topic, setTopic] = useState('');
    const [tone, setTone] = useState('Viral & Catchy');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        if (!topic.trim()) return;
        setLoading(true);
        setResult('');
        try {
            const response = await fetch('/api/youtube-title', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, tone }),
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
            setResult("Failed to generate titles.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-950 text-slate-200 py-24 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 mb-6">
                        AI YouTube Title Generator
                    </h1>
                    <p className="text-slate-400 text-lg">Generate 5 highly clickable, viral YouTube titles instantly to boost your views.</p>
                </div>
                
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Video Topic or Idea</label>
                        <textarea
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g., How to build a modern React app in 10 minutes..."
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 focus:ring-2 focus:ring-red-500 outline-none text-slate-200"
                            rows={3}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Tone</label>
                        <select
                            value={tone}
                            onChange={(e) => setTone(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 focus:ring-2 focus:ring-red-500 outline-none text-slate-200"
                        >
                            <option value="Viral & Catchy">Viral & Catchy</option>
                            <option value="Educational & Clear">Educational & Clear</option>
                            <option value="Clickbait & Shocking">Clickbait & Shocking</option>
                            <option value="Vlog & Personal">Vlog & Personal</option>
                        </select>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={!topic || loading}
                        className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold py-4 rounded-xl disabled:opacity-50"
                    >
                        {loading ? 'Generating...' : 'Generate Titles'}
                    </button>
                    
                    {result && (
                        <div className="mt-8 p-6 bg-slate-950 border border-slate-800 rounded-xl whitespace-pre-wrap text-lg leading-loose">
                            {result}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
