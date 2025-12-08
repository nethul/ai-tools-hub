'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../../types';
import { chatWithStore } from '../../app/actions/chatDocsActions';

interface ChatInterfaceProps {
    storeName: string;
}

export default function ChatInterface({ storeName }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Pass history excluding the latest user message we just added locally for display,
            // but actually we should pass the full history including the new message if the server action expects it.
            // My server action implementation constructs the history from the passed array and adds the query.
            // So I should pass the *previous* messages.

            const result = await chatWithStore(storeName, userMessage.content, messages);

            if (result.success && result.response) {
                const aiMessage: ChatMessage = { role: 'model', content: result.response };
                setMessages(prev => [...prev, aiMessage]);
            } else {
                const errorMessage: ChatMessage = { role: 'model', content: `Error: ${result.error || "Failed to get response."}` };
                setMessages(prev => [...prev, errorMessage]);
            }
        } catch (error) {
            const errorMessage: ChatMessage = { role: 'model', content: "An unexpected error occurred." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[600px] bg-slate-800/50 rounded-2xl border border-slate-700 shadow-xl overflow-hidden">
            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
                {messages.length === 0 && (
                    <div className="text-center text-slate-500 mt-10">
                        <p>Ask any question about your document.</p>
                    </div>
                )}

                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`
                                max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
                                ${msg.role === 'user'
                                    ? 'bg-violet-600 text-white rounded-br-none'
                                    : 'bg-slate-700 text-slate-200 rounded-bl-none'
                                }
                            `}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-slate-700 text-slate-200 rounded-2xl rounded-bl-none p-4 flex items-center gap-2">
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-slate-800 border-t border-slate-700">
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask a question..."
                        disabled={isLoading}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="bg-violet-600 hover:bg-violet-500 text-white p-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.77 59.77 0 0 1 3.27 20.876L5.999 12Zm0 0h7.5" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
}
