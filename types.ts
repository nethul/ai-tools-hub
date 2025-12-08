export interface Movie {
    id: number;
    title: string;
    posterPath: string | null;
    isMock?: boolean;
}

export interface MovieRecommendation {
    title: string;
    reason: string;
    match_reasons: string[];
    posterPath?: string | null;
    isMock?: boolean;
}

export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
}

export enum SummaryLength {
    SHORT = 'Short',
    MEDIUM = 'Medium',
    LONG = 'Detailed'
}

export enum SummaryFormat {
    PARAGRAPH = 'Paragraph',
    BULLET_POINTS = 'Bullet Points',
    TLDR = 'TL;DR'
}

export interface SummaryOptions {
    length: SummaryLength;
    format: SummaryFormat;
}


