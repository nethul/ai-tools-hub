import React from 'react';

const Hero: React.FC = () => {
    return (
        <section className="relative py-20 md:py-32 px-4 overflow-hidden">
            {/* Background gradient effects */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-5xl mx-auto text-center animate-fade-in">
                <h1 className="text-5xl sm:text-6xl md:text-7xl font-semibold mb-6 font-space-grotesk">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400">
                        Discover AI Tools
                    </span>
                    <br />
                    <span className="text-white font-semibold text-6xl">
                        That Make Your Life Easier
                    </span>
                </h1>
                <p className="text-slate-400 text-lg md:text-xl max-w-3xl mx-auto mb-10 leading-relaxed">
                    Expertly curated AI tools to boost your productivity, creativity, and decision-making.
                    Find and evaluate the right solutions for you.
                </p>
                <a
                    href="#tools"
                    className="inline-block bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-semibold px-8 py-3 rounded-lg hover:from-violet-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-violet-500/50"
                >
                    Explore Tools
                </a>
            </div>
        </section>
    );
};

export default Hero;
