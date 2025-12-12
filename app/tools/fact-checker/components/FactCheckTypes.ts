export interface GroundingChunk {
    web?: {
        uri: string;
        title: string;
    };
}

export interface FactCheckResult {
    text: string;
    groundingChunks: GroundingChunk[];
    verdict?: 'True' | 'False' | 'Misleading' | 'Unverified' | 'Mixed';
}

export enum AppStatus {
    IDLE = 'IDLE',
    ANALYZING = 'ANALYZING',
    SUCCESS = 'SUCCESS',
    ERROR = 'ERROR',
}

export interface AnalysisRequest {
    text: string;
    image?: File | null;
}
