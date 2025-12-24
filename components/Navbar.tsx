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


                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-slate-800 bg-slate-900 absolute w-full left-0 animate-fade-in p-4 flex flex-col gap-4 shadow-xl">
                    <Link href="/" className="text-slate-300 hover:text-white py-2" onClick={() => setIsMenuOpen(false)}>Home</Link>
                    <Link href="/blog" className="text-slate-300 hover:text-white py-2" onClick={() => setIsMenuOpen(false)}>Blog</Link>
                    <Link href="/about" className="text-slate-300 hover:text-white py-2" onClick={() => setIsMenuOpen(false)}>About</Link>
                    <Link href="/contact" className="text-slate-300 hover:text-white py-2" onClick={() => setIsMenuOpen(false)}>Contact</Link>


                </div>
            )}
        </nav>
    );
};

export default Navbar;
