
import { GoogleGenAI, Type } from "@google/genai";
import { Movie, MovieRecommendation } from '../types';

// Helper function to sleep for a given number of milliseconds
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to check if error is retryable
const isRetryableError = (error: any): boolean => {
    // Check for 503, 429, or temporary errors
    if (error?.error?.code === 503 || error?.error?.status === 'UNAVAILABLE') {
        return true;
    }
    if (error?.error?.code === 429) {
        return true;
    }
    // Check for network errors that might be transient
    if (error?.message?.includes('ECONNRESET') || error?.message?.includes('ETIMEDOUT')) {
        return true;
    }
    return false;
};

// Retry wrapper with exponential backoff
async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 1000
): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            // Don't retry on the last attempt or if error is not retryable
            if (attempt === maxRetries || !isRetryableError(error)) {
                throw error;
            }

            // Calculate exponential backoff delay
            const delay = initialDelay * Math.pow(2, attempt);
            console.log(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
            await sleep(delay);
        }
    }

    throw lastError;
}

// Helper to try multiple models as fallback
async function tryModelsWithFallback<T>(
    models: string[],
    fn: (model: string) => Promise<T>,
    maxRetries: number = 2
): Promise<T> {
    let lastError: any;

    for (const model of models) {
        try {
            console.log(`Trying model: ${model}`);
            return await retryWithBackoff(() => fn(model), maxRetries);
        } catch (error) {
            console.log(`Model ${model} failed:`, error);
            lastError = error;
            // Continue to next model
        }
    }

    // All models failed
    throw lastError;
}

export const getMovieRecommendations = async (movies: Movie[]): Promise<MovieRecommendation[]> => {
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

    const movieList = movies.map(movie => `- ${movie.title}`).join('\n');
    const prompt = `
    You are an expert film recommender. Analyze the user's favorite movies and identify underlying themes, tones, directorial styles, narrative structures, and emotional currents. Do not just match by genre, actors, or popularity.
Based on this analysis, generate **5 unique movie recommendations** the user will likely love but might not have discovered. 
Return the result as a JSON array of objects with this structure:

[
  {
    "title": "Movie Title",
    "reason": "2-3 sentence explanation connecting the recommendation to the user's taste.",
    "match_reasons": [
      "Brief bullet point connecting to a feature of a favorite movie.",
      "Another short bullet point highlighting a shared quality."
    ]
  }
]

User's favorite movies:
${movieList}

Return **only valid JSON**, do not include any explanation or extra text.
  `;

    try {
        // Try models in order: latest first, then fallback to older stable version
        const models = ["gemini-2.5-flash", "gemini-2.0-flash-001"];

        const response = await tryModelsWithFallback(models, async (model: string) => {
            return await ai.models.generateContent({
                model: model,
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: {
                                    type: Type.STRING,
                                    description: "The title of the recommended movie."
                                },
                                reason: {
                                    type: Type.STRING,
                                    description: "A short, compelling paragraph explaining why the user will like this movie based on their favorites."
                                },
                                match_reasons: {
                                    type: Type.ARRAY,
                                    description: "A list of specific features matching the user's favorite movies.",
                                    items: {
                                        type: Type.STRING
                                    }
                                }
                            },
                            required: ["title", "reason", "match_reasons"],
                        },
                    },
                },
            });
        });

        if (!response.text) {
            throw new Error("No text returned from Gemini API");
        }
        const jsonText = response.text.trim();
        const recommendations: MovieRecommendation[] = JSON.parse(jsonText);
        return recommendations;

    } catch (error) {
        console.error("Error fetching recommendations:", error);

        // Provide more user-friendly error messages
        if (error && typeof error === 'object' && 'error' in error) {
            const apiError = (error as any).error;

            if (apiError.code === 503 || apiError.status === 'UNAVAILABLE') {
                throw new Error("The AI service is temporarily overloaded. Please try again in a moment.");
            }

            if (apiError.code === 429) {
                throw new Error("Too many requests. Please wait a moment and try again.");
            }

            if (apiError.message) {
                throw new Error(`AI service error: ${apiError.message}`);
            }
        }

        if (error instanceof Error) {
            throw new Error(`Failed to get recommendations from Gemini API: ${error.message}`);
        }
        throw new Error("An unknown error occurred while fetching recommendations.");
    }
};
