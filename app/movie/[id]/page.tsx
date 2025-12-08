import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getMovieDetails, getMovieCredits } from '../../../services/tmdbService';

export const revalidate = 3600; // Revalidate every hour

export default async function MovieDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const movieId = parseInt(id);

    if (isNaN(movieId)) {
        notFound();
    }

    let movie, cast;

    try {
        [movie, cast] = await Promise.all([
            getMovieDetails(movieId),
            getMovieCredits(movieId)
        ]);
    } catch (error) {
        console.error('Error fetching movie details:', error);
        return (
            <main className="min-h-screen bg-slate-950 text-slate-200 py-24 px-4 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-400 mb-4">Error Loading Movie</h1>
                    <p className="text-slate-400 mb-6">We couldn't load the details for this movie. Please try again later.</p>
                    <Link
                        href="/tools/movie-match"
                        className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white transition-colors"
                    >
                        Back to Movie Match
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-950 text-slate-200 py-24 px-4">
            <div className="max-w-7xl mx-auto">
                <Link
                    href="/tools/movie-match"
                    className="inline-flex items-center text-sm text-slate-400 hover:text-violet-400 transition-colors mb-8"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-4 h-4 mr-1"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                        />
                    </svg>
                    Back to Movie Match
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Sidebar with Poster */}
                    <div className="lg:col-span-1">
                        <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden shadow-2xl shadow-violet-500/10 border border-slate-800">
                            {movie.posterPath ? (
                                <Image
                                    src={movie.posterPath}
                                    alt={movie.title}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            ) : (
                                <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-500">
                                    No Poster Available
                                </div>
                            )}
                        </div>

                        {movie.tagline && (
                            <p className="mt-6 text-center text-lg text-violet-200 italic font-medium">
                                "{movie.tagline}"
                            </p>
                        )}
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            {movie.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-8">
                            {movie.releaseDate && (
                                <span className="bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                                    {new Date(movie.releaseDate).getFullYear()}
                                </span>
                            )}
                            {movie.runtime && (
                                <span className="bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                                    {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                                </span>
                            )}
                            {movie.voteAverage && (
                                <span className="bg-slate-900 px-3 py-1 rounded-full border border-slate-800 flex items-center gap-1 text-yellow-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                                    </svg>
                                    {movie.voteAverage.toFixed(1)}
                                </span>
                            )}
                        </div>

                        <div className="mb-8">
                            <h2 className="text-xl font-semibold text-white mb-3">Overview</h2>
                            <p className="text-slate-300 leading-relaxed text-lg">
                                {movie.overview}
                            </p>
                        </div>

                        <div className="mb-8">
                            <h2 className="text-xl font-semibold text-white mb-3">Genres</h2>
                            <div className="flex flex-wrap gap-2">
                                {movie.genres.map(genre => (
                                    <span key={genre.id} className="text-sm text-cyan-400 bg-cyan-950/30 px-3 py-1 rounded-full border border-cyan-900/50">
                                        {genre.name}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-white mb-4">Top Cast</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {cast.map(person => (
                                    <div key={person.id} className="bg-slate-900/50 rounded-xl p-3 border border-slate-800">
                                        <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-3 bg-slate-800">
                                            {person.profilePath ? (
                                                <Image
                                                    src={person.profilePath}
                                                    alt={person.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-600">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <p className="font-medium text-slate-200 text-sm truncate">{person.name}</p>
                                        <p className="text-xs text-slate-500 truncate">{person.character}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
