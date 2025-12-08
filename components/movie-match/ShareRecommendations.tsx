import React, { useState, useRef, useEffect } from 'react';
import { MovieRecommendation } from '../../types';

interface ShareRecommendationsProps {
    recommendations: MovieRecommendation[];
    // optional: baseUrl override; defaults to current origin
    baseUrl?: string;
}

const ShareRecommendations: React.FC<ShareRecommendationsProps> = ({ recommendations, baseUrl }) => {
    const [copied, setCopied] = useState(false);
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const titles = recommendations.map(r => r.title).join(', ');
    const shortTitles = recommendations.map(r => r.title).slice(0, 5).join(', ');

    // Build canonical share URL including encoded recommendations so recipients see the same list
    const origin = (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : (baseUrl || 'https://moviematch.online');
    const appBase = baseUrl || origin + '/';
    const shareLink = appBase;

    const shareTitle = 'My Moviematch AI recommendations';
    const shareText = `I got these AI-based movie recommendations from Moviematch AI:\n\n${shortTitles}\n\nOpen this link to view them:`;

    const twitterText = encodeURIComponent(`${shareTitle}: ${shortTitles}`);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${twitterText}&url=${encodeURIComponent(shareLink)}`;
    const whatsappText = encodeURIComponent(`${shareTitle}: ${shortTitles} ${shareLink}`);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${whatsappText}`;
    const mailtoText = encodeURIComponent(`${shareTitle}: ${titles}\n\n${shareLink}`);
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${mailtoText}`;

    const handleNativeShare = async () => {
        try {
            const canUseWebShare = typeof navigator !== 'undefined' && (navigator as any).share;
            if (canUseWebShare) {
                await (navigator as any).share({ title: shareTitle, text: shareText, url: shareLink });
            } else {
                await handleCopy();
            }
        } catch (err) {
            console.error('Native share failed', err);
            await handleCopy();
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        } catch (err) {
            // fallback
            try {
                const el = document.createElement('textarea');
                el.value = shareLink;
                document.body.appendChild(el);
                el.select();
                document.execCommand('copy');
                document.body.removeChild(el);
                setCopied(true);
                setTimeout(() => setCopied(false), 3000);
            } catch (e) {
                console.error('Copy fallback failed', e);
            }
        }
    };

    // Close popover when clicking outside or pressing Escape
    useEffect(() => {
        function handleClickOutside(e: MouseEvent | TouchEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }

        function handleKey(e: KeyboardEvent) {
            if (e.key === 'Escape') setOpen(false);
        }

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        document.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
            document.removeEventListener('keydown', handleKey);
        };
    }, []);

    return (
        <div ref={containerRef} className="flex items-center justify-center gap-2 mb-8 my-6 relative">
            <button
                onClick={() => setOpen(o => !o)}
                className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold px-8 py-4 rounded-md shadow hover:shadow-cyan-500/30 transition"
                aria-haspopup="menu"
                aria-expanded={open}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M15 8a3 3 0 10-2.83-4H9.41l1.3 1.3a1 1 0 01-1.42 1.42L8 5.41 6.71 6.7A1 1 0 115.29 5.29L6.59 4H4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8h-3z" />
                </svg>
                Share with Friends!
            </button>

            {open && (
                <div className="absolute mt-2 w-[22rem] sm:w-96 bg-slate-800 border border-slate-700 rounded-md shadow-lg z-20">
                    <div className="p-4">
                        <div className="text-sm text-slate-300 mb-3">Share your recommendations</div>

                        <button
                            onClick={handleNativeShare}
                            className="w-full px-3 py-2 rounded-md bg-slate-700 hover:bg-slate-600 transition text-white flex items-center justify-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M15 8a3 3 0 10-2.83-4H9.41l1.3 1.3a1 1 0 01-1.42 1.42L8 5.41 6.71 6.7A1 1 0 115.29 5.29L6.59 4H4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8h-3z" />
                            </svg>
                            Share via device…
                        </button>

                        <div className="mt-3">
                            <label className="block text-xs text-slate-400 mb-1">Link</label>
                            <div className="flex items-stretch gap-2">
                                <input
                                    readOnly
                                    value={shareLink}
                                    className="flex-1 bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-xs text-slate-300 truncate"
                                />
                                <button onClick={handleCopy} className="px-3 py-2 text-sm bg-cyan-600 hover:bg-cyan-700 rounded-md text-white">
                                    {copied ? 'Copied' : 'Copy'}
                                </button>
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-4 gap-2">
                            <a href={twitterUrl} target="_blank" rel="noreferrer" className="text-center text-xs bg-[#1DA1F2] hover:brightness-110 text-white py-2 rounded-md">X</a>
                            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="text-center text-xs bg-[#25D366] hover:brightness-110 text-white py-2 rounded-md">WhatsApp</a>
                            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`} target="_blank" rel="noreferrer" className="text-center text-xs bg-[#1877F2] hover:brightness-110 text-white py-2 rounded-md">Facebook</a>
                            <a href={mailtoUrl} className="text-center text-xs bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-md">Email</a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShareRecommendations;
