'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import FileUploader from '../../../components/chat-docs/FileUploader';
import ChatInterface from '../../../components/chat-docs/ChatInterface';

// Icons
const DocumentIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
);

export default function ChatWithDocsPage() {
    const [storeName, setStoreName] = useState<string | null>(null);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleUploadComplete = (name: string) => {
        setStoreName(name);
    };

    const handleReset = () => {
        setStoreName(null);
    };

    return (
        <div className="min-h-screen p-4 sm:p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Back Link */}
                <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-violet-400 transition-colors mb-8 group">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:-translate-x-1 transition-transform">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                    </svg>
                    <span>Back to Tools</span>
                </Link>

                {/* Header */}
                <header className="mb-12 text-center space-y-4">
                    <div className="inline-flex items-center justify-center p-3 bg-slate-800/80 rounded-2xl shadow-xl ring-1 ring-slate-700 mb-4 backdrop-blur-md">
                        <DocumentIcon className="w-8 h-8 text-violet-400 mr-3" />
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400">
                            Chat with Docs
                        </h1>
                    </div>
                    <p className="text-slate-400 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
                        Upload your documents and have a conversation with them.
                        Our AI understands the context and answers your questions instantly.
                    </p>
                </header>

                {/* Main Content */}
                <main className="animate-fade-in">
                    {!storeName ? (
                        <FileUploader onUploadComplete={handleUploadComplete} />
                    ) : (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-semibold text-slate-200">Conversation</h2>
                                <button
                                    onClick={handleReset}
                                    className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                                    </svg>
                                    Upload New File
                                </button>
                            </div>
                            <ChatInterface storeName={storeName} />
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
