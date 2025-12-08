import React from 'react';
import { ImageResult } from '../../services/geoVisionService';

interface ImageDisplayProps {
    result: ImageResult;
}

const DownloadIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M12 12.75l-3-3m0 0 3-3m-3 3h7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v13.5" />
        {/* Fixed download icon path */}
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M7.5 10.5l4.5 4.5 4.5-4.5M12 15V3" />
    </svg>
);

const MaximizeIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
    </svg>
);

const ExternalLinkIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
);

export const ImageDisplay: React.FC<ImageDisplayProps> = ({ result }) => {
    return (
        <div className="w-full animate-fade-in">
            <div className="group relative overflow-hidden rounded-2xl bg-slate-800 border border-slate-700 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

                <img
                    src={result.imageUrl}
                    alt="Generated Location"
                    className="w-full h-auto object-cover max-h-[70vh]"
                />

                <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20 flex justify-between items-end">
                    <div>
                        <h3 className="text-white font-semibold text-lg mb-1">Generated View</h3>
                        <p className="text-slate-300 text-xs max-w-md line-clamp-2">
                            AI Visualization
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <a
                            href={result.imageUrl}
                            download="geovision-generated.png"
                            className="p-2 bg-slate-800/50 hover:bg-slate-700/80 backdrop-blur-md rounded-lg text-white transition-colors border border-slate-600"
                            title="Download"
                        >
                            <DownloadIcon className="w-5 h-5" />
                        </a>
                        <button
                            className="p-2 bg-slate-800/50 hover:bg-slate-700/80 backdrop-blur-md rounded-lg text-white transition-colors border border-slate-600"
                            onClick={() => window.open(result.imageUrl, '_blank')}
                            title="Open Fullscreen"
                        >
                            <MaximizeIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {result.description && (
                <div className="mt-6 p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
                    <p className="text-slate-300 text-sm leading-relaxed italic">
                        "{result.description}"
                    </p>
                </div>
            )}

            {result.sources && result.sources.length > 0 && (
                <div className="mt-4">
                    <h4 className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-2">Sources</h4>
                    <div className="flex flex-wrap gap-2">
                        {result.sources.map((source, idx) => (
                            <a
                                key={idx}
                                href={source.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:border-slate-600 text-xs text-cyan-400 transition-colors"
                            >
                                <span className="truncate max-w-[200px]">{source.title || source.uri}</span>
                                <ExternalLinkIcon className="w-3 h-3 ml-2 opacity-50" />
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
