'use client';

import React, { useState, useRef, useEffect } from 'react';
import { SummaryOptions, SummaryLength, SummaryFormat } from '../../types';
import { countWords, copyToClipboard } from '../../utils/textUtils';

export default function SummarizerInterface() {
    const [inputText, setInputText] = useState<string>('');
    const [summaryText, setSummaryText] = useState<string>('');
    const [isStreaming, setIsStreaming] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [copySuccess, setCopySuccess] = useState<boolean>(false);

    const [options, setOptions] = useState<SummaryOptions>({
        length: SummaryLength.MEDIUM,
        format: SummaryFormat.PARAGRAPH
    });

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize input textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 600)}px`;
        }
    }, [inputText]);

    const handleSummarize = async () => {
        if (!inputText.trim()) return;

        setIsStreaming(true);
        setError(null);
        setSummaryText('');
        setCopySuccess(false);

        try {
            const response = await fetch('/api/summarize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: inputText, options }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate summary');
            }

            if (!response.body) throw new Error('No response body');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                setSummaryText(prev => prev + chunk);
            }

        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to generate summary. Please try again.");
        } finally {
            setIsStreaming(false);
        }
    };

    const handleCopy = async () => {
        if (!summaryText) return;
        const success = await copyToClipboard(summaryText);
        if (success) {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        }
    };

    const handleClear = () => {
        setInputText('');
        setSummaryText('');
        setError(null);
        setCopySuccess(false);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    };

    const inputWordCount = countWords(inputText);
    const outputWordCount = countWords(summaryText);
    const reductionPercentage = inputWordCount > 0
        ? Math.round(((inputWordCount - outputWordCount) / inputWordCount) * 100)
        : 0;

    return (
        <div className="w-full max-w-7xl mx-auto">
            {/* Controls Bar */}
            <div className="mb-8 bg-slate-900/50 rounded-2xl border border-slate-800 p-6 flex flex-col md:flex-row md:items-end justify-between gap-6 backdrop-blur-sm">
                <div className="flex flex-col sm:flex-row gap-6 flex-1">
                    <div className="w-full sm:w-48">
                        <label className="block text-sm font-medium text-slate-400 mb-2">Length</label>
                        <div className="relative">
                            <select
                                value={options.length}
                                onChange={(e) => setOptions(prev => ({ ...prev, length: e.target.value as SummaryLength }))}
                                disabled={isStreaming}
                                className="w-full appearance-none bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all disabled:opacity-50"
                            >
                                {Object.values(SummaryLength).map(v => (
                                    <option key={v} value={v}>{v}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="w-full sm:w-48">
                        <label className="block text-sm font-medium text-slate-400 mb-2">Format</label>
                        <div className="relative">
                            <select
                                value={options.format}
                                onChange={(e) => setOptions(prev => ({ ...prev, format: e.target.value as SummaryFormat }))}
                                disabled={isStreaming}
                                className="w-full appearance-none bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all disabled:opacity-50"
                            >
                                {Object.values(SummaryFormat).map(v => (
                                    <option key={v} value={v}>{v}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleClear}
                        disabled={!inputText && !summaryText}
                        className="px-4 py-2.5 text-slate-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        Clear
                    </button>
                    <button
                        onClick={handleSummarize}
                        disabled={!inputText.trim() || isStreaming}
                        className="w-full sm:w-auto min-w-[140px] bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-violet-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isStreaming ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Summarizing...
                            </>
                        ) : (
                            <>
                                Summarize
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                                </svg>
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[500px]">
                {/* Input Section */}
                <div className="flex flex-col h-full bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden focus-within:ring-2 focus-within:ring-violet-500/20 focus-within:border-violet-500/50 transition-all">
                    <div className="flex items-center justify-between px-6 py-4 bg-slate-900/50 border-b border-slate-800">
                        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Input Text</h2>
                        <span className="text-xs font-medium text-slate-500 bg-slate-800 px-2 py-1 rounded border border-slate-700">
                            {inputWordCount} words
                        </span>
                    </div>
                    <div className="relative flex-1">
                        <textarea
                            ref={textareaRef}
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Paste your text here to summarize..."
                            className="w-full h-full min-h-[400px] p-6 text-slate-200 leading-relaxed resize-none focus:outline-none placeholder:text-slate-600 bg-transparent"
                            spellCheck={false}
                        />
                    </div>
                </div>

                {/* Output Section */}
                <div className="flex flex-col h-full bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden relative">
                    <div className="flex items-center justify-between px-6 py-4 bg-slate-900/50 border-b border-slate-800">
                        <div className="flex items-center gap-3">
                            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Summary</h2>
                            {summaryText && !isStreaming && reductionPercentage > 0 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-900/30 text-green-400 border border-green-900/50">
                                    -{reductionPercentage}%
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-medium text-slate-500 bg-slate-800 px-2 py-1 rounded border border-slate-700">
                                {outputWordCount} words
                            </span>
                            <button
                                onClick={handleCopy}
                                disabled={!summaryText}
                                className={`p-1.5 rounded transition-all duration-200 ${copySuccess
                                    ? 'text-green-400 bg-green-900/20'
                                    : 'text-slate-400 hover:text-violet-400 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed'
                                    }`}
                                title="Copy to clipboard"
                            >
                                {copySuccess ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 relative bg-slate-950/30">
                        {summaryText ? (
                            <div className="w-full h-full min-h-[400px] p-6 text-slate-300 leading-relaxed overflow-y-auto whitespace-pre-wrap prose prose-invert max-w-none">
                                {summaryText}
                                {isStreaming && (
                                    <span className="inline-block w-2 h-4 ml-1 bg-violet-500 animate-pulse align-middle" />
                                )}
                            </div>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 p-8 text-center">
                                <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4 text-slate-700">
                                    {isStreaming ? (
                                        <svg className="animate-spin h-8 w-8 text-violet-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                        </svg>
                                    )}
                                </div>
                                <p className="max-w-xs text-sm">
                                    {isStreaming
                                        ? "Analyzing text and generating summary..."
                                        : "Enter text on the left and click Summarize to see the result here."}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Error Toast */}
            {error && (
                <div className="fixed bottom-4 right-4 max-w-md bg-red-900/90 text-red-100 border border-red-800 px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300 backdrop-blur-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">{error}</span>
                    <button onClick={() => setError(null)} className="text-red-300 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
}
