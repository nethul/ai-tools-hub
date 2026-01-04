'use client';

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';

interface Match {
    index: number;
    startIndex: number;
    endIndex: number;
    text: string;
    selected: boolean;
}

const WordFinderReplacerInterface: React.FC = () => {
    const [inputText, setInputText] = useState('');
    const [findWord, setFindWord] = useState('');
    const [replaceWord, setReplaceWord] = useState('');
    const [caseSensitive, setCaseSensitive] = useState(false);
    const [matches, setMatches] = useState<Match[]>([]);
    const [copied, setCopied] = useState(false);
    const [isEditing, setIsEditing] = useState(true);
    const [lastReplaceCount, setLastReplaceCount] = useState<number | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const highlightRef = useRef<HTMLDivElement>(null);

    // Find all matches when find word or input text changes
    const foundMatches = useMemo(() => {
        if (!findWord || !inputText) return [];

        const flags = caseSensitive ? 'g' : 'gi';
        const escapedWord = findWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedWord, flags);
        const results: Match[] = [];
        let match;
        let index = 0;

        while ((match = regex.exec(inputText)) !== null) {
            results.push({
                index,
                startIndex: match.index,
                endIndex: match.index + match[0].length,
                text: match[0],
                selected: true,
            });
            index++;
        }

        return results;
    }, [findWord, inputText, caseSensitive]);

    // Update matches state when foundMatches changes
    useEffect(() => {
        setMatches(foundMatches);
        setLastReplaceCount(null);
    }, [foundMatches]);

    // Sync scroll between textarea and highlight overlay
    const syncScroll = useCallback(() => {
        if (textareaRef.current && highlightRef.current) {
            highlightRef.current.scrollTop = textareaRef.current.scrollTop;
            highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
        }
    }, []);

    const toggleMatch = useCallback((index: number) => {
        setMatches(prev => prev.map(m =>
            m.index === index ? { ...m, selected: !m.selected } : m
        ));
    }, []);

    const selectAll = useCallback(() => {
        setMatches(prev => prev.map(m => ({ ...m, selected: true })));
    }, []);

    const deselectAll = useCallback(() => {
        setMatches(prev => prev.map(m => ({ ...m, selected: false })));
    }, []);

    const handleReplace = useCallback(() => {
        if (!findWord || matches.length === 0) return;

        const selectedMatches = matches.filter(m => m.selected);

        if (selectedMatches.length === 0) {
            return;
        }

        // Build output by replacing only selected matches
        let result = '';
        let lastIndex = 0;

        // Sort matches by startIndex
        const sortedMatches = [...selectedMatches].sort((a, b) => a.startIndex - b.startIndex);

        for (const match of sortedMatches) {
            result += inputText.slice(lastIndex, match.startIndex);
            result += replaceWord;
            lastIndex = match.endIndex;
        }
        result += inputText.slice(lastIndex);

        // Store how many replacements were made for feedback
        setLastReplaceCount(selectedMatches.length);

        // Directly update the input text
        setInputText(result);
        setFindWord('');

        // Clear the notification after 3 seconds
        setTimeout(() => setLastReplaceCount(null), 3000);
    }, [findWord, matches, inputText, replaceWord]);

    const copyToClipboard = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(inputText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }, [inputText]);

    // Create highlighted text with clickable matches
    const highlightedContent = useMemo(() => {
        if (!findWord || !inputText || matches.length === 0) {
            return <span className="whitespace-pre-wrap">{inputText}</span>;
        }

        const elements: React.ReactNode[] = [];
        let lastIndex = 0;

        // Sort matches by startIndex
        const sortedMatches = [...matches].sort((a, b) => a.startIndex - b.startIndex);

        sortedMatches.forEach((match) => {
            // Add text before match
            if (match.startIndex > lastIndex) {
                elements.push(
                    <span key={`text-${match.index}`} className="whitespace-pre-wrap">
                        {inputText.slice(lastIndex, match.startIndex)}
                    </span>
                );
            }

            // Add clickable highlighted match
            elements.push(
                <span
                    key={`match-${match.index}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleMatch(match.index);
                    }}
                    className={`cursor-pointer rounded px-0.5 transition-all duration-200 hover:ring-2 hover:ring-white/30 ${match.selected
                        ? 'bg-teal-500/50 text-teal-100 border-b-2 border-teal-400'
                        : 'bg-slate-600/50 text-slate-400 border-b-2 border-slate-500 line-through'
                        }`}
                    title={match.selected ? 'Click to deselect' : 'Click to select'}
                >
                    {match.text}
                </span>
            );

            lastIndex = match.endIndex;
        });

        // Add remaining text
        if (lastIndex < inputText.length) {
            elements.push(
                <span key="text-end" className="whitespace-pre-wrap">
                    {inputText.slice(lastIndex)}
                </span>
            );
        }

        return <>{elements}</>;
    }, [findWord, inputText, matches, toggleMatch]);

    const selectedCount = matches.filter(m => m.selected).length;

    return (
        <div className="max-w-6xl mx-auto px-4 pb-16">
            {/* Success notification */}
            {lastReplaceCount !== null && (
                <div className="mb-6 bg-teal-500/20 border border-teal-500/50 rounded-xl p-4 flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-teal-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span className="text-teal-300">
                        Successfully replaced {lastReplaceCount} {lastReplaceCount === 1 ? 'occurrence' : 'occurrences'}
                    </span>
                </div>
            )}

            {/* Text Input Section with Inline Highlighting */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-between mb-3">
                    <label className="block text-slate-300 font-medium">
                        {isEditing ? 'Edit your text' : 'Your text with highlights'}
                    </label>
                    <div className="flex items-center gap-3">
                        {matches.length > 0 && !isEditing && (
                            <span className="text-sm text-slate-400">
                                Click on highlighted words to select/deselect
                            </span>
                        )}
                        {inputText && (
                            <button
                                onClick={copyToClipboard}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
                            >
                                {copied ? (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-teal-400">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                        </svg>
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                                        </svg>
                                        Copy
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                <div className="relative">
                    {/* Highlight Overlay - shown when not editing and has matches */}
                    {!isEditing && inputText && (
                        <div
                            ref={highlightRef}
                            className="w-full h-48 bg-slate-800/50 border border-slate-600 rounded-xl p-4 text-slate-200 overflow-auto leading-relaxed"
                            onClick={() => setIsEditing(true)}
                            style={{
                                wordBreak: 'break-word',
                                whiteSpace: 'pre-wrap'
                            }}
                        >
                            {highlightedContent}
                            {!inputText && (
                                <span className="text-slate-500">Click to add text...</span>
                            )}
                        </div>
                    )}

                    {/* Textarea - shown when editing or no text */}
                    {(isEditing || !inputText) && (
                        <textarea
                            ref={textareaRef}
                            className="w-full h-48 bg-slate-800/50 border border-slate-600 rounded-xl p-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all resize-none"
                            placeholder="Paste or type your text here..."
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onBlur={() => setIsEditing(false)}
                            onScroll={syncScroll}
                            autoFocus={isEditing}
                        />
                    )}
                </div>

                {inputText && !isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="mt-3 text-sm text-slate-400 hover:text-teal-400 transition-colors flex items-center gap-1"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                            <path d="m15 5 4 4" />
                        </svg>
                        Edit text
                    </button>
                )}
            </div>

            {/* Find and Replace Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Find Section */}
                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
                    <label className="block text-slate-300 font-medium mb-3">
                        Find word
                    </label>
                    <input
                        type="text"
                        className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all"
                        placeholder="Enter word to find..."
                        value={findWord}
                        onChange={(e) => setFindWord(e.target.value)}
                    />
                    <div className="mt-3 flex items-center justify-between">
                        <label className="flex items-center gap-2 text-slate-400 text-sm cursor-pointer hover:text-slate-300 transition-colors">
                            <input
                                type="checkbox"
                                checked={caseSensitive}
                                onChange={(e) => setCaseSensitive(e.target.checked)}
                                className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-teal-500 focus:ring-teal-500/50"
                            />
                            Case sensitive
                        </label>
                        {findWord && (
                            <span className="text-teal-400 font-medium text-sm">
                                {matches.length} match{matches.length !== 1 ? 'es' : ''}
                            </span>
                        )}
                    </div>
                </div>

                {/* Replace Section */}
                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
                    <label className="block text-slate-300 font-medium mb-3">
                        Replace with
                    </label>
                    <input
                        type="text"
                        className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all"
                        placeholder="Enter replacement text..."
                        value={replaceWord}
                        onChange={(e) => setReplaceWord(e.target.value)}
                    />
                    <button
                        onClick={handleReplace}
                        disabled={!findWord || matches.length === 0 || selectedCount === 0}
                        className="mt-4 w-full py-3 px-6 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 disabled:shadow-none"
                    >
                        Replace {selectedCount > 0 ? `(${selectedCount} selected)` : ''}
                    </button>
                </div>
            </div>

            {/* Quick Selection Controls */}
            {matches.length > 0 && (
                <div className="flex items-center justify-center gap-4 mb-6">
                    <button
                        onClick={selectAll}
                        className="px-4 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-600"
                    >
                        Select All ({matches.length})
                    </button>
                    <button
                        onClick={deselectAll}
                        className="px-4 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-600"
                    >
                        Deselect All
                    </button>
                    <span className="text-slate-400 text-sm">
                        {selectedCount} of {matches.length} selected
                    </span>
                </div>
            )}
        </div>
    );
};

export default WordFinderReplacerInterface;
