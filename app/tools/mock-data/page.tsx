'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Database, FileSpreadsheet, FileJson, Play, Download, Loader2, Code as CodeIcon } from 'lucide-react';
import { faker } from '@faker-js/faker';
import * as XLSX from 'xlsx';
import { SchemaBuilder, SchemaItem } from './components/SchemaBuilder';
import { generateDataScript } from '../../../services/mock-data-gemini';

export default function MockDataGeneratorPage() {
    const [schema, setSchema] = useState<SchemaItem[]>([
        { id: '1', name: 'id', description: 'UUID' },
        { id: '2', name: 'full_name', description: 'Full Name' },
        { id: '3', name: 'email', description: 'Email Address' }
    ]);
    const [rowCount, setRowCount] = useState<number>(50);
    const [isGeneratingScript, setIsGeneratingScript] = useState(false);
    const [isGeneratingData, setIsGeneratingData] = useState(false);
    const [generatedCode, setGeneratedCode] = useState<string | null>(null);
    const [generatedData, setGeneratedData] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (schema.length === 0) {
            setError("Please add at least one column to the schema.");
            return;
        }

        setIsGeneratingScript(true);
        setError(null);
        setGeneratedCode(null);
        setGeneratedData([]);

        try {
            // 1. Generate Script via Gemini
            const code = await generateDataScript(schema);
            setGeneratedCode(code);

            setIsGeneratingScript(false);
            setIsGeneratingData(true);

            // 2. Execute Script Client-Side
            const safeCode = `
                return (function(count) {
                    ${code}
                    // Attempt to call the function if the AI named it, or just return result if it's an IIFE
                    if (typeof generateData === 'function') {
                        return generateData(count);
                    }
                    // If the code just returns array directly without function wrap
                    return []; 
                })(rows);
            `;

            const generateFn = new Function('faker', 'rows', safeCode);
            const data = generateFn(faker, rowCount);

            if (Array.isArray(data)) {
                setGeneratedData(data);
            } else {
                throw new Error("Generated script did not return an array.");
            }

        } catch (err: any) {
            console.error(err);
            setError("Failed to generate data. " + (err.message || "Unknown error"));
        } finally {
            setIsGeneratingScript(false);
            setIsGeneratingData(false);
        }
    };

    const downloadFile = (type: 'csv' | 'xlsx' | 'json') => {
        if (generatedData.length === 0) return;

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `mock_data_${timestamp}.${type}`;

        if (type === 'json') {
            const blob = new Blob([JSON.stringify(generatedData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        } else {
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(generatedData);
            XLSX.utils.book_append_sheet(wb, ws, "Mock Data");
            XLSX.writeFile(wb, filename);
        }
    };

    // Helper to get table headers
    const getHeaders = () => {
        if (generatedData.length === 0) return [];
        return Object.keys(generatedData[0]);
    };

    return (
        <div className="min-h-screen p-4 sm:p-6 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Back Link */}
                <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-violet-400 transition-colors mb-8 group">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:-translate-x-1 transition-transform">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                    </svg>
                    <span>Back to Tools</span>
                </Link>

                {/* Header */}
                <header className="mb-12 text-center space-y-4">
                    <div className="inline-flex items-center justify-center p-3 bg-slate-800/80 rounded-2xl shadow-xl ring-1 ring-slate-700 mb-4 backdrop-blur-md">
                        <Database className="w-8 h-8 text-violet-400 mr-3" />
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400">
                            Mock Data Generator
                        </h1>
                    </div>
                    <p className="text-slate-400 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
                        Generate realistic test data for your applications using AI.
                        Define your schema, and let the AI write the generation script.
                    </p>
                </header>

                <main className="space-y-8">
                    {/* Top Section: Schema & Controls */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        {/* Schema Builder (Left) */}
                        <div className="lg:col-span-2 bg-slate-800/50 rounded-2xl border border-slate-700 p-6 shadow-sm">
                            <h2 className="text-xl font-semibold text-slate-200 mb-4 flex items-center gap-2">
                                <Database className="w-5 h-5 text-violet-500" />
                                Define Schema
                            </h2>
                            <SchemaBuilder schema={schema} setSchema={setSchema} />
                        </div>

                        {/* Controls (Right) */}
                        <div className="lg:col-span-1 space-y-6 sticky top-8">
                            {/* Generate Panel */}
                            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 space-y-6">
                                <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
                                    <Play className="w-5 h-5 text-violet-500" />
                                    Generate
                                </h2>

                                <div className="space-y-2">
                                    <label className="text-slate-400 text-sm font-medium">Row Count</label>
                                    <input
                                        type="number"
                                        value={rowCount}
                                        onChange={(e) => setRowCount(Number(e.target.value))}
                                        min={1}
                                        max={1000}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:ring-2 focus:ring-violet-500 outline-none transition-all focus:border-violet-500"
                                    />
                                </div>

                                <button
                                    onClick={handleGenerate}
                                    disabled={isGeneratingScript || isGeneratingData}
                                    className={`w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-[0.99]
                                        ${isGeneratingScript || isGeneratingData
                                            ? 'bg-slate-700 cursor-not-allowed text-slate-400 shadow-none'
                                            : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:shadow-violet-600/30 hover:brightness-110'}
                                    `}
                                >
                                    {isGeneratingScript ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Writing Script...</span>
                                        </>
                                    ) : isGeneratingData ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Generating Data...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Play className="w-5 h-5 fill-current" />
                                            <span>Generate Data</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {error && (
                                <div className="p-4 bg-rose-900/20 border border-rose-800 rounded-xl text-rose-400 text-sm animate-shake">
                                    {error}
                                </div>
                            )}

                            {/* Export Options (Moved Here) */}
                            {generatedData.length > 0 && (
                                <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 space-y-4 animate-fade-in-up">
                                    <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
                                        <Download className="w-5 h-5 text-violet-500" />
                                        Export
                                    </h2>
                                    <div className="space-y-3">
                                        <button
                                            onClick={() => downloadFile('csv')}
                                            className="w-full flex items-center justify-between p-3 bg-slate-900 border border-slate-700 rounded-xl hover:border-violet-500/50 hover:bg-slate-800 transition-all group"
                                        >
                                            <span className="font-medium text-slate-300 group-hover:text-white">CSV</span>
                                            <FileSpreadsheet className="w-5 h-5 text-slate-500 group-hover:text-violet-400" />
                                        </button>
                                        <button
                                            onClick={() => downloadFile('xlsx')}
                                            className="w-full flex items-center justify-between p-3 bg-slate-900 border border-slate-700 rounded-xl hover:border-violet-500/50 hover:bg-slate-800 transition-all group"
                                        >
                                            <span className="font-medium text-slate-300 group-hover:text-white">Excel</span>
                                            <FileSpreadsheet className="w-5 h-5 text-slate-500 group-hover:text-green-400" />
                                        </button>
                                        <button
                                            onClick={() => downloadFile('json')}
                                            className="w-full flex items-center justify-between p-3 bg-slate-900 border border-slate-700 rounded-xl hover:border-violet-500/50 hover:bg-slate-800 transition-all group"
                                        >
                                            <span className="font-medium text-slate-300 group-hover:text-white">JSON</span>
                                            <FileJson className="w-5 h-5 text-slate-500 group-hover:text-amber-400" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Results Section - Conditional Rendering */}
                    {generatedData.length > 0 && (
                        <div className="animate-fade-in-up">
                            {/* Data Preview (Table) */}
                            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 shadow-sm overflow-hidden flex flex-col">
                                <h2 className="text-xl font-semibold text-slate-200 mb-4 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <CodeIcon className="w-5 h-5 text-slate-500" />
                                        Data Preview
                                    </div>
                                    <span className="text-xs bg-slate-700 px-2 py-1 rounded-full text-slate-400">
                                        Showing {Math.min(generatedData.length, 10)} of {generatedData.length} rows
                                    </span>
                                </h2>

                                <div className="overflow-x-auto rounded-lg border border-slate-700">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr>
                                                {getHeaders().map((header) => (
                                                    <th key={header} className="bg-slate-900 p-3 text-sm font-semibold text-slate-300 border-b border-slate-700 whitespace-nowrap">
                                                        {header}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {generatedData.slice(0, 10).map((row, idx) => (
                                                <tr key={idx} className="group hover:bg-slate-800/50 transition-colors">
                                                    {getHeaders().map((header) => (
                                                        <td key={header} className="p-3 text-sm text-slate-400 border-b border-slate-800 group-last:border-0 whitespace-nowrap max-w-[200px] overflow-hidden text-ellipsis">
                                                            {String(row[header])}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {generatedData.length > 10 && (
                                    <div className="mt-2 text-center text-xs text-slate-500 italic">
                                        ...and {generatedData.length - 10} more rows
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
