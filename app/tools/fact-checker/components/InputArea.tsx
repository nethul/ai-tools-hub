import React, { useState, useRef } from 'react';
import { UploadCloud, X, FileText, Image as ImageIcon } from 'lucide-react';

interface InputAreaProps {
    text: string;
    setText: (text: string) => void;
    image: File | null;
    setImage: (file: File | null) => void;
    onSubmit: () => void;
    isLoading: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({
    text,
    setText,
    image,
    setImage,
    onSubmit,
    isLoading
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            if (file.type.startsWith('image/')) {
                setImage(file);
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setImage(e.target.files[0]);
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto bg-slate-800 rounded-2xl shadow-xl shadow-slate-900/50 overflow-hidden border border-slate-700">
            <div className="p-1 bg-slate-900 border-b border-slate-700 flex gap-1">
                <div className="flex-1 text-center py-2 text-sm font-medium text-slate-300 bg-slate-800 rounded-t-lg shadow-sm border-t border-x border-slate-700">
                    Claim Analysis
                </div>
            </div>

            <div className="p-6 space-y-4">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Paste the text of the claim, rumor, or statement you want to verify here..."
                    className="w-full min-h-[120px] p-4 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none resize-none text-slate-200 placeholder:text-slate-500 transition-all"
                />

                <div
                    className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 flex flex-col items-center justify-center text-center cursor-pointer group
            ${isDragging ? 'border-violet-500 bg-violet-900/20' : 'border-slate-700 hover:border-violet-500/50 hover:bg-slate-800'}
            ${image ? 'bg-slate-900 border-solid border-slate-600' : ''}
          `}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => !image && fileInputRef.current?.click()}
                >
                    {image ? (
                        <div className="flex items-center justify-between w-full max-w-md bg-slate-800 p-3 rounded-lg shadow-sm border border-slate-700">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0 text-slate-400">
                                    <ImageIcon size={20} />
                                </div>
                                <div className="flex flex-col items-start overflow-hidden">
                                    <p className="text-sm font-medium text-slate-200 truncate w-full">{image.name}</p>
                                    <p className="text-xs text-slate-500">{(image.size / 1024).toFixed(1)} KB</p>
                                </div>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setImage(null);
                                }}
                                className="p-2 hover:bg-rose-900/30 text-slate-400 hover:text-rose-500 rounded-full transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="w-12 h-12 bg-violet-900/20 text-violet-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <UploadCloud size={24} />
                            </div>
                            <p className="text-sm font-medium text-slate-300">
                                Click to upload an image or drag and drop
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                                Screenshots, photos, or memes (max 5MB)
                            </p>
                        </>
                    )}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                    />
                </div>

                <button
                    onClick={onSubmit}
                    disabled={isLoading || (!text && !image)}
                    className={`w-full py-4 px-6 rounded-xl font-semibold text-white shadow-lg shadow-violet-500/20 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99]
            ${isLoading || (!text && !image)
                            ? 'bg-slate-700 cursor-not-allowed shadow-none text-slate-400'
                            : 'bg-violet-600 hover:bg-violet-700 hover:shadow-violet-600/30'}
          `}
                >
                    {isLoading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Checking Sources...</span>
                        </>
                    ) : (
                        <>
                            <FileText size={20} />
                            <span>Verify Facts</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
