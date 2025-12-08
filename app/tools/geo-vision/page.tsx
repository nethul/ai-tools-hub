'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Coordinates, ImageResult, generateLocationImage } from '../../../services/geoVisionService';
import { ImageDisplay } from '../../../components/geo-vision/ImageDisplay';

// Icons
const GlobeIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
);

const MapPinIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
);

const SparklesIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
    </svg>
);

const RefreshIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
);

const AlertIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
    </svg>
);

export default function GeoVisionPage() {
    const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
    const [isLocating, setIsLocating] = useState<boolean>(false);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [imageResult, setImageResult] = useState<ImageResult | null>(null);
    const [error, setError] = useState<{ message: string } | null>(null);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const getLocation = () => {
        setIsLocating(true);
        setError(null);
        setImageResult(null);

        if (!navigator.geolocation) {
            setError({ message: "Geolocation is not supported by your browser." });
            setIsLocating(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCoordinates({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
                setIsLocating(false);
            },
            (geoError) => {
                let msg = "Unable to retrieve your location.";
                if (geoError.code === geoError.PERMISSION_DENIED) {
                    msg = "Location permission denied. Please allow access to use this tool.";
                }
                setError({ message: msg });
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const handleGenerate = async () => {
        if (!coordinates) return;

        setIsGenerating(true);
        setError(null);

        try {
            const result = await generateLocationImage(coordinates);
            setImageResult(result);
        } catch (err: any) {
            setError({ message: err.message || "Failed to generate image." });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen p-4 sm:p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Back Link */}
                <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors mb-8 group">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:-translate-x-1 transition-transform">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                    </svg>
                    <span>Back to Tools</span>
                </Link>

                {/* Header */}
                <header className="mb-12 text-center space-y-4">
                    <div className="inline-flex items-center justify-center p-3 bg-slate-800/80 rounded-2xl shadow-xl ring-1 ring-slate-700 mb-4 backdrop-blur-md">
                        <GlobeIcon className="w-8 h-8 text-cyan-400 mr-3" />
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                            GeoVision AI
                        </h1>
                    </div>
                    <p className="text-slate-400 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
                        Experience your surroundings through the lens of Gemini.
                        We fetch your precise location and generate a photorealistic preview of the terrain.
                    </p>
                </header>

                {/* Main Content */}
                <main className="space-y-8">
                    <div className="space-y-8 animate-fade-in">

                        {/* Location Card */}
                        <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className={`p-3 rounded-full ${coordinates ? 'bg-green-500/10 text-green-400' : 'bg-slate-700 text-slate-500'}`}>
                                    <MapPinIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-white">Your Location</h2>
                                    <p className="text-sm text-slate-400 font-mono">
                                        {coordinates
                                            ? `${coordinates.latitude.toFixed(4)}, ${coordinates.longitude.toFixed(4)}`
                                            : "Waiting for coordinates..."}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                                {!coordinates ? (
                                    <button
                                        onClick={getLocation}
                                        disabled={isLocating}
                                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-cyan-500/25 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isLocating ? (
                                            <>
                                                <RefreshIcon className="w-5 h-5 animate-spin" />
                                                Locating...
                                            </>
                                        ) : (
                                            <>
                                                <MapPinIcon className="w-5 h-5" />
                                                Get Coordinates
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={getLocation}
                                            disabled={isLocating}
                                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-all border border-slate-600 disabled:opacity-70"
                                            title="Update Location"
                                        >
                                            <RefreshIcon className={`w-5 h-5 ${isLocating ? 'animate-spin' : ''}`} />
                                            Update
                                        </button>
                                        <button
                                            onClick={handleGenerate}
                                            disabled={isGenerating}
                                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-violet-500/25 disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {isGenerating ? (
                                                <>
                                                    <SparklesIcon className="w-5 h-5 animate-spin" />
                                                    Generating...
                                                </>
                                            ) : (
                                                <>
                                                    <SparklesIcon className="w-5 h-5" />
                                                    Generate Vision
                                                </>
                                            )}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Error Display */}
                        {error && (
                            <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-xl flex items-start gap-3 text-red-200 text-sm animate-fade-in">
                                <AlertIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <p>{error.message}</p>
                            </div>
                        )}

                        {/* Result Display */}
                        {imageResult && (
                            <ImageDisplay result={imageResult} />
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
