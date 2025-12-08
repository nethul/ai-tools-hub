import React, { useState, useEffect, useRef } from 'react';
import { searchMovies } from '../../services/tmdbService';
import { Movie } from '../../types';

interface InputChipsProps {
    movies: Movie[];
    setMovies: (movies: Movie[]) => void;
    onFocusInput?: () => void;
}

const XIcon: React.FC<{ className: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const FilmPlaceholderIcon: React.FC<{ className: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9A2.25 2.25 0 0 0 4.5 18.75Z" />
    </svg>
);


const InputChips: React.FC<InputChipsProps> = ({ movies, setMovies, onFocusInput }) => {
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState<Movie[]>([]);
    const [isSuggestionsLoading, setIsSuggestionsLoading] = useState<boolean>(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let isCancelled = false;
        if (inputValue.trim().length < 3) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const handler = setTimeout(async () => {
            setIsSuggestionsLoading(true);
            setShowSuggestions(true);
            try {
                const results = await searchMovies(inputValue);
                if (!isCancelled) {
                    setSuggestions(results);
                }
            } catch (error) {
                console.error("Failed to fetch movie suggestions:", error);
                if (!isCancelled) {
                    setSuggestions([]); // Clear suggestions on error
                }
            } finally {
                if (!isCancelled) {
                    setIsSuggestionsLoading(false);
                }
            }
        }, 300);

        return () => {
            clearTimeout(handler);
            isCancelled = true;
        };
    }, [inputValue]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const addMovie = (movie: Movie) => {
        if (movie && !movies.some(m => m.id === movie.id)) {
            setMovies([...movies, movie]);
        }
        setInputValue('');
        setShowSuggestions(false);
        setSuggestions([]);
    };

    const handleKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && inputValue.trim() !== '') {
            event.preventDefault();
            setShowSuggestions(false);
            setIsSuggestionsLoading(true);
            try {
                const results = await searchMovies(inputValue);
                if (results.length > 0) {
                    addMovie(results[0]);
                }
            } catch (error) {
                console.error("Failed to search for movie on Enter press:", error);
                // Optionally, you could set an error state here to show in the UI
            } finally {
                setIsSuggestionsLoading(false);
            }
        }
    };

    const removeMovie = (indexToRemove: number) => {
        setMovies(movies.filter((_, index) => index !== indexToRemove));
    };

    const handleSuggestionClick = (suggestion: Movie) => {
        addMovie(suggestion);
    };

    return (
        <div className="w-full relative" ref={containerRef}>
            <div className="flex flex-wrap items-center gap-2 p-2 bg-slate-800 border border-slate-600 rounded-lg focus-within:ring-2 focus-within:ring-violet-500 transition-shadow">
                {movies.map((movie, index) => (
                    <div key={movie.id} className="flex items-center gap-2 bg-violet-600 text-white text-sm font-medium pl-1 pr-3 py-1 rounded-full">
                        {movie.posterPath ? (
                            <img src={movie.posterPath} alt={movie.title} className="w-6 h-6 rounded-full object-cover" />
                        ) : (
                            <div className="w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center">
                                <FilmPlaceholderIcon className="w-4 h-4 text-violet-200" />
                            </div>
                        )}
                        <span>{movie.title}</span>
                        <button onClick={() => removeMovie(index)} className="focus:outline-none">
                            <XIcon className="w-4 h-4 text-violet-200 hover:text-white transition-colors" />
                        </button>
                    </div>
                ))}
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        if (inputValue.trim().length >= 3) setShowSuggestions(true);
                        // notify parent that the user focused the input (so parent can hide mock labels)
                        onFocusInput?.();
                    }}
                    placeholder={movies.length === 0 ? "Type a favorite movie and press Enter..." : "Add another..."}
                    className="flex-grow bg-transparent text-slate-200 placeholder-slate-400 focus:outline-none p-1 min-w-[200px]"
                    autoComplete="off"
                />
            </div>

            {showSuggestions && (
                <div className="absolute z-10 w-full mt-1 bg-slate-700 border border-slate-600 rounded-lg shadow-lg overflow-hidden animate-fade-in-sm">
                    {isSuggestionsLoading ? (
                        <div className="p-3 text-slate-400 text-sm">Searching...</div>
                    ) : suggestions.length > 0 ? (
                        <ul className="max-h-80 overflow-y-auto">
                            {suggestions.map((suggestion) => (
                                <li
                                    key={suggestion.id}
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className="p-2 hover:bg-violet-600 cursor-pointer text-slate-200 text-sm transition-colors duration-150 flex items-center"
                                >
                                    {suggestion.posterPath ? (
                                        <img src={suggestion.posterPath} alt={suggestion.title} className="w-10 h-[60px] object-cover mr-3 rounded" />
                                    ) : (
                                        <div className="w-10 h-[60px] bg-slate-600 rounded flex items-center justify-center mr-3 flex-shrink-0">
                                            <FilmPlaceholderIcon className="w-6 h-6 text-slate-400" />
                                        </div>
                                    )}
                                    <span className="font-medium">{suggestion.title}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        inputValue.trim().length >= 3 && <div className="p-3 text-slate-400 text-sm">No suggestions found.</div>
                    )}
                </div>
            )}
            <style>{`
          @keyframes fade-in-sm {
            from { opacity: 0; transform: translateY(-5px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-sm {
            animation: fade-in-sm 0.2s ease-out forwards;
          }
       `}</style>
        </div>
    );
};

export default InputChips;
