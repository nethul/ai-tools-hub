'use client';

import React, { useState, useCallback, useEffect } from 'react';

// Word list for passphrase generation
const WORD_LIST = [
    'apple', 'banana', 'cherry', 'dragon', 'eagle', 'falcon', 'garden', 'harbor',
    'island', 'jungle', 'kitten', 'lemon', 'mango', 'nebula', 'orange', 'planet',
    'quartz', 'river', 'sunset', 'tiger', 'umbrella', 'violet', 'whisper', 'xylophone',
    'yellow', 'zebra', 'anchor', 'bridge', 'castle', 'dolphin', 'emerald', 'forest',
    'glacier', 'horizon', 'ivory', 'jasmine', 'kingdom', 'lantern', 'meadow', 'nucleus',
    'ocean', 'phoenix', 'quantum', 'rainbow', 'shadow', 'thunder', 'unity', 'voyage',
    'winter', 'xenon', 'yacht', 'zephyr', 'aurora', 'blizzard', 'crystal', 'diamond'
];

interface PasswordOptions {
    length: number;
    uppercase: boolean;
    lowercase: boolean;
    numbers: boolean;
    symbols: boolean;
    excludeSimilar: boolean;
    excludeAmbiguous: boolean;
}

interface HistoryItem {
    password: string;
    timestamp: Date;
    strength: string;
}

const SIMILAR_CHARS = 'il1LoO0';
const AMBIGUOUS_CHARS = '{}[]()\/\'"\\`~,;:.<>';

