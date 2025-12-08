'use client';

import React, { useState } from 'react';
import { humanizeText } from '../../app/actions/humanizerActions';
import * as Diff from 'diff';

const HumanizerInterface = () => {
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showDiff, setShowDiff] = useState(true);
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = async () => {
        if (!outputText) return;
        try {
            await navigator.clipboard.writeText(outputText);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const handleHumanize = async () => {
        if (!inputText.trim()) return;

        setIsProcessing(true);
        try {
            const result = await humanizeText(inputText);
            setOutputText(result);
        } catch (error) {
            console.error("Failed to humanize text:", error);
            alert("Failed to humanize text. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    const getWordCount = (text: string) => {
        return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    };

    const renderDiff = () => {
        if (!inputText || !outputText) return <p className="text-slate-400 whitespace-pre-wrap">{outputText}</p>;

        const diff = Diff.diffWords(inputText, outputText);

        return (
            <div className="whitespace-pre-wrap leading-relaxed">
                {diff.map((part, index) => {
                    const color = part.added ? 'bg-green-500/20 text-green-300' :
                        part.removed ? 'bg-red-500/20 text-red-300 line-through decoration-red-500/50' :
                            'text-slate-300';

                    // If it's removed, we might want to hide it if we strictly want to show the NEW text with just additions highlighted.
                    // But the request asked to "highlight which words were changed", which usually implies showing what was there vs what is there.
                    // However, showing removed words inline can make the text hard to read as a final output.
                    // A common pattern is: Red background for removed, Green for added. 
                    // Let's stick to the industry standard "Green for added, Red for removed" but maybe keep removed text visible to show context.
                    // But usually, a "Humanizer" output window should show the *result*.
                    // Maybe we can have a toggle? For now, I'll show both to be explicit about changes as requested.

                    return (
                        <span key={index} className={`${color} px-0.5 rounded`}>
                            {part.value}
                        </span>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-6 h-[70vh]">

                {/* Input Section */}
                <div className="flex-1 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                    <div className="border-b border-slate-800 p-4 flex justify-between items-center bg-slate-950/50">
                        <h3 className="font-semibold text-slate-200">Input Text</h3>
                        <span className="text-xs text-slate-500 font-mono bg-slate-800 px-2 py-1 rounded-md">
                            {getWordCount(inputText)} words
                        </span>
                    </div>
                    <textarea
                        className="flex-1 w-full bg-transparent p-6 text-slate-200 resize-none outline-none placeholder-slate-700 font-sans leading-relaxed"
                        placeholder="Paste your robotic or AI-generated text here..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                    />
                </div>

                {/* Controls */}
                <div className="flex flex-col justify-center items-center gap-4">
                    <button
                        onClick={handleHumanize}
                        disabled={isProcessing || !inputText}
                        className="group relative flex items-center justify-center p-4 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                        title="Humanize Text"
                    >
                        {isProcessing ? (
                            <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                            </svg>
                        )}
                    </button>

                    {outputText && (
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => setShowDiff(!showDiff)}
                                className={`text-xs px-3 py-1.5 rounded-full border transition-all whitespace-nowrap ${showDiff
                                    ? 'bg-violet-500/10 border-violet-500/30 text-violet-300'
                                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-300'
                                    }`}
                            >
                                {showDiff ? 'Show Clean' : 'Show Changes'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Output Section */}
                <div className="flex-1 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                    <div className="border-b border-slate-800 p-4 flex justify-between items-center bg-slate-950/50">
                        <h3 className="font-semibold text-slate-200">Humanized Result</h3>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-500 font-mono bg-slate-800 px-2 py-1 rounded-md">
                                {getWordCount(outputText)} words
                            </span>
                            <button
                                onClick={handleCopy}
                                disabled={!outputText}
                                className="text-slate-400 hover:text-white transition-colors disabled:opacity-0 disabled:cursor-default"
                                title="Copy clean text"
                            >
                                {isCopied ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-green-400">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 w-full bg-slate-900/50 p-6 overflow-y-auto font-sans">
                        {outputText ? (
                            showDiff ? renderDiff() : <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">{outputText}</p>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-600 italic">
                                Result will appear here...
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-6 text-center">
                <p className="text-slate-500 text-sm">
                    Green = Added words (Humanized) • Red = Removed words (Robotic)
                </p>
            </div>
        </div>
    );
};

export default HumanizerInterface;
