import { Movie } from '../types';

// Use Next.js client-side env values.
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || '';
const API_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const TMDB_PROFILE_BASE_URL = 'https://image.tmdb.org/t/p/w185';

interface TmdbMovie {
    id: number;
    title: string;
    poster_path: string | null;
    release_date: string;
}

export const searchMovies = async (query: string): Promise<Movie[]> => {
    if (!TMDB_API_KEY) {
        throw new Error("TMDb API key is not configured. Please set the NEXT_PUBLIC_TMDB_API_KEY environment variable in your .env.local file.");
    }

    if (query.trim().length < 2) {
        return [];
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`
        );

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Could not retrieve error details.');
            throw new Error(`TMDb API error: ${response.status} ${response.statusText}. Details: ${errorText}`);
        }

        const data = await response.json();
        const movies: TmdbMovie[] = data.results;

        // Add year to title for clarity and sort by popularity
        return movies
            .map(movie => ({
                id: movie.id,
                title: movie.release_date ? `${movie.title} (${movie.release_date.substring(0, 4)})` : movie.title,
                posterPath: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : null,
            }))
            .slice(0, 5); // Return top 5 results

    } catch (error) {
        console.error("Failed to search movies on TMDb:", error);
        // Propagate the error to the caller so the UI can handle it properly.
        throw error;
    }
};

export interface MovieDetails {
    id: number;
    title: string;
    overview: string;
    posterPath: string | null;
    backdropPath: string | null;
    releaseDate: string | null;
    runtime: number | null;
    genres: { id: number; name: string }[];
    voteAverage: number | null;
    tagline: string | null;
}

export const getMovieDetails = async (id: number): Promise<MovieDetails> => {
    if (!TMDB_API_KEY) {
        throw new Error("TMDb API key is not configured. Please set the NEXT_PUBLIC_TMDB_API_KEY environment variable in your .env.local file.");
    }

    const response = await fetch(`${API_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&language=en-US`);
    if (!response.ok) {
        const errorText = await response.text().catch(() => 'Could not retrieve error details.');
        throw new Error(`TMDb API error: ${response.status} ${response.statusText}. Details: ${errorText}`);
    }

    const data = await response.json();
    return {
        id: data.id,
        title: data.title,
        overview: data.overview ?? '',
        posterPath: data.poster_path ? `${TMDB_IMAGE_BASE_URL}${data.poster_path}` : null,
        backdropPath: data.backdrop_path ? `${TMDB_IMAGE_BASE_URL}${data.backdrop_path}` : null,
        releaseDate: data.release_date ?? null,
        runtime: typeof data.runtime === 'number' ? data.runtime : null,
        genres: Array.isArray(data.genres) ? data.genres : [],
        voteAverage: typeof data.vote_average === 'number' ? data.vote_average : null,
        tagline: data.tagline ?? null,
    };
};

export const findFirstByTitle = async (title: string): Promise<Movie | null> => {
    const results = await searchMovies(title.replace(/\s\(\d{4}\)$/, ''));
    return results.length > 0 ? results[0] : null;
};

export interface CastMember {
    id: number;
    name: string;
    character: string | null;
    profilePath: string | null;
    order: number;
}

export const getMovieCredits = async (id: number): Promise<CastMember[]> => {
    if (!TMDB_API_KEY) {
        throw new Error("TMDb API key is not configured. Please set the NEXT_PUBLIC_TMDB_API_KEY environment variable in your .env.local file.");
    }

    const response = await fetch(`${API_BASE_URL}/movie/${id}/credits?api_key=${TMDB_API_KEY}&language=en-US`);
    if (!response.ok) {
        const errorText = await response.text().catch(() => 'Could not retrieve error details.');
        throw new Error(`TMDb API error: ${response.status} ${response.statusText}. Details: ${errorText}`);
    }

    const data = await response.json();
    const cast = Array.isArray(data.cast) ? data.cast : [];
    return cast
        .map((person: any) => ({
            id: person.id,
            name: person.name,
            character: person.character ?? null,
            profilePath: person.profile_path ? `${TMDB_PROFILE_BASE_URL}${person.profile_path}` : null,
            order: typeof person.order === 'number' ? person.order : 9999,
        }))
        .sort((a: CastMember, b: CastMember) => a.order - b.order)
        .slice(0, 12);
};
