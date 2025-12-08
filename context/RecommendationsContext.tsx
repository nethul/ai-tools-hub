'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Movie, MovieRecommendation } from '../types';

interface RecommendationsContextType {
    movies: Movie[];
    setMovies: React.Dispatch<React.SetStateAction<Movie[]>>;
    recommendations: MovieRecommendation[] | null;
    setRecommendations: React.Dispatch<React.SetStateAction<MovieRecommendation[] | null>>;
}

const RecommendationsContext = createContext<RecommendationsContextType | undefined>(undefined);

export const RecommendationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [movies, setMovies] = useState<Movie[]>([
        { id: 603, title: 'The Matrix (1999)', posterPath: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg', isMock: true },
        { id: 335984, title: 'Blade Runner 2049 (2017)', posterPath: 'https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg', isMock: true },
        { id: 550, title: 'Fight Club (1999)', posterPath: '/fight-club.jpeg', isMock: true }
    ]);
    const [recommendations, setRecommendations] = useState<MovieRecommendation[] | null>(null);

    return (
        <RecommendationsContext.Provider value={{ movies, setMovies, recommendations, setRecommendations }}>
            {children}
        </RecommendationsContext.Provider>
    );
};

export const useRecommendations = () => {
    const context = useContext(RecommendationsContext);
    if (context === undefined) {
        throw new Error('useRecommendations must be used within a RecommendationsProvider');
    }
    return context;
};
