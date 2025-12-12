import React from 'react';
import { ExternalLink, Globe } from 'lucide-react';
import { GroundingChunk } from './FactCheckTypes';

interface SourceCardProps {
    chunk: GroundingChunk;
    index: number;
}

export const SourceCard: React.FC<SourceCardProps> = ({ chunk, index }) => {
    if (!chunk.web?.uri) return null;

    let hostname = '';
    try {
        const url = new URL(chunk.web.uri);
        hostname = url.hostname.replace('www.', '');
    } catch (e) {
        hostname = 'unknown source';
    }

    return (
        <a
            href={chunk.web.uri}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col p-3 bg-slate-800 border border-slate-700 rounded-lg hover:border-blue-500/50 hover:shadow-sm transition-all duration-200"
        >
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <Globe className="w-3 h-3" />
                    {hostname}
                </div>
                <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-blue-400" />
            </div>
            <h4 className="text-sm font-medium text-slate-200 group-hover:text-blue-400 line-clamp-2 leading-snug">
                {chunk.web.title || chunk.web.uri}
            </h4>
        </a>
    );
};
