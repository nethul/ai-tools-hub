import React from 'react';
import Link from 'next/link';

export default function AboutPage() {
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
                    About AI Tools Hub
                </h1>

                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 space-y-6">
                    <div>
                        <h2 className="text-2xl font-semibold text-slate-200 mb-3">Our Mission</h2>
                        <p className="text-slate-400 leading-relaxed">
                            AI Tools Hub is dedicated to curating and providing access to powerful AI-driven tools that enhance productivity, creativity, and decision-making. We believe in making AI accessible and useful for everyone.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-semibold text-slate-200 mb-3">What We Offer</h2>
                        <p className="text-slate-400 leading-relaxed">
                            Our collection includes various AI-powered tools, starting with Movie Match AI - a sophisticated recommendation engine that understands your taste beyond simple genre matching. Each tool is carefully selected and designed to provide real value.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-semibold text-slate-200 mb-3">Technology</h2>
                        <p className="text-slate-400 leading-relaxed">
                            Built with modern web technologies including Next.js 16, TypeScript, and Tailwind CSS, our platform leverages cutting-edge AI APIs like Google's Gemini to deliver intelligent, personalized experiences.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
