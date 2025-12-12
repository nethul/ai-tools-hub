import React from 'react';
import Link from 'next/link';

interface Tool {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    href: string;
    gradient?: string;
}

const tools: Tool[] = [
    {
        id: 'movie-match',
        title: 'Movie Match AI',
        description: 'Get personalized movie recommendations powered by AI. Discover films that match your unique taste.',
        icon: (
            <img src={"/moviematch_logo.png"}></img>
        ),
        href: '/tools/movie-match',
        gradient: 'from-violet-500 to-purple-500'
    },
    {
        id: 'geo-vision',
        title: 'GeoVision AI',
        description: 'Visualize any location on Earth with AI. Generate photorealistic previews based on coordinates.',
        icon: (
            <img src={"/geovision_logo.png"}></img>
        ),
        href: '/tools/geo-vision',
    },
    {
        id: 'chat-docs',
        title: 'Chat with Docs',
        description: 'Upload documents and chat with them instantly. AI-powered understanding for your PDFs and text files.',
        icon: (
            <img src={"/chatdocs_logo.png"}></img>
        ),
        href: '/tools/chat-with-your-docs',

    },
    {
        id: 'text-humanizer',
        title: 'Text Humanizer',
        description: 'Make AI-generated text sound natural and human. Visualize changes instantly with smart diffs.',
        icon: (
            <img src={"/texthumanizer_logo.png"} className="w-full h-full object-cover"></img>
        ),
        href: '/tools/humanizer',

    },
    {
        id: 'text-summarizer',
        title: 'Text Summarizer',
        description: 'Transform long text into concise summaries. Choose your preferred length and format.',
        icon: (
            <img src={"/textsummarizer_logo.png"}></img>
        ),
        href: '/tools/text-summarizer',
        gradient: 'from-indigo-500 to-violet-500'
    },
    {
        id: 'fact-checker',
        title: 'Veritas Fact Checker',
        description: 'Verify claims and rumors with AI. Cross-reference millions of sources to separate fact from fiction.',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-check w-full h-full p-2"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" /></svg>
        ),
        href: '/tools/fact-checker',
        gradient: 'from-violet-500 to-cyan-400'
    },
    {
        id: 'mock-data',
        title: 'Mock Data Generator',
        description: 'Generate realistic test data with AI scripts. Define schemas and export Custom CSV/Excel files.',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-database w-full h-full p-2"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg>
        ),
        href: '/tools/mock-data',
        gradient: 'from-fuchsia-500 to-pink-500'
    },

];

const ToolsGrid: React.FC = () => {
    return (
        <section id="tools" className="py-16 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-200 mb-4">
                        Available AI Tools
                    </h2>
                    <p className="text-slate-400 max-w-2xl mx-auto">
                        Explore our collection of AI-powered tools designed to enhance your workflow
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tools.map((tool) => (
                        <Link
                            key={tool.id}
                            href={tool.href}
                            className="group block bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-violet-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/20 hover:-translate-y-1"
                        >
                            <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${tool.gradient} flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform duration-300`}>
                                {tool.icon}
                            </div>
                            <h3 className="text-xl font-semibold text-slate-200 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-violet-400 group-hover:to-cyan-400 transition-all">
                                {tool.title}
                            </h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                {tool.description}
                            </p>
                            <div className="mt-4 flex items-center text-violet-400 text-sm font-medium">
                                <span>Try it now</span>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                </svg>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ToolsGrid;
