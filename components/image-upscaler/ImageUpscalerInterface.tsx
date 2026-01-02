'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Download, Upload, RefreshCw, Zap, Cpu, Layers, ZoomIn } from 'lucide-react';
import * as fileSaver from 'file-saver';
import { ImageUpscaler, Backend, ScaleFactor } from '@/lib/webgpu-upscaler';

const ImageUpscalerInterface = () => {
    const [file, setFile] = useState<File | null>(null);
    const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
    const [originalImageData, setOriginalImageData] = useState<ImageData | null>(null);
    const [upscaledImageUrl, setUpscaledImageUrl] = useState<string | null>(null);
    const [scale, setScale] = useState<ScaleFactor>(2);
    const [isProcessing, setIsProcessing] = useState(false);
    const [backend, setBackend] = useState<Backend>('canvas');
    const [showComparison, setShowComparison] = useState(false);
    const [comparisonPosition, setComparisonPosition] = useState(50);
    const [processingTime, setProcessingTime] = useState<number | null>(null);

    const upscalerRef = useRef<ImageUpscaler | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const comparisonRef = useRef<HTMLDivElement>(null);

    // Initialize upscaler
    useEffect(() => {
        upscalerRef.current = new ImageUpscaler();
        upscalerRef.current.initialize().then(() => {
            if (upscalerRef.current) {
                setBackend(upscalerRef.current.getBackend());
            }
        });

        return () => {
            if (upscalerRef.current) {
                upscalerRef.current.destroy();
            }
        };
    }, []);

    // Load image when file changes
    useEffect(() => {
        if (!file) return;

        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            setOriginalImage(img);

            // Extract ImageData
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d')!;
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, img.width, img.height);
            setOriginalImageData(imageData);

            // Reset state
            setUpscaledImageUrl(null);
            setShowComparison(false);
            setProcessingTime(null);
        };

        return () => {
            URL.revokeObjectURL(img.src);
        };
    }, [file]);

    // Process upscaling
    const handleUpscale = useCallback(async () => {
        if (!originalImageData || !upscalerRef.current || isProcessing) return;

        setIsProcessing(true);
        setProcessingTime(null);
        const startTime = performance.now();

        try {
            const result = await upscalerRef.current.upscale(originalImageData, scale);

            // Convert to image URL
            const canvas = canvasRef.current!;
            canvas.width = result.width;
            canvas.height = result.height;
            const ctx = canvas.getContext('2d')!;
            ctx.putImageData(result, 0, 0);

            const dataUrl = canvas.toDataURL('image/png');
            setUpscaledImageUrl(dataUrl);
            setShowComparison(true);
            setProcessingTime(performance.now() - startTime);
        } catch (error) {
            console.error('Upscaling failed:', error);
        } finally {
            setIsProcessing(false);
        }
    }, [originalImageData, scale, isProcessing]);

    // Handle comparison slider
    const handleComparisonMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!comparisonRef.current) return;
        const rect = comparisonRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.min(100, Math.max(0, (x / rect.width) * 100));
        setComparisonPosition(percentage);
    }, []);

    // Drag and Drop
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleDownload = () => {
        if (!upscaledImageUrl) return;
        const fileName = file?.name?.replace(/\.[^.]+$/, '') || 'image';
        fileSaver.saveAs(upscaledImageUrl, `${fileName}-upscaled-${scale}x.png`);
    };

    const getBackendIcon = () => {
        switch (backend) {
            case 'webgpu':
                return <Zap className="w-4 h-4" />;
            case 'webgl':
                return <Layers className="w-4 h-4" />;
            default:
                return <Cpu className="w-4 h-4" />;
        }
    };

    const getBackendLabel = () => {
        switch (backend) {
            case 'webgpu':
                return 'WebGPU';
            case 'webgl':
                return 'WebGL';
            default:
                return 'Software';
        }
    };

    const resetAll = () => {
        setFile(null);
        setOriginalImage(null);
        setOriginalImageData(null);
        setUpscaledImageUrl(null);
        setShowComparison(false);
        setProcessingTime(null);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <canvas ref={canvasRef} className="hidden" />

            <div className="flex flex-col lg:flex-row gap-8 min-h-[600px]">

                {/* Preview Area */}
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
                            <label className="bg-gradient-to-r from-rose-500 to-orange-500 text-white px-6 py-2.5 rounded-full cursor-pointer hover:shadow-lg hover:shadow-orange-500/20 transition-all font-medium">
                                Browse Files
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files && setFile(e.target.files[0])} />
                            </label>
                        </div>
                    ) : (
                        <div className="relative w-full h-full flex items-center justify-center">
                            {showComparison && upscaledImageUrl ? (
                                <div
                                    ref={comparisonRef}
                                    className="relative w-full max-h-[600px] cursor-col-resize select-none"
                                    onMouseMove={handleComparisonMove}
                                >
                                    {/* Upscaled image (background) */}
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={upscaledImageUrl}
                                        alt="Upscaled"
                                        className="max-w-full max-h-[600px] object-contain mx-auto rounded-lg shadow-2xl"
                                    />

                                    {/* Original image (clipped) */}
                                    <div
                                        className="absolute inset-0 overflow-hidden flex items-center justify-center"
                                        style={{ clipPath: `inset(0 ${100 - comparisonPosition}% 0 0)` }}
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={originalImage?.src}
                                            alt="Original"
                                            className="max-w-full max-h-[600px] object-contain mx-auto rounded-lg"
                                            style={{ imageRendering: 'pixelated' }}
                                        />
                                    </div>

                                    {/* Slider line */}
                                    <div
                                        className="absolute top-0 bottom-0 w-1 bg-white shadow-lg pointer-events-none"
                                        style={{ left: `${comparisonPosition}%`, transform: 'translateX(-50%)' }}
                                    >
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                                            <svg className="w-6 h-6 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M8 12H16M8 12L11 9M8 12L11 15M16 12L13 9M16 12L13 15" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Labels */}
                                    <div className="absolute top-4 left-4 bg-black/70 px-3 py-1.5 rounded-full text-xs text-white font-medium">
                                        Original ({originalImage?.width}×{originalImage?.height})
                                    </div>
                                    <div className="absolute top-4 right-4 bg-gradient-to-r from-rose-500 to-orange-500 px-3 py-1.5 rounded-full text-xs text-white font-medium">
                                        Upscaled ({originalImage?.width ? originalImage.width * scale : 0}×{originalImage?.height ? originalImage.height * scale : 0})
                                    </div>
                                </div>
                            ) : (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                    src={originalImage?.src}
                                    alt="Preview"
                                    className="max-w-full max-h-[600px] object-contain shadow-2xl rounded-lg"
                                />
                            )}

                            <button
                                onClick={resetAll}
                                className="absolute top-4 right-4 bg-slate-800/80 p-2 rounded-full text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                            >
                                <RefreshCw className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Controls Sidebar */}
                <div className="w-full lg:w-96 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-6 shadow-xl">

                    {/* Backend Indicator */}
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-slate-700/50">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-400">Processing Engine</span>
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${backend === 'webgpu' ? 'bg-emerald-500/20 text-emerald-400' :
                                    backend === 'webgl' ? 'bg-blue-500/20 text-blue-400' :
                                        'bg-slate-500/20 text-slate-400'
                                }`}>
                                {getBackendIcon()}
                                {getBackendLabel()}
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                            {backend === 'webgpu' ? 'Hardware-accelerated GPU processing' :
                                backend === 'webgl' ? 'GPU-accelerated via WebGL' :
                                    'CPU-based software rendering'}
                        </p>
                    </div>

                    <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
                        <ZoomIn className="w-5 h-5" />
                        Upscale Settings
                    </h2>

                    {/* Scale Selector */}
                    <div>
                        <label className="block text-xs text-slate-500 mb-3 uppercase font-bold tracking-wider">Scale Factor</label>
                        <div className="grid grid-cols-3 gap-3">
                            {([2, 3, 4] as ScaleFactor[]).map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setScale(s)}
                                    disabled={!originalImage || isProcessing}
                                    className={`py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${scale === s
                                            ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-lg shadow-orange-500/25'
                                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                                        }`}
                                >
                                    {s}x
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Info */}
                    {originalImage && (
                        <div className="space-y-3">
                            <div className="h-px bg-slate-800" />
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Original Size</span>
                                <span className="text-slate-300 font-mono">{originalImage.width} × {originalImage.height}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Output Size</span>
                                <span className="text-rose-400 font-mono font-semibold">{originalImage.width * scale} × {originalImage.height * scale}</span>
                            </div>
                            {processingTime && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Processing Time</span>
                                    <span className="text-emerald-400 font-mono">{processingTime.toFixed(0)}ms</span>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="h-px bg-slate-800" />

                    {/* Action Buttons */}
                    <div className="mt-auto space-y-3">
                        <button
                            onClick={handleUpscale}
                            disabled={!originalImage || isProcessing}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white font-bold text-lg shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                        >
                            {isProcessing ? (
                                <>
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                    Upscaling...
                                </>
                            ) : (
                                <>
                                    <ZoomIn className="w-5 h-5" />
                                    Upscale {scale}x
                                </>
                            )}
                        </button>

                        {upscaledImageUrl && (
                            <button
                                onClick={handleDownload}
                                className="w-full py-3 rounded-xl bg-slate-800 text-slate-200 font-semibold hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                            >
                                <Download className="w-5 h-5" />
                                Download Image
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Feature Cards */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
                    <Zap className="w-8 h-8 text-rose-400 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-200 mb-2">GPU Accelerated</h3>
                    <p className="text-slate-400 text-sm">Harnesses WebGPU & WebGL for blazing-fast upscaling right in your browser.</p>
                </div>
                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
                    <ZoomIn className="w-8 h-8 text-orange-400 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-200 mb-2">Bicubic Interpolation</h3>
                    <p className="text-slate-400 text-sm">Advanced algorithm preserves edges and details while increasing resolution.</p>
                </div>
                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
                    <div className="w-8 h-8 rounded bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white font-bold mb-4">🔒</div>
                    <h3 className="text-lg font-semibold text-slate-200 mb-2">100% Private</h3>
                    <p className="text-slate-400 text-sm">All processing happens locally on your device. Your images never leave your browser.</p>
                </div>
            </div>
        </div>
    );
};

export default ImageUpscalerInterface;
