'use client';

import React, { useState, useCallback } from 'react';
import { uploadFileAndCreateStore } from '../../app/actions/chatDocsActions';

interface FileUploaderProps {
    onUploadComplete: (storeName: string) => void;
}

export default function FileUploader({ onUploadComplete }: FileUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleUpload(files[0]);
        }
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleUpload(e.target.files[0]);
        }
    };

    const handleUpload = async (file: File) => {
        // Basic validation
        if (!file.type.includes('text') && !file.type.includes('pdf')) {
            setError("Please upload a PDF or text file.");
            return;
        }

        if (file.size > 50 * 1024 * 1024) {
            setError("File size exceeds the 50MB limit.");
            return;
        }

        setIsUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const result = await uploadFileAndCreateStore(formData);
            if (result.success && result.storeName) {
                onUploadComplete(result.storeName);
            } else {
                setError(result.error || "Failed to upload file.");
            }
        } catch (err: any) {
            console.error("Upload error:", err);
            if (err.message === "Failed to fetch") {
                setError("Network error: Failed to send file. It might be too large or the server is unreachable.");
            } else {
                setError(err.message || "An unexpected error occurred.");
            }
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="w-full max-w-xl mx-auto">
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                    relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300
                    ${isDragging
                        ? 'border-violet-500 bg-violet-500/10 scale-[1.02]'
                        : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                    }
                `}
            >
                <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileSelect}
                    disabled={isUploading}
                />

                <div className="flex flex-col items-center gap-4">
                    <div className={`p-4 rounded-full bg-slate-800 ${isUploading ? 'animate-pulse' : ''}`}>
                        {isUploading ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-violet-400 animate-spin">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-slate-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                            </svg>
                        )}
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-slate-200 mb-1">
                            {isUploading ? 'Processing Document...' : 'Upload a Document'}
                        </h3>
                        <p className="text-slate-400 text-sm mb-4">
                            {isUploading
                                ? 'We are indexing your file for search. This may take a moment.'
                                : 'Drag & drop or click to browse (PDF, TXT, MD). Max 50MB, ~1000 pages.'
                            }
                        </p>
                    </div>

                    {!isUploading && (
                        <label
                            htmlFor="file-upload"
                            className="cursor-pointer bg-violet-600 hover:bg-violet-500 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-violet-500/20"
                        >
                            Select File
                        </label>
                    )}
                </div>
            </div>

            {error && (
                <div className="mt-4 p-4 bg-red-900/20 border border-red-900/50 rounded-xl text-red-200 text-sm text-center animate-fade-in">
                    {error}
                </div>
            )}
        </div>
    );
}
