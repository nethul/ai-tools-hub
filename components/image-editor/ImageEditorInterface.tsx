'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Download, Upload, RefreshCw, RotateCw, RotateCcw, FlipHorizontal, FlipVertical, Crop, Sliders, Sparkles, Image as ImageIcon } from 'lucide-react';
import * as fileSaver from 'file-saver';

// Types
interface Adjustments {
    brightness: number;
    contrast: number;
    saturation: number;
    exposure: number;
    hue: number;
    blur: number;
    sharpen: number;
}

interface FilterPreset {
    id: string;
    name: string;
    filter: string;
}

const defaultAdjustments: Adjustments = {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    exposure: 0,
    hue: 0,
    blur: 0,
    sharpen: 0,
};

const filterPresets: FilterPreset[] = [
    { id: 'none', name: 'Original', filter: '' },
    { id: 'grayscale', name: 'Grayscale', filter: 'grayscale(100%)' },
    { id: 'sepia', name: 'Sepia', filter: 'sepia(100%)' },
    { id: 'invert', name: 'Invert', filter: 'invert(100%)' },
    { id: 'vintage', name: 'Vintage', filter: 'sepia(40%) contrast(90%) brightness(90%)' },
    { id: 'cool', name: 'Cool', filter: 'hue-rotate(180deg) saturate(80%)' },
    { id: 'warm', name: 'Warm', filter: 'sepia(30%) saturate(140%)' },
    { id: 'dramatic', name: 'Dramatic', filter: 'contrast(150%) saturate(80%)' },
    { id: 'fade', name: 'Fade', filter: 'saturate(60%) brightness(110%) contrast(85%)' },
    { id: 'vivid', name: 'Vivid', filter: 'saturate(150%) contrast(110%)' },
];

type TabType = 'adjust' | 'filters' | 'transform' | 'export';

