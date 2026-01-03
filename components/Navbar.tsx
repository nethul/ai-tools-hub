'use client';

import React from 'react';
import Link from 'next/link';


const Navbar: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    return (
        <nav className="sticky top-0 z-30 backdrop-blur bg-slate-900/70 border-b border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-transparent flex items-center justify-center">
                        <img src={"/logo.png"} alt="Logo" className="w-full h-full object-contain"></img>
                    </div>
                    <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
                        AI Tool Verse
                    </span>
                </Link>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-slate-300 hover:text-white p-2"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        {isMenuOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        )}
                    </svg>
                </button>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-6 text-slate-300 text-sm">
                    <Link href="/" className="hover:text-slate-100 transition-colors">Home</Link>
                    <Link href="/blog" className="hover:text-slate-100 transition-colors">Blog</Link>
                    <Link href="/about" className="hover:text-slate-100 transition-colors">About</Link>
                    <Link href="/contact" className="hover:text-slate-100 transition-colors">Contact</Link>
                    <a
                        href="https://buymeacoffee.com/luhtensolutions"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow-lg hover:from-emerald-400 hover:to-teal-400 hover:shadow-emerald-500/30 transition-all duration-300 transform hover:scale-105"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                        </svg>
                        Donate Us
                    </a>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-slate-800 bg-slate-900 absolute w-full left-0 animate-fade-in p-4 flex flex-col gap-4 shadow-xl">
                    <Link href="/" className="text-slate-300 hover:text-white py-2" onClick={() => setIsMenuOpen(false)}>Home</Link>
                    <Link href="/blog" className="text-slate-300 hover:text-white py-2" onClick={() => setIsMenuOpen(false)}>Blog</Link>
                    <Link href="/about" className="text-slate-300 hover:text-white py-2" onClick={() => setIsMenuOpen(false)}>About</Link>
                    <Link href="/contact" className="text-slate-300 hover:text-white py-2" onClick={() => setIsMenuOpen(false)}>Contact</Link>
                    <a
                        href="https://buymeacoffee.com/luhtensolutions"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow-lg hover:from-emerald-400 hover:to-teal-400 transition-all duration-300 mt-2"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                        </svg>
                        Donate Us
                    </a>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
