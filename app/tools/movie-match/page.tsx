'use client';

import React, { useState } from 'react';
import InputChips from '../../../components/movie-match/InputChips';
import MovieCard from '../../../components/movie-match/MovieCard';
import ShareRecommendations from '../../../components/movie-match/ShareRecommendations';
import Loader from '../../../components/movie-match/Loader';
import { getMovieRecommendations } from '../../../services/geminiService';
import { searchMovies } from '../../../services/tmdbService';
import { Movie, MovieRecommendation } from '../../../types';
import Link from 'next/link';

const FilmIcon: React.FC<{ className: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9A2.25 2.25 0 0 0 4.5 18.75Z" />
    </svg>
);

export default function MovieMatchPage() {
    const [movies, setMovies] = useState<Movie[]>([
        { id: 603, title: 'The Matrix (1999)', posterPath: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg', isMock: true },
        { id: 335984, title: 'Blade Runner 2049 (2017)', posterPath: 'https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg', isMock: true },
        { id: 550, title: 'Fight Club (1999)', posterPath: '/fight-club.jpeg', isMock: true }
    ]);
    const [recommendations, setRecommendations] = useState<MovieRecommendation[] | null>(null);
    const [showMocks, setShowMocks] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleGetRecommendations = async () => {
        if (movies.length < 2) {
            setError("Please add at least two movies for better recommendations.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setRecommendations(null);

        try {
            const geminiResults = await getMovieRecommendations(movies);

            const resultsWithPosters = await Promise.all(
                geminiResults.map(async (rec) => {
                    const searchResult = await searchMovies(rec.title.replace(/\\s\\(\\d{4}\\)$/, ''));
                    return {
                        ...rec,
                        posterPath: searchResult.length > 0 ? searchResult[0].posterPath : null,
                    };
                })
            );
            setRecommendations(resultsWithPosters);

        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const createMockRecommendations = (baseMovies: Movie[]): MovieRecommendation[] => {
        const examples: MovieRecommendation[] = [
            {
                title: 'Inception',
                reason: `You're drawn to narratives that challenge perception and immerse you in intricately constructed worlds, much like the simulated realities of 'The Matrix' and the complex moral landscapes of 'Blade Runner 2049'. 'Inception' will captivate you with its ingenious premise of dream-sharing and its relentless exploration of what is real, offering both thrilling action and profound intellectual puzzles.`,
                match_reasons: [
                    `Features a complex, non-linear narrative that blurs the lines between reality and simulation, reminiscent of 'The Matrix'.`,
                    `Explores deeply philosophical questions about identity, memory, and the nature of perceived reality, akin to 'Blade Runner 2049'.`,
                    `Delivers breathtaking visual effects and a meticulously crafted world that elevates the narrative beyond mere spectacle.`
                ],
                posterPath: '/inception.webp',
                isMock: true
            },
            {
                title: 'Dark City',
                reason: `Given your appreciation for the existential questions and manufactured realities in 'The Matrix' and the noir-infused dystopia of 'Blade Runner 2049', 'Dark City' is a quintessential experience. It masterfully weaves a tale of a man who wakes up in a city where reality is constantly being altered, forcing him to uncover the truth about himself and his world.`,
                match_reasons: [
                    `Presents a chilling dystopian setting and the revelation of a hidden, manufactured reality, strikingly similar to 'The Matrix'.`,
                    `Employs a brooding, atmospheric film noir aesthetic combined with existential dread, much like the world of 'Blade Runner 2049'.`,
                    `Features a protagonist grappling with fragmented memories and a lost identity in a sinister urban landscape, echoing themes from all three of your favorites.`
                ],
                posterPath: '/dark-city.webp',
                isMock: true
            },
            {
                title: 'Mr. Nobody',
                reason: `Your fascination with free will, identity, and the branching paths of existence evident in 'The Matrix' and 'Blade Runner 2049' will find a rich canvas in 'Mr. Nobody'. This visually stunning and emotionally resonant film delves into the myriad lives a single person could live, prompting deep reflection on choices, fate, and the nature of reality itself.`,
                match_reasons: [
                    `Explores profound philosophical concepts of free will, determinism, and the nature of choice, much like the underlying questions in 'The Matrix'.`,
                    `Offers a non-linear narrative and a protagonist grappling with multiple identities across divergent timelines, similar to the psychological complexity in 'Fight Club'.`,
                    `Boasts stunning, atmospheric visuals and a melancholic tone that resonates with the introspective quality of 'Blade Runner 2049'.`
                ],
                posterPath: '/mr.nobody.webp',
                isMock: true
            },
        ];

        return examples;
    };

    React.useEffect(() => {
        try {
            const params = new URLSearchParams(window.location.search);
            const shared = params.get('shared');
            if (shared) {
                const decoded = JSON.parse(decodeURIComponent(shared)) as MovieRecommendation[];
                if (decoded && Array.isArray(decoded) && decoded.length > 0) {
                    setRecommendations(decoded);
                }
            }
        } catch (e) {
            console.warn('Failed to parse shared recommendations from URL', e);
        }
    }, []);

    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('shared')) return;

        if (!recommendations && movies.length >= 2) {
            const mock = createMockRecommendations(movies);
            setRecommendations(mock);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="min-h-screen p-4 sm:p-6 md:p-8">
            <div id="top"></div>
            <div className="max-w-7xl mx-auto">
                {/* Back to home link */}
                <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-violet-400 transition-colors mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                    </svg>
                    <span>Back to Tools</span>
                </Link>

                <header className="text-center mb-8">
                    <div className="flex justify-center items-center gap-3 mb-2">
                        <FilmIcon className="w-10 h-10 text-violet-400" />
                        <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
                            Movie Match AI
                        </h1>
                    </div>
                    <p className="text-slate-400 max-w-2xl mx-auto">
                        Tell us what you love, and we'll find your next obsession. Our AI goes beyond genres to match the very soul of the movies you cherish.
                    </p>
                </header>

                <main>
                    <div className="bg-slate-800/50 p-6 rounded-xl shadow-2xl border border-slate-700 mb-8">
                        <label className="block text-lg font-semibold text-slate-200 mb-3">
                            Enter your all-time favorite movies
                        </label>
                        <InputChips movies={movies} setMovies={setMovies} onFocusInput={() => { setShowMocks(false); setMovies(prev => prev.filter(m => !(m as any).isMock)); }} />
                        <button
                            onClick={handleGetRecommendations}
                            disabled={isLoading || movies.length === 0}
                            className="mt-6 w-full bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-bold py-3 px-4 rounded-lg hover:from-violet-700 hover:to-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-violet-500/30"
                        >
                            {isLoading ? 'Analyzing Your Taste...' : 'Find My Next Binge'}
                        </button>
                    </div>

                    <div className="mt-10">
                        {isLoading && <Loader />}
                        {error && <p className="text-center text-red-400 bg-red-900/50 p-4 rounded-lg">{error}</p>}

                        {!isLoading && !recommendations && !error && (
                            <div className="text-center text-slate-500">
                                <p>Your personalized movie recommendations will appear here.</p>
                            </div>
                        )}

                        {recommendations && !(recommendations.every(r => (r as any).isMock) && !showMocks) && (
                            <>
                                <div className="mb-10">
                                    <h2 className="text-2xl font-semibold text-slate-200 mb-4 justify-center flex">
                                        Your Movie Recommendations
                                    </h2>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                                    {recommendations.map((rec, index) => (
                                        <MovieCard key={index} recommendation={rec} />
                                    ))}
                                </div>

                                <ShareRecommendations recommendations={recommendations} />
                            </>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
