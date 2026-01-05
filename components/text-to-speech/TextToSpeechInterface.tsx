'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, Square, Volume2, Download, RefreshCw, Mic, Globe, Gauge, Music, Loader2 } from 'lucide-react';

interface VoiceOption {
    voice: SpeechSynthesisVoice;
    label: string;
}

// Download voices (Microsoft Edge TTS)
const DOWNLOAD_VOICES = [
    { id: 'en-US-female', label: '🇺🇸 Jenny (US Female)' },
    { id: 'en-US-male', label: '🇺🇸 Guy (US Male)' },
    { id: 'en-GB-female', label: '🇬🇧 Sonia (UK Female)' },
    { id: 'en-GB-male', label: '🇬🇧 Ryan (UK Male)' },
    { id: 'en-AU-female', label: '🇦🇺 Natasha (AU Female)' },
    { id: 'en-IN-female', label: '🇮🇳 Neerja (IN Female)' },
    { id: 'es-ES-female', label: '🇪🇸 Elvira (Spanish)' },
    { id: 'fr-FR-female', label: '🇫🇷 Denise (French)' },
    { id: 'de-DE-female', label: '🇩🇪 Katja (German)' },
    { id: 'it-IT-female', label: '🇮🇹 Elsa (Italian)' },
    { id: 'pt-BR-female', label: '🇧🇷 Francisca (Portuguese)' },
    { id: 'ja-JP-female', label: '🇯🇵 Nanami (Japanese)' },
    { id: 'ko-KR-female', label: '🇰🇷 SunHi (Korean)' },
    { id: 'zh-CN-female', label: '🇨🇳 Xiaoxiao (Chinese)' },
    { id: 'hi-IN-female', label: '🇮🇳 Swara (Hindi)' },
];

