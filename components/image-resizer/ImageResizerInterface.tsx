'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Download, Upload, RefreshCw, Smartphone, Monitor } from 'lucide-react';
import * as fileSaver from 'file-saver';

interface ImageDimensions {
    width: number;
    height: number;
}

const ImageResizerInterface = () => {
    const [file, setFile] = useState<File | null>(null);
    const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
    const [originalDimensions, setOriginalDimensions] = useState<ImageDimensions>({ width: 0, height: 0 });
    const [targetDimensions, setTargetDimensions] = useState<ImageDimensions>({ width: 0, height: 0 });
    const [lockAspectRatio, setLockAspectRatio] = useState(true);
    const [format, setFormat] = useState('image/jpeg');
    const [quality, setQuality] = useState(0.9);
    const [smartEnhance, setSmartEnhance] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Initial image load
    useEffect(() => {
        if (!file) return;

        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            setOriginalImage(img);
            setOriginalDimensions({ width: img.width, height: img.height });
            setTargetDimensions({ width: img.width, height: img.height });
        };

        return () => {
            URL.revokeObjectURL(img.src);
        };
    }, [file]);

    // Handle Dimension Changes
    const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newWidth = parseInt(e.target.value) || 0;
        setTargetDimensions(prev => ({
            width: newWidth,
            height: lockAspectRatio ? Math.round(newWidth * (originalDimensions.height / originalDimensions.width)) : prev.height
        }));
    };

    const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newHeight = parseInt(e.target.value) || 0;
        setTargetDimensions(prev => ({
            width: lockAspectRatio ? Math.round(newHeight * (originalDimensions.width / originalDimensions.height)) : prev.width,
            height: newHeight
        }));
    };

    // Processing Logic
    const processImage = useCallback(() => {
        if (!originalImage || !canvasRef.current || targetDimensions.width === 0 || targetDimensions.height === 0) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set dimensions
        canvas.width = targetDimensions.width;
        canvas.height = targetDimensions.height;

        // Draw original image resized
        // For better quality downsizing, we could use stepping, but browser canvas is okay for basic usage
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(originalImage, 0, 0, targetDimensions.width, targetDimensions.height);

        // "Smart Enhance" - Simple Sharpening / Contrast
        if (smartEnhance) {
            // Get pixel data
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // Simple contrast increase
            const factor = (259 * (128 + 25)) / (255 * (259 - 25)); // contrast factor

            for (let i = 0; i < data.length; i += 4) {
                data[i] = factor * (data[i] - 128) + 128;     // R
                data[i + 1] = factor * (data[i + 1] - 128) + 128; // G
                data[i + 2] = factor * (data[i + 2] - 128) + 128; // B
            }
            ctx.putImageData(imageData, 0, 0);
        }

        // Generate preview
        const dataUrl = canvas.toDataURL(format, quality);
        setPreviewUrl(dataUrl);

    }, [originalImage, targetDimensions, format, quality, smartEnhance]);

    // Debounce processing for preview
    useEffect(() => {
        if (originalImage) {
            const timer = setTimeout(() => {
                processImage();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [processImage, originalImage, targetDimensions, format, quality, smartEnhance]);


    const handleDownload = () => {
        if (!previewUrl) return;
        const ext = format.split('/')[1];
        fileSaver.saveAs(previewUrl, `resized-image.${ext}`);
    };

    // Drag and Drop
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <canvas ref={canvasRef} className="hidden" />

            <div className="flex flex-col lg:flex-row gap-8 min-h-[600px]">

                {/* Visualizer / Preview Area */}
                <div
                    className="flex-1 bg-slate-900 border-2 border-dashed border-slate-700 rounded-2xl flex items-center justify-center p-8 relative overflow-hidden transition-all hover:border-slate-600"
                    onDrop={handleDrop}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                >
                    {!originalImage ? (
                        <div className="text-center">
                            <Upload className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                            <p className="text-slate-300 text-lg font-medium mb-2">Drag & Drop your image here</p>
                            <p className="text-slate-500 text-sm mb-6">Supports JPG, PNG, WEBP</p>
                            <label className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2.5 rounded-full cursor-pointer hover:shadow-lg hover:shadow-cyan-500/20 transition-all font-medium">
                                Browse Files
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files && setFile(e.target.files[0])} />
                            </label>
                        </div>
                    ) : (
                        <div className="relative w-full h-full flex items-center justify-center">
                            {previewUrl && (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="max-w-full max-h-[600px] object-contain shadow-2xl rounded-lg"
                                />
                            )}
                            <button
                                onClick={() => { setFile(null); setPreviewUrl(null); setOriginalImage(null); }}
                                className="absolute top-4 right-4 bg-slate-800/80 p-2 rounded-full text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                            >
                                <RefreshCw className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Controls Sidebar */}
                <div className="w-full lg:w-96 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-6 shadow-xl">
                    <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
                        Settings
                    </h2>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-slate-500 mb-1.5 uppercase font-bold tracking-wider">Width (px)</label>
                                <input
                                    type="number"
                                    value={targetDimensions.width}
                                    onChange={handleWidthChange}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-cyan-500 transition-colors font-mono"
                                    disabled={!originalImage}
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 mb-1.5 uppercase font-bold tracking-wider">Height (px)</label>
                                <input
                                    type="number"
                                    value={targetDimensions.height}
                                    onChange={handleHeightChange}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-cyan-500 transition-colors font-mono"
                                    disabled={!originalImage}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="aspect"
                                checked={lockAspectRatio}
                                onChange={(e) => setLockAspectRatio(e.target.checked)}
                                className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-offset-slate-900 focus:ring-cyan-500"
                            />
                            <label htmlFor="aspect" className="text-sm text-slate-400 select-none cursor-pointer">Lock Aspect Ratio</label>
                        </div>
                    </div>

                    <div className="h-px bg-slate-800 my-2" />

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs text-slate-500 mb-1.5 uppercase font-bold tracking-wider">Format</label>
                            <select
                                value={format}
                                onChange={(e) => setFormat(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-cyan-500 transition-colors appearance-none"
                                disabled={!originalImage}
                            >
                                <option value="image/jpeg">JPEG</option>
                                <option value="image/png">PNG</option>
                                <option value="image/webp">WEBP</option>
                            </select>
                        </div>

                        {format !== 'image/png' && (
                            <div>
                                <div className="flex justify-between mb-1.5">
                                    <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">Quality</label>
                                    <span className="text-xs text-cyan-400 font-mono">{Math.round(quality * 100)}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0.1"
                                    max="1"
                                    step="0.05"
                                    value={quality}
                                    onChange={(e) => setQuality(parseFloat(e.target.value))}
                                    className="w-full accent-cyan-500"
                                    disabled={!originalImage}
                                />
                            </div>
                        )}

                    </div>

                    <div className="h-px bg-slate-800 my-2" />

                    {/* AI Feature */}
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-slate-700/50">
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-slate-300 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                                Smart Enhance
                            </span>
                            <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-700 transition-colors focus-within:ring-2 focus-within:ring-cyan-500 focus-within:ring-offset-2 focus-within:ring-offset-slate-900">
                                <input
                                    type="checkbox"
                                    className="peer sr-only"
                                    id="enhance"
                                    checked={smartEnhance}
                                    onChange={(e) => setSmartEnhance(e.target.checked)}
                                    disabled={!originalImage}
                                />
                                <label
                                    htmlFor="enhance"
                                    className={`absolute cursor-pointer h-full w-full rounded-full transition-colors ${smartEnhance ? 'bg-cyan-500' : 'bg-slate-700'}`}
                                ></label>
                                <span className={`absolute left-0.5 top-0.5 block h-5 w-5 rounded-full bg-white shadow transition-transform ${smartEnhance ? 'translate-x-5' : 'translate-x-0'}`}></span>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Automatically adjusts contrast and clarity using lightweight image processing.
                        </p>
                    </div>

                    <div className="mt-auto">
                        <button
                            onClick={handleDownload}
                            disabled={!originalImage}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-lg shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                        >
                            <Download className="w-5 h-5" />
                            Download Image
                        </button>
                    </div>

                </div>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
                    <Smartphone className="w-8 h-8 text-blue-400 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-200 mb-2">Responsive Ready</h3>
                    <p className="text-slate-400 text-sm">Resize images for social media posts, websites, and app assets instantly.</p>
                </div>
                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
                    <Monitor className="w-8 h-8 text-cyan-400 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-200 mb-2">High Quality</h3>
                    <p className="text-slate-400 text-sm">Maintains maximum details with smart interpolation algorithms.</p>
                </div>
                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
                    <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold mb-4">AI</div>
                    <h3 className="text-lg font-semibold text-slate-200 mb-2">Privacy First</h3>
                    <p className="text-slate-400 text-sm">All processing happens directly in your browser. Your photos never leave your device.</p>
                </div>
            </div>
        </div>
    );
};

export default ImageResizerInterface;
