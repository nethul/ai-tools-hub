'use client';

import React, { useState } from 'react';
import { generateCaptions } from '../../app/actions/captionGeneratorActions';

const platforms = ['Instagram', 'Twitter / X', 'LinkedIn', 'TikTok', 'Facebook'];
const tones = ['Professional', 'Funny', 'Inspirational', 'Casual', 'Sarcastic', 'Energetic'];

const CaptionGeneratorInterface = () => {
    const [topic, setTopic] = useState('');
    const [platform, setPlatform] = useState(platforms[0]);
    const [tone, setTone] = useState(tones[0]);
    const [output, setOutput] = useState<string[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    const handleGenerate = async () => {
        if (!topic.trim()) return;

        setIsProcessing(true);
        try {
            const result = await generateCaptions(topic, platform, tone);
            setOutput(result);
        } catch (error) {
            console.error("Failed to generate captions:", error);
            alert("Failed to generate captions. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCopy = async (text: string) => {
        if (!text) return;
        try {
            await navigator.clipboard.writeText(text);
            // We could track individual copied states if we wanted, 
            // but for simplicity let's just use a transient unified state or local state in a sub-component.
            // Actually, let's just make a small sub-component for the card or manage it here.
            // For simplicity, I'll just trigger the main "Copied" state for now, 
            // but ideally we should have per-card state.
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-6">

                {/* Input Section */}
                <div className="w-full md:w-1/3 flex flex-col gap-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                        <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                                </svg>
                            </span>
                            Settings
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Platform</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {platforms.map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => setPlatform(p)}
                                            className={`text-sm px-3 py-2 rounded-lg border transition-all truncate ${platform === p
                                                ? 'bg-pink-500/20 border-pink-500 text-pink-300'
                                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Tone</label>
                                <select
                                    value={tone}
                                    onChange={(e) => setTone(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-pink-500/50"
                                >
                                    {tones.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex-1 flex flex-col">
                        <div className="border-b border-slate-800 p-4 bg-slate-950/50">
                            <h3 className="font-semibold text-slate-200">Content Topic</h3>
                        </div>
                        <textarea
                            className="flex-1 w-full bg-transparent p-4 text-slate-200 resize-none outline-none placeholder-slate-600 min-h-[150px]"
                            placeholder="What is your post about? e.g., 'A photo of my new puppy sleeping'"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                        />
                        <div className="p-4 bg-slate-950/50 border-t border-slate-800">
                            <button
                                onClick={handleGenerate}
                                disabled={isProcessing || !topic}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isProcessing ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                                        </svg>
                                        Generate Captions
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Output Section */}
                <div className="flex-1 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl min-h-[500px]">
                    <div className="border-b border-slate-800 p-4 flex justify-between items-center bg-slate-950/50">
                        <h3 className="font-semibold text-slate-200">Generated Captions</h3>
                        <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">
                            {output.length > 0 ? `${output.length} options` : 'Ready'}
                        </span>
                    </div>
                    <div className="flex-1 w-full bg-slate-900/50 p-6 overflow-y-auto">
                        {output.length > 0 ? (
                            <div className="flex flex-col gap-4">
                                {output.map((caption, index) => (
                                    <CaptionCard
                                        key={index}
                                        text={caption}
                                        index={index}
                                        onCopy={() => handleCopy(caption)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-4">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 opacity-20">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9 7.5h8.15c.27 0 .54-.057.78-.166a2.25 2.25 0 0 1 2.592.569l1.418 1.418c.264.265.626.398 1.001.369a2.25 2.25 0 0 0 2.064-2.239V9a2.25 2.25 0 0 0-2.25-2.25H3.75A2.25 2.25 0 0 0 1.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Z" />
                                </svg>
                                <p className="italic">Captions will appear here...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const CaptionCard = ({ text, index, onCopy }: { text: string, index: number, onCopy: () => void }) => {
    const [copied, setCopied] = useState(false);

    const handleCopyLocal = () => {
        onCopy();
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors group">
            <div className="flex justify-between items-start gap-4 mb-2">
                <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">Option {index + 1}</span>
                <button
                    onClick={handleCopyLocal}
                    className="text-slate-400 hover:text-white transition-colors"
                    title="Copy this option"
                >
                    {copied ? (
                        <div className="flex items-center gap-1 text-green-400">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                        </div>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                        </svg>
                    )}
                </button>
            </div>
            <div className="text-slate-200 whitespace-pre-wrap leading-relaxed">
                {text}
            </div>
        </div>
    );
}

export default CaptionGeneratorInterface;