const TextToSpeechInterface = () => {
    const [text, setText] = useState('');
    const [voices, setVoices] = useState<VoiceOption[]>([]);
    const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
    const [rate, setRate] = useState(1);
    const [pitch, setPitch] = useState(1);
    const [volume, setVolume] = useState(1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isSupported, setIsSupported] = useState(true);
    const [charCount, setCharCount] = useState(0);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadVoice, setDownloadVoice] = useState('en-US-female');

    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    // Load available voices
    useEffect(() => {
        if (typeof window === 'undefined' || !window.speechSynthesis) {
            setIsSupported(false);
            return;
        }

        const loadVoices = () => {
            const availableVoices = speechSynthesis.getVoices();
            const voiceOptions: VoiceOption[] = availableVoices.map((voice) => ({
                voice,
                label: `${voice.name} (${voice.lang})${voice.default ? ' - Default' : ''}`
            }));

            // Sort: prioritize English voices, then by name
            voiceOptions.sort((a, b) => {
                const aIsEnglish = a.voice.lang.startsWith('en');
                const bIsEnglish = b.voice.lang.startsWith('en');
                if (aIsEnglish && !bIsEnglish) return -1;
                if (!aIsEnglish && bIsEnglish) return 1;
                return a.voice.name.localeCompare(b.voice.name);
            });

            setVoices(voiceOptions);

            // Select default voice
            if (voiceOptions.length > 0 && !selectedVoice) {
                const defaultVoice = voiceOptions.find(v => v.voice.default) || voiceOptions[0];
                setSelectedVoice(defaultVoice.voice);
            }
        };

        // Load voices (they may load asynchronously)
        loadVoices();
        speechSynthesis.onvoiceschanged = loadVoices;

        return () => {
            speechSynthesis.onvoiceschanged = null;
        };
    }, [selectedVoice]);

    // Update character count
    useEffect(() => {
        setCharCount(text.length);
    }, [text]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (typeof window !== 'undefined' && window.speechSynthesis) {
                speechSynthesis.cancel();
            }
        };
    }, []);

    const handleSpeak = useCallback(() => {
        if (!text.trim() || !selectedVoice) return;

        // Cancel any existing speech
        speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = selectedVoice;
        utterance.rate = rate;
        utterance.pitch = pitch;
        utterance.volume = volume;

        utterance.onstart = () => {
            setIsPlaying(true);
            setIsPaused(false);
        };

        utterance.onend = () => {
            setIsPlaying(false);
            setIsPaused(false);
        };

        utterance.onerror = () => {
            setIsPlaying(false);
            setIsPaused(false);
        };

        utteranceRef.current = utterance;
        speechSynthesis.speak(utterance);
    }, [text, selectedVoice, rate, pitch, volume]);

    const handlePause = () => {
        if (speechSynthesis.speaking && !speechSynthesis.paused) {
            speechSynthesis.pause();
            setIsPaused(true);
        }
    };

    const handleResume = () => {
        if (speechSynthesis.paused) {
            speechSynthesis.resume();
            setIsPaused(false);
        }
    };

    const handleStop = () => {
        speechSynthesis.cancel();
        setIsPlaying(false);
        setIsPaused(false);
    };

    const handleReset = () => {
        handleStop();
        setText('');
        setRate(1);
        setPitch(1);
        setVolume(1);
    };

    const handleDownload = async () => {
        if (!text.trim() || isDownloading) return;

        setIsDownloading(true);

        try {
            const response = await fetch('/api/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: text.trim(),
                    voice: downloadVoice,
                    rate: rate,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to generate audio');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'speech.mp3';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
            alert('Failed to download audio. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    // Get language flag emoji (simplified)
    const getLanguageFlag = (lang: string): string => {
        const langMap: Record<string, string> = {
            'en': '🇺🇸',
            'en-US': '🇺🇸',
            'en-GB': '🇬🇧',
            'en-AU': '🇦🇺',
            'es': '🇪🇸',
            'fr': '🇫🇷',
            'de': '🇩🇪',
            'it': '🇮🇹',
            'pt': '🇵🇹',
            'pt-BR': '🇧🇷',
            'ja': '🇯🇵',
            'ko': '🇰🇷',
            'zh': '🇨🇳',
            'ru': '🇷🇺',
            'ar': '🇸🇦',
            'hi': '🇮🇳',
        };
        const shortLang = lang.split('-')[0];
        return langMap[lang] || langMap[shortLang] || '🌐';
    };

    if (!isSupported) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center">
                    <Mic className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-red-400 mb-2">Browser Not Supported</h2>
                    <p className="text-slate-400">
                        Your browser does not support the Web Speech API.
                        Please try using Chrome, Edge, or Safari.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row gap-8 min-h-[500px]">

                {/* Text Input Area */}
                <div className="flex-1 flex flex-col">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex-1 flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-sm text-slate-400 font-medium">Enter your text</label>
                            <span className="text-xs text-slate-500">{charCount.toLocaleString()} characters</span>
                        </div>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Type or paste your text here..."
                            className="flex-1 w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-slate-200 placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all min-h-[300px]"
                        />

                        {/* Playback Controls */}
                        <div className="flex items-center gap-3 mt-4">
                            {!isPlaying ? (
                                <button
                                    onClick={handleSpeak}
                                    disabled={!text.trim() || !selectedVoice}
                                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                                >
                                    <Play className="w-5 h-5" />
                                    Speak
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={isPaused ? handleResume : handlePause}
                                        className="flex-1 py-3 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 transition-all flex items-center justify-center gap-2"
                                    >
                                        {isPaused ? (
                                            <>
                                                <Play className="w-5 h-5" />
                                                Resume
                                            </>
                                        ) : (
                                            <>
                                                <Pause className="w-5 h-5" />
                                                Pause
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={handleStop}
                                        className="py-3 px-6 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Square className="w-5 h-5" />
                                        Stop
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Controls Sidebar */}
                <div className="w-full lg:w-96 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-6 shadow-xl">

                    <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
                        <Volume2 className="w-5 h-5" />
                        Voice Settings
                    </h2>

                    {/* Voice Selection */}
                    <div>
                        <label className="block text-xs text-slate-500 mb-2 uppercase font-bold tracking-wider flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            Voice
                        </label>
                        <select
                            value={selectedVoice?.name || ''}
                            onChange={(e) => {
                                const voice = voices.find(v => v.voice.name === e.target.value);
                                if (voice) setSelectedVoice(voice.voice);
                            }}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                        >
                            {voices.map((v, i) => (
                                <option key={i} value={v.voice.name}>
                                    {getLanguageFlag(v.voice.lang)} {v.voice.name}
                                </option>
                            ))}
                        </select>
                        {selectedVoice && (
                            <p className="text-xs text-slate-500 mt-2">
                                Language: {selectedVoice.lang} • {selectedVoice.localService ? 'Offline' : 'Online'}
                            </p>
                        )}
                    </div>

                    <div className="h-px bg-slate-800" />

                    {/* Rate Slider */}
                    <div>
                        <label className="block text-xs text-slate-500 mb-2 uppercase font-bold tracking-wider flex items-center gap-2">
                            <Gauge className="w-4 h-4" />
                            Speed: {rate.toFixed(1)}x
                        </label>
                        <input
                            type="range"
                            min="0.5"
                            max="2"
                            step="0.1"
                            value={rate}
                            onChange={(e) => setRate(parseFloat(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer accent-emerald-500"
                        />
                        <div className="flex justify-between text-xs text-slate-500 mt-1">
                            <span>0.5x</span>
                            <span>2x</span>
                        </div>
                    </div>

                    {/* Pitch Slider */}
                    <div>
                        <label className="block text-xs text-slate-500 mb-2 uppercase font-bold tracking-wider flex items-center gap-2">
                            <Music className="w-4 h-4" />
                            Pitch: {pitch.toFixed(1)}
                        </label>
                        <input
                            type="range"
                            min="0.5"
                            max="2"
                            step="0.1"
                            value={pitch}
                            onChange={(e) => setPitch(parseFloat(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer accent-cyan-500"
                        />
                        <div className="flex justify-between text-xs text-slate-500 mt-1">
                            <span>Low</span>
                            <span>High</span>
                        </div>
                    </div>

                    {/* Volume Slider */}
                    <div>
                        <label className="block text-xs text-slate-500 mb-2 uppercase font-bold tracking-wider flex items-center gap-2">
                            <Volume2 className="w-4 h-4" />
                            Volume: {Math.round(volume * 100)}%
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={volume}
                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer accent-emerald-500"
                        />
                        <div className="flex justify-between text-xs text-slate-500 mt-1">
                            <span>Mute</span>
                            <span>Max</span>
                        </div>
                    </div>

                    <div className="h-px bg-slate-800" />

                    {/* Download Section */}
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-slate-700/50">
                        <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            Download Audio
                        </h3>
                        <label className="block text-xs text-slate-500 mb-2 uppercase font-bold tracking-wider">
                            Download Voice
                        </label>
                        <select
                            value={downloadVoice}
                            onChange={(e) => setDownloadVoice(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all mb-3"
                        >
                            {DOWNLOAD_VOICES.map((v) => (
                                <option key={v.id} value={v.id}>
                                    {v.label}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={handleDownload}
                            disabled={!text.trim() || isDownloading}
                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-semibold shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                        >
                            {isDownloading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4" />
                                    Download MP3
                                </>
                            )}
                        </button>
                        <p className="text-xs text-slate-500 mt-2 text-center">
                            High-quality neural voice
                        </p>
                    </div>

                    {/* Reset Button */}
                    <button
                        onClick={handleReset}
                        className="w-full py-3 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Reset All
                    </button>
                </div>
            </div>

            {/* Feature Cards */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
                    <Volume2 className="w-8 h-8 text-emerald-400 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-200 mb-2">Multiple Voices</h3>
                    <p className="text-slate-400 text-sm">Choose from all voices installed on your device, supporting multiple languages and accents.</p>
                </div>
                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
                    <Gauge className="w-8 h-8 text-cyan-400 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-200 mb-2">Full Control</h3>
                    <p className="text-slate-400 text-sm">Adjust speed, pitch, and volume to customize the speech output to your preferences.</p>
                </div>
                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
                    <Globe className="w-8 h-8 text-blue-400 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-200 mb-2">Works Offline</h3>
                    <p className="text-slate-400 text-sm">Uses your browser&apos;s built-in speech engine. No downloads or internet required.</p>
                </div>
            </div>
        </div>
    );
};

export default TextToSpeechInterface;
