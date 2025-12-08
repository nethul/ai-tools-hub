import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="mt-20 pt-12 pb-8 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    <div>
                        <h4 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400 mb-3">
                            AI Tools Hub
                        </h4>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            A curated collection of AI-powered tools designed to enhance productivity and creativity.
                        </p>
                    </div>

                    <div className="flex flex-col items-center">
                        <h5 className="text-lg font-semibold text-slate-200 mb-3">Tech Stack</h5>
                        <ul className="text-slate-400 text-sm space-y-1 text-center">
                            <li>Next.js 16 + TypeScript</li>
                            <li>Tailwind CSS v4</li>
                            <li>Gemini API</li>
                            <li>TMDb API</li>
                        </ul>
                    </div>

                    <div className="flex flex-col items-center md:items-end">
                        <h5 className="text-lg font-semibold text-slate-200 mb-3">Quick Links</h5>
                        <div className="flex flex-col gap-2 text-slate-400 text-sm">
                            <a href="/about" className="hover:text-slate-200 transition-colors">About</a>
                            <a href="/contact" className="hover:text-slate-200 transition-colors">Contact</a>
                            <a href="#" className="hover:text-slate-200 transition-colors">Privacy Policy</a>
                        </div>
                    </div>
                </div>

                <div className="text-center text-slate-500 text-sm pt-8 border-t border-slate-800">
                    <span>© {new Date().getFullYear()} AI Tools Hub — Powered by AI</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
