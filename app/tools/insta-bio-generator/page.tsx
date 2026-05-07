'use client';
import React, { useState } from 'react';

export default function InstaBioPage() {
    const [details, setDetails] = useState('');
    const [tone, setTone] = useState('Aesthetic & Minimalist');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        if (!details.trim()) return;
        setLoading(true);
        setResult('');
        try {
            const response = await fetch('/api/insta-bio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ details, tone }),
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
            setResult("Failed to generate bios.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-950 text-slate-200 py-24 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-amber-500 mb-6">
                        AI Instagram Bio Generator
                    </h1>
                    <p className="text-slate-400 text-lg">Generate 3 engaging, highly optimized Instagram bios to make your profile stand out.</p>
                </div>
                
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">About You / Your Brand</label>
                        <textarea
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            placeholder="e.g., I'm a Perth wedding photographer who loves coffee, dogs, and chasing golden hour..."
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 focus:ring-2 focus:ring-pink-500 outline-none text-slate-200"
                            rows={3}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Tone & Vibe</label>
                        <select
                            value={tone}
                            onChange={(e) => setTone(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 focus:ring-2 focus:ring-pink-500 outline-none text-slate-200"
                        >
                            <option value="Aesthetic & Minimalist">Aesthetic & Minimalist</option>
                            <option value="Professional & Clean">Professional & Clean</option>
                            <option value="Funny & Quirky">Funny & Quirky</option>
                            <option value="Influencer & Bold">Influencer & Bold</option>
                        </select>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={!details || loading}
                        className="w-full bg-gradient-to-r from-pink-600 to-amber-500 hover:from-pink-500 hover:to-amber-400 text-white font-bold py-4 rounded-xl disabled:opacity-50"
                    >
                        {loading ? 'Generating...' : 'Generate Bios'}
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
