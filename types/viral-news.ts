export interface NewsSource {
    title: string;
    uri: string;
}

export interface NewsArticle {
    id: string;
    headline: string;
    summary: string;
    viralScore: number; // 1-100
    tags: string[];
    sources: NewsSource[];
    enhancedContent?: {
        fbPost: string;
        hashtags: string[];
        seoKeywords: string[];
        generatedImage?: string;
    };
}

export enum FetchState {
    IDLE = 'IDLE',
    LOADING = 'LOADING',
    SUCCESS = 'SUCCESS',
    ERROR = 'ERROR',
}