const PasswordGeneratorInterface: React.FC = () => {
    const [options, setOptions] = useState<PasswordOptions>({
        length: 16,
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true,
        excludeSimilar: false,
        excludeAmbiguous: false,
    });
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isPassphraseMode, setIsPassphraseMode] = useState(false);
    const [passphraseWordCount, setPassphraseWordCount] = useState(4);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [showHistory, setShowHistory] = useState(false);

    // Calculate password strength
    const calculateStrength = useCallback((pwd: string): { label: string; color: string; percent: number } => {
        if (!pwd) return { label: 'None', color: 'bg-slate-600', percent: 0 };

        let score = 0;

        // Length scoring
        if (pwd.length >= 8) score += 1;
        if (pwd.length >= 12) score += 1;
        if (pwd.length >= 16) score += 1;
        if (pwd.length >= 24) score += 1;

        // Character variety scoring
        if (/[a-z]/.test(pwd)) score += 1;
        if (/[A-Z]/.test(pwd)) score += 1;
        if (/[0-9]/.test(pwd)) score += 1;
        if (/[^a-zA-Z0-9]/.test(pwd)) score += 1;

        // Entropy bonus
        const uniqueChars = new Set(pwd).size;
        if (uniqueChars >= 10) score += 1;
        if (uniqueChars >= 15) score += 1;

        if (score <= 3) return { label: 'Weak', color: 'bg-red-500', percent: 25 };
        if (score <= 5) return { label: 'Fair', color: 'bg-orange-500', percent: 50 };
        if (score <= 7) return { label: 'Good', color: 'bg-yellow-500', percent: 75 };
        return { label: 'Strong', color: 'bg-green-500', percent: 100 };
    }, []);

    // Calculate entropy in bits
    const calculateEntropy = useCallback((pwd: string): number => {
        if (!pwd) return 0;

        let poolSize = 0;
        if (/[a-z]/.test(pwd)) poolSize += 26;
        if (/[A-Z]/.test(pwd)) poolSize += 26;
        if (/[0-9]/.test(pwd)) poolSize += 10;
        if (/[^a-zA-Z0-9]/.test(pwd)) poolSize += 32;

        return Math.round(pwd.length * Math.log2(poolSize || 1));
    }, []);

    // Generate password
    const generatePassword = useCallback(() => {
        if (isPassphraseMode) {
            // Generate passphrase
            const words: string[] = [];
            for (let i = 0; i < passphraseWordCount; i++) {
                const randomIndex = Math.floor(Math.random() * WORD_LIST.length);
                let word = WORD_LIST[randomIndex];
                // Capitalize first letter
                word = word.charAt(0).toUpperCase() + word.slice(1);
                words.push(word);
            }
            // Add a random number at the end
            const randomNum = Math.floor(Math.random() * 100);
            const newPassword = words.join('-') + randomNum;
            setPassword(newPassword);

            // Add to history
            const strength = calculateStrength(newPassword);
            setHistory(prev => [
                { password: newPassword, timestamp: new Date(), strength: strength.label },
                ...prev.slice(0, 4)
            ]);
            return;
        }

        let charset = '';

        if (options.uppercase) {
            let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            if (options.excludeSimilar) {
                chars = chars.split('').filter(c => !SIMILAR_CHARS.includes(c)).join('');
            }
            charset += chars;
        }

        if (options.lowercase) {
            let chars = 'abcdefghijklmnopqrstuvwxyz';
            if (options.excludeSimilar) {
                chars = chars.split('').filter(c => !SIMILAR_CHARS.includes(c)).join('');
            }
            charset += chars;
        }

        if (options.numbers) {
            let chars = '0123456789';
            if (options.excludeSimilar) {
                chars = chars.split('').filter(c => !SIMILAR_CHARS.includes(c)).join('');
            }
            charset += chars;
        }

        if (options.symbols) {
            let chars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
            if (options.excludeAmbiguous) {
                chars = chars.split('').filter(c => !AMBIGUOUS_CHARS.includes(c)).join('');
            }
            charset += chars;
        }

        if (!charset) {
            setPassword('');
            return;
        }

        // Use crypto API for better randomness
        const array = new Uint32Array(options.length);
        crypto.getRandomValues(array);

        let newPassword = '';
        for (let i = 0; i < options.length; i++) {
            newPassword += charset[array[i] % charset.length];
        }

        setPassword(newPassword);

        // Add to history
        const strength = calculateStrength(newPassword);
        setHistory(prev => [
            { password: newPassword, timestamp: new Date(), strength: strength.label },
            ...prev.slice(0, 4)
        ]);
    }, [options, isPassphraseMode, passphraseWordCount, calculateStrength]);

    // Generate initial password
    useEffect(() => {
        generatePassword();
    }, []);

    // Regenerate when options change
    useEffect(() => {
        generatePassword();
    }, [options, isPassphraseMode, passphraseWordCount]);

    const copyToClipboard = useCallback(async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }, []);

    const updateOption = (key: keyof PasswordOptions, value: boolean | number) => {
        setOptions(prev => ({ ...prev, [key]: value }));
    };

    const strength = calculateStrength(password);
    const entropy = calculateEntropy(password);

    // Check if at least one character type is selected
    const hasValidOptions = options.uppercase || options.lowercase || options.numbers || options.symbols;

    return (
        <div className="max-w-4xl mx-auto px-4 pb-16">
            {/* Mode Toggle */}
            <div className="flex justify-center mb-6">
                <div className="bg-slate-800/50 rounded-xl p-1 inline-flex">
                    <button
                        onClick={() => setIsPassphraseMode(false)}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${!isPassphraseMode
                                ? 'bg-purple-500 text-white shadow-lg'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                    >
                        Password
                    </button>
                    <button
                        onClick={() => setIsPassphraseMode(true)}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${isPassphraseMode
                                ? 'bg-purple-500 text-white shadow-lg'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                    >
                        Passphrase
                    </button>
                </div>
            </div>

            {/* Customize Section */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 mb-6">
                <h2 className="text-xl font-semibold text-slate-200 mb-6">
                    {isPassphraseMode ? 'Customize Your Passphrase' : 'Customize Your Password'}
                </h2>

                {isPassphraseMode ? (
                    /* Passphrase Options */
                    <div>
                        <label className="block text-slate-300 mb-3">
                            Number of Words: <span className="text-purple-400 font-bold">{passphraseWordCount} words</span>
                        </label>
                        <input
                            type="range"
                            min="3"
                            max="8"
                            value={passphraseWordCount}
                            onChange={(e) => setPassphraseWordCount(parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                        />
                        <div className="flex justify-between text-sm text-slate-500 mt-1">
                            <span>3</span>
                            <span>8</span>
                        </div>
                    </div>
                ) : (
                    /* Password Options */
                    <>
                        {/* Length Slider */}
                        <div className="mb-6">
                            <label className="block text-slate-300 mb-3">
                                Password Length: <span className="text-purple-400 font-bold">{options.length} characters</span>
                            </label>
                            <input
                                type="range"
                                min="4"
                                max="64"
                                value={options.length}
                                onChange={(e) => updateOption('length', parseInt(e.target.value))}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                            />
                            <div className="flex justify-between text-sm text-slate-500 mt-1">
                                <span>4</span>
                                <span>64</span>
                            </div>
                        </div>

                        {/* Character Types */}
                        <div className="mb-6">
                            <h3 className="text-slate-300 font-medium mb-3">Character Types</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {[
                                    { key: 'uppercase', label: 'Uppercase (A-Z)' },
                                    { key: 'lowercase', label: 'Lowercase (a-z)' },
                                    { key: 'numbers', label: 'Numbers (0-9)' },
                                    { key: 'symbols', label: 'Symbols (!@#$)' },
                                ].map(({ key, label }) => (
                                    <label
                                        key={key}
                                        className={`flex items-center gap-2 p-3 rounded-xl cursor-pointer transition-all ${options[key as keyof PasswordOptions]
                                                ? 'bg-purple-500/20 border border-purple-500/50'
                                                : 'bg-slate-800/50 border border-slate-600 hover:border-slate-500'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={options[key as keyof PasswordOptions] as boolean}
                                            onChange={(e) => updateOption(key as keyof PasswordOptions, e.target.checked)}
                                            className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-purple-500 focus:ring-purple-500/50"
                                        />
                                        <span className="text-sm text-slate-300">{label}</span>
                                    </label>
                                ))}
                            </div>
                            {!hasValidOptions && (
                                <p className="mt-2 text-red-400 text-sm">Please select at least one character type</p>
                            )}
                        </div>

                        {/* Security Options */}
                        <div>
                            <h3 className="text-slate-300 font-medium mb-3">Security Options</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-600 cursor-pointer hover:border-slate-500 transition-colors">
                                    <div className={`w-10 h-5 rounded-full relative transition-colors ${options.excludeSimilar ? 'bg-purple-500' : 'bg-slate-600'}`}>
                                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${options.excludeSimilar ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={options.excludeSimilar}
                                        onChange={(e) => updateOption('excludeSimilar', e.target.checked)}
                                        className="sr-only"
                                    />
                                    <span className="text-sm text-slate-300">
                                        Exclude similar characters <span className="text-slate-500">(i, l, 1, L, o, 0, O)</span>
                                    </span>
                                </label>
                                <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-600 cursor-pointer hover:border-slate-500 transition-colors">
                                    <div className={`w-10 h-5 rounded-full relative transition-colors ${options.excludeAmbiguous ? 'bg-purple-500' : 'bg-slate-600'}`}>
                                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${options.excludeAmbiguous ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={options.excludeAmbiguous}
                                        onChange={(e) => updateOption('excludeAmbiguous', e.target.checked)}
                                        className="sr-only"
                                    />
                                    <span className="text-sm text-slate-300">
                                        Exclude ambiguous characters <span className="text-slate-500">{`({ } [ ] ( ) / \\ ' " \`)`}</span>
                                    </span>
                                </label>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Password Display Section */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 mb-6">
                <h2 className="text-xl font-semibold text-slate-200 mb-4">Your Secure Password</h2>

                {/* Password Field */}
                <div className="relative mb-4">
                    <div className="flex items-center bg-slate-800/50 border border-slate-600 rounded-xl p-4">
                        <span className={`flex-1 font-mono text-lg ${showPassword ? 'text-slate-200' : 'text-slate-400'} break-all`}>
                            {password ? (showPassword ? password : '•'.repeat(Math.min(password.length, 32))) : 'Select at least one character type'}
                        </span>
                        <button
                            onClick={() => setShowPassword(!showPassword)}
                            className="ml-3 p-2 text-slate-400 hover:text-slate-200 transition-colors"
                            title={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                    <line x1="1" y1="1" x2="23" y2="23" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Strength Meter */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-400">Password Strength:</span>
                        <div className="flex items-center gap-3">
                            <span className={`text-sm font-medium ${strength.label === 'Strong' ? 'text-green-400' :
                                    strength.label === 'Good' ? 'text-yellow-400' :
                                        strength.label === 'Fair' ? 'text-orange-400' : 'text-red-400'
                                }`}>
                                {strength.label}
                            </span>
                            <span className="text-xs text-slate-500">({entropy} bits)</span>
                        </div>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${strength.color} transition-all duration-300`}
                            style={{ width: `${strength.percent}%` }}
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => copyToClipboard(password)}
                        disabled={!password}
                        className="flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
                    >
                        {copied ? (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 6 9 17l-5-5" />
                                </svg>
                                Copied!
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                                </svg>
                                Copy Password
                            </>
                        )}
                    </button>
                    <button
                        onClick={generatePassword}
                        className="flex items-center justify-center gap-2 py-3 px-6 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-200 font-semibold rounded-xl transition-all duration-300"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                            <path d="M3 3v5h5" />
                            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                            <path d="M16 16h5v5" />
                        </svg>
                        Regenerate
                    </button>
                </div>
            </div>

            {/* Password History */}
            {history.length > 0 && (
                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-2xl overflow-hidden">
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        className="w-full flex items-center justify-between p-4 text-slate-300 hover:bg-slate-800/50 transition-colors"
                    >
                        <span className="font-medium">Password History ({history.length})</span>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={`transition-transform ${showHistory ? 'rotate-180' : ''}`}
                        >
                            <path d="m6 9 6 6 6-6" />
                        </svg>
                    </button>

                    {showHistory && (
                        <div className="border-t border-slate-700">
                            {history.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-4 border-b border-slate-700/50 last:border-0 hover:bg-slate-800/30"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="font-mono text-sm text-slate-300 truncate">{item.password}</p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {item.strength} • {item.timestamp.toLocaleTimeString()}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(item.password)}
                                        className="ml-3 p-2 text-slate-400 hover:text-purple-400 transition-colors"
                                        title="Copy password"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                                            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PasswordGeneratorInterface;
