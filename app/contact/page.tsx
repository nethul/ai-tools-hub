import React from 'react';
import Link from 'next/link';

export default function ContactPage() {
    return (
        <div className="min-h-screen p-4 sm:p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
                <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-violet-400 transition-colors mb-8">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                    </svg>
                    <span>Back to Home</span>
                </Link>

                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400 mb-6">
                    Contact Us
                </h1>

                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 space-y-6">
                    <div>
                        <h2 className="text-2xl font-semibold text-slate-200 mb-3">Get in Touch</h2>
                        <p className="text-slate-400 leading-relaxed mb-6">
                            Have questions, suggestions, or feedback? We'd love to hear from you!
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-violet-400 mt-1">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                            </svg>
                            <div>
                                <h3 className="text-slate-200 font-semibold">Email</h3>
                                <p className="text-slate-400">contact@aitoolshub.com</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-cyan-400 mt-1">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
                            </svg>
                            <div>
                                <h3 className="text-slate-200 font-semibold">Social Media</h3>
                                <p className="text-slate-400">Follow us for updates and new tool releases</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-700">
                        <p className="text-slate-400 text-sm">
                            We typically respond within 24-48 hours. For urgent inquiries, please mark your message as high priority.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