const ImageEditorInterface = () => {
    // Core state
    const [file, setFile] = useState<File | null>(null);
    const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Adjustments
    const [adjustments, setAdjustments] = useState<Adjustments>(defaultAdjustments);

    // Filter preset
    const [activeFilter, setActiveFilter] = useState<string>('none');

    // Transforms
    const [rotation, setRotation] = useState(0);
    const [flipH, setFlipH] = useState(false);
    const [flipV, setFlipV] = useState(false);

    // Export settings
    const [format, setFormat] = useState('image/jpeg');
    const [quality, setQuality] = useState(0.92);

    // UI state
    const [activeTab, setActiveTab] = useState<TabType>('adjust');
    const [isProcessing, setIsProcessing] = useState(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Load image when file changes
    useEffect(() => {
        if (!file) return;

        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            setOriginalImage(img);
        };

        return () => {
            URL.revokeObjectURL(img.src);
        };
    }, [file]);

    // Build CSS filter string from adjustments and preset
    const buildFilterString = useCallback(() => {
        const preset = filterPresets.find(f => f.id === activeFilter);
        const presetFilter = preset?.filter || '';

        const adjustmentFilter = [
            `brightness(${adjustments.brightness}%)`,
            `contrast(${adjustments.contrast}%)`,
            `saturate(${adjustments.saturation}%)`,
            adjustments.exposure !== 0 ? `brightness(${100 + adjustments.exposure}%)` : '',
            adjustments.hue !== 0 ? `hue-rotate(${adjustments.hue}deg)` : '',
            adjustments.blur > 0 ? `blur(${adjustments.blur}px)` : '',
        ].filter(Boolean).join(' ');

        return `${adjustmentFilter} ${presetFilter}`.trim();
    }, [adjustments, activeFilter]);

    // Process image and generate preview
    const processImage = useCallback(() => {
        if (!originalImage || !canvasRef.current) return;

        setIsProcessing(true);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Calculate dimensions based on rotation
        const isRotated90 = rotation === 90 || rotation === 270;
        const width = isRotated90 ? originalImage.height : originalImage.width;
        const height = isRotated90 ? originalImage.width : originalImage.height;

        canvas.width = width;
        canvas.height = height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Save context state
        ctx.save();

        // Move to center for transforms
        ctx.translate(width / 2, height / 2);

        // Apply rotation
        ctx.rotate((rotation * Math.PI) / 180);

        // Apply flips
        ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

        // Apply CSS filter
        ctx.filter = buildFilterString();

        // Draw image centered
        ctx.drawImage(
            originalImage,
            -originalImage.width / 2,
            -originalImage.height / 2,
            originalImage.width,
            originalImage.height
        );

        // Apply sharpening if needed (simple unsharp mask approximation)
        if (adjustments.sharpen > 0) {
            ctx.filter = 'none';
            const imageData = ctx.getImageData(0, 0, width, height);
            const data = imageData.data;
            const factor = adjustments.sharpen / 100;

            // Simple edge enhancement
            for (let i = 0; i < data.length; i += 4) {
                const avgPrev = i > 4 ? (data[i - 4] + data[i - 3] + data[i - 2]) / 3 : 0;
                const avgCurr = (data[i] + data[i + 1] + data[i + 2]) / 3;
                const diff = avgCurr - avgPrev;

                data[i] = Math.min(255, Math.max(0, data[i] + diff * factor));
                data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + diff * factor));
                data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + diff * factor));
            }

            ctx.putImageData(imageData, 0, 0);
        }

        // Restore context
        ctx.restore();

        // Generate preview URL
        const dataUrl = canvas.toDataURL(format, quality);
        setPreviewUrl(dataUrl);
        setIsProcessing(false);
    }, [originalImage, rotation, flipH, flipV, buildFilterString, adjustments.sharpen, format, quality]);

    // Debounced processing
    useEffect(() => {
        if (!originalImage) return;

        const timer = setTimeout(() => {
            processImage();
        }, 100);

        return () => clearTimeout(timer);
    }, [processImage, originalImage, adjustments, activeFilter, rotation, flipH, flipV, format, quality]);

    // Handlers
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleReset = () => {
        setAdjustments(defaultAdjustments);
        setActiveFilter('none');
        setRotation(0);
        setFlipH(false);
        setFlipV(false);
    };

    const handleDownload = () => {
        if (!previewUrl) return;
        const ext = format.split('/')[1];
        const timestamp = Date.now();
        fileSaver.saveAs(previewUrl, `edited-image-${timestamp}.${ext}`);
    };

    const updateAdjustment = (key: keyof Adjustments, value: number) => {
        setAdjustments(prev => ({ ...prev, [key]: value }));
    };

    const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
        { id: 'adjust', label: 'Adjust', icon: <Sliders className="w-4 h-4" /> },
        { id: 'filters', label: 'Filters', icon: <Sparkles className="w-4 h-4" /> },
        { id: 'transform', label: 'Transform', icon: <RotateCw className="w-4 h-4" /> },
        { id: 'export', label: 'Export', icon: <Download className="w-4 h-4" /> },
    ];

    // Adjustment slider config
    const adjustmentSliders: { key: keyof Adjustments; label: string; min: number; max: number; default: number }[] = [
        { key: 'brightness', label: 'Brightness', min: 0, max: 200, default: 100 },
        { key: 'contrast', label: 'Contrast', min: 0, max: 200, default: 100 },
        { key: 'saturation', label: 'Saturation', min: 0, max: 200, default: 100 },
        { key: 'exposure', label: 'Exposure', min: -50, max: 50, default: 0 },
        { key: 'hue', label: 'Hue Rotate', min: -180, max: 180, default: 0 },
        { key: 'blur', label: 'Blur', min: 0, max: 20, default: 0 },
        { key: 'sharpen', label: 'Sharpen', min: 0, max: 100, default: 0 },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <canvas ref={canvasRef} className="hidden" />

            <div className="flex flex-col lg:flex-row gap-6 min-h-[600px]">
                {/* Preview Area */}
                <div
                    className="flex-1 bg-slate-900 border-2 border-dashed border-slate-700 rounded-2xl flex items-center justify-center p-4 relative overflow-hidden transition-all hover:border-slate-600"
                    onDrop={handleDrop}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    style={{
                        backgroundImage: originalImage ? 'linear-gradient(45deg, #1e293b 25%, transparent 25%), linear-gradient(-45deg, #1e293b 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1e293b 75%), linear-gradient(-45deg, transparent 75%, #1e293b 75%)' : 'none',
                        backgroundSize: '20px 20px',
                        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                    }}
                >
                    {!originalImage ? (
                        <div className="text-center">
                            <Upload className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                            <p className="text-slate-300 text-lg font-medium mb-2">Drag & Drop your image here</p>
                            <p className="text-slate-500 text-sm mb-6">Supports JPG, PNG, WEBP</p>
                            <label className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-6 py-2.5 rounded-full cursor-pointer hover:shadow-lg hover:shadow-amber-500/20 transition-all font-medium">
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
                            {isProcessing && (
                                <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center">
                                    <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}
                            <button
                                onClick={() => { setFile(null); setPreviewUrl(null); setOriginalImage(null); handleReset(); }}
                                className="absolute top-4 right-4 bg-slate-800/80 p-2 rounded-full text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                                title="Remove image"
                            >
                                <RefreshCw className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Controls Sidebar */}
                <div className="w-full lg:w-96 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col shadow-xl overflow-hidden">
                    {/* Tabs */}
                    <div className="flex border-b border-slate-800">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 py-3 px-2 text-xs font-medium flex flex-col items-center gap-1 transition-colors ${activeTab === tab.id
                                    ? 'text-amber-400 bg-slate-800/50 border-b-2 border-amber-400'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                                    }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {/* Adjust Tab */}
                        {activeTab === 'adjust' && (
                            <div className="space-y-4">
                                {adjustmentSliders.map((slider) => (
                                    <div key={slider.key}>
                                        <div className="flex justify-between mb-1.5">
                                            <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">{slider.label}</label>
                                            <span className="text-xs text-amber-400 font-mono">{adjustments[slider.key]}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min={slider.min}
                                            max={slider.max}
                                            value={adjustments[slider.key]}
                                            onChange={(e) => updateAdjustment(slider.key, parseInt(e.target.value))}
                                            className="w-full accent-amber-500"
                                            disabled={!originalImage}
                                        />
                                    </div>
                                ))}
                                <button
                                    onClick={() => setAdjustments(defaultAdjustments)}
                                    disabled={!originalImage}
                                    className="w-full py-2 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 transition-colors text-sm disabled:opacity-50"
                                >
                                    Reset Adjustments
                                </button>
                            </div>
                        )}

                        {/* Filters Tab */}
                        {activeTab === 'filters' && (
                            <div className="grid grid-cols-3 gap-2">
                                {filterPresets.map((preset) => (
                                    <button
                                        key={preset.id}
                                        onClick={() => setActiveFilter(preset.id)}
                                        disabled={!originalImage}
                                        className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center text-xs font-medium transition-all disabled:opacity-50 ${activeFilter === preset.id
                                            ? 'border-amber-500 bg-amber-500/20 text-amber-400'
                                            : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                                            }`}
                                    >
                                        <ImageIcon className="w-4 h-4 mb-1" />
                                        {preset.name}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Transform Tab */}
                        {activeTab === 'transform' && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs text-slate-500 uppercase font-bold tracking-wider mb-3">Rotate</label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
                                            disabled={!originalImage}
                                            className="flex-1 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            <RotateCcw className="w-5 h-5" />
                                            90° CCW
                                        </button>
                                        <button
                                            onClick={() => setRotation((r) => (r + 90) % 360)}
                                            disabled={!originalImage}
                                            className="flex-1 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            <RotateCw className="w-5 h-5" />
                                            90° CW
                                        </button>
                                    </div>
                                    <p className="text-center text-xs text-slate-500 mt-2">Current: {rotation}°</p>
                                </div>

                                <div>
                                    <label className="block text-xs text-slate-500 uppercase font-bold tracking-wider mb-3">Flip</label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setFlipH(!flipH)}
                                            disabled={!originalImage}
                                            className={`flex-1 py-3 rounded-xl border transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${flipH
                                                ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                                                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:border-slate-600'
                                                }`}
                                        >
                                            <FlipHorizontal className="w-5 h-5" />
                                            Horizontal
                                        </button>
                                        <button
                                            onClick={() => setFlipV(!flipV)}
                                            disabled={!originalImage}
                                            className={`flex-1 py-3 rounded-xl border transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${flipV
                                                ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                                                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:border-slate-600'
                                                }`}
                                        >
                                            <FlipVertical className="w-5 h-5" />
                                            Vertical
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={() => { setRotation(0); setFlipH(false); setFlipV(false); }}
                                    disabled={!originalImage}
                                    className="w-full py-2 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 transition-colors text-sm disabled:opacity-50"
                                >
                                    Reset Transforms
                                </button>
                            </div>
                        )}

                        {/* Export Tab */}
                        {activeTab === 'export' && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs text-slate-500 mb-1.5 uppercase font-bold tracking-wider">Format</label>
                                    <select
                                        value={format}
                                        onChange={(e) => setFormat(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-slate-200 outline-none focus:border-amber-500 transition-colors appearance-none"
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
                                            <span className="text-xs text-amber-400 font-mono">{Math.round(quality * 100)}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0.1"
                                            max="1"
                                            step="0.05"
                                            value={quality}
                                            onChange={(e) => setQuality(parseFloat(e.target.value))}
                                            className="w-full accent-amber-500"
                                            disabled={!originalImage}
                                        />
                                    </div>
                                )}

                                <button
                                    onClick={handleReset}
                                    disabled={!originalImage}
                                    className="w-full py-2 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 transition-colors text-sm disabled:opacity-50"
                                >
                                    Reset All Changes
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Download Button */}
                    <div className="p-4 border-t border-slate-800">
                        <button
                            onClick={handleDownload}
                            disabled={!originalImage}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-bold text-lg shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                        >
                            <Download className="w-5 h-5" />
                            Download Image
                        </button>
                    </div>
                </div>
            </div>

            {/* Feature Cards */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
                    <Sliders className="w-8 h-8 text-amber-400 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-200 mb-2">Fine-tuned Adjustments</h3>
                    <p className="text-slate-400 text-sm">Precisely control brightness, contrast, saturation, and more with real-time preview.</p>
                </div>
                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
                    <Sparkles className="w-8 h-8 text-yellow-400 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-200 mb-2">Instant Filters</h3>
                    <p className="text-slate-400 text-sm">Apply stunning preset filters like Vintage, Cool, Warm, and Dramatic with one click.</p>
                </div>
                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
                    <div className="w-8 h-8 rounded bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center text-white font-bold mb-4">🔒</div>
                    <h3 className="text-lg font-semibold text-slate-200 mb-2">100% Private</h3>
                    <p className="text-slate-400 text-sm">All editing happens in your browser. Your images never leave your device.</p>
                </div>
            </div>
        </div>
    );
};

export default ImageEditorInterface;
