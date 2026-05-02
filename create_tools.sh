#!/bin/bash
cd /root/.openclaw/workspace/ai-tools-hub

# Tool 1: YouTube Title Generator
mkdir -p app/api/youtube-title
cat << 'ROUTE' > app/api/youtube-title/route.ts
import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
    throw new Error("NEXT_PUBLIC_GEMINI_API_KEY is not set");
}

const ai = new GoogleGenAI({ apiKey });

export async function POST(req: NextRequest) {
    try {
        const { topic, tone } = await req.json();

        if (!topic) {
            return NextResponse.json({ error: "Topic is required" }, { status: 400 });
        }

        const model = "gemini-2.5-flash";
        const instruction = `You are an expert YouTube strategist and copywriter. Generate 5 highly clickable, viral YouTube titles based on the user's topic.
Tone: ${tone || 'Catchy and Viral'}.
Do not include quotation marks around the titles. Separate each title with a new line. Do not include any intro or outro text. Just 5 titles.`;

        const responseStream = await ai.models.generateContentStream({
            model: model,
            contents: [{ role: "user", parts: [{ text: topic }] }],
            config: {
                systemInstruction: instruction,
                temperature: 0.7,
            },
        });

        const stream = new ReadableStream({
            async start(controller) {
                for await (const chunk of responseStream) {
                    if (chunk.text) {
                        controller.enqueue(new TextEncoder().encode(chunk.text));
                    }
                }
                controller.close();
            },
        });

        return new NextResponse(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });

    } catch (error: any) {
        console.error("Gemini API Error:", error);
        return NextResponse.json({ error: error.message || "Failed to generate titles" }, { status: 500 });
    }
}
ROUTE

mkdir -p app/tools/youtube-title-generator
cat << 'LAYOUT' > app/tools/youtube-title-generator/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "AI YouTube Title Generator - Free Viral Title Maker",
    description: "Generate catchy, viral YouTube titles instantly with our free AI tool. Boost your CTR and get more views.",
    keywords: ["youtube title generator", "youtube title maker", "ai youtube titles", "viral youtube titles"],
    alternates: { canonical: '/tools/youtube-title-generator' },
};

export default function YouTubeTitleLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "SoftwareApplication",
                        "name": "AI YouTube Title Generator",
                        "applicationCategory": "UtilitiesApplication",
                        "operatingSystem": "Web",
                        "description": "Generate catchy, viral YouTube titles instantly with our free AI tool.",
                        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
                    })
                }}
            />
            {children}
        </>
    );
}
LAYOUT

cat << 'PAGE' > app/tools/youtube-title-generator/page.tsx
'use client';
import React, { useState } from 'react';

export default function YouTubeTitlePage() {
    const [topic, setTopic] = useState('');
    const [tone, setTone] = useState('Viral & Catchy');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        if (!topic.trim()) return;
        setLoading(true);
        setResult('');
        try {
            const response = await fetch('/api/youtube-title', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, tone }),
            });
            if (!response.body) throw new Error('No response body');
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                setResult((prev) => prev + decoder.decode(value, { stream: true }));
            }
        } catch (error) {
            console.error(error);
            setResult("Failed to generate titles.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-950 text-slate-200 py-24 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 mb-6">
                        AI YouTube Title Generator
                    </h1>
                    <p className="text-slate-400 text-lg">Generate 5 highly clickable, viral YouTube titles instantly to boost your views.</p>
                </div>
                
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Video Topic or Idea</label>
                        <textarea
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g., How to build a modern React app in 10 minutes..."
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 focus:ring-2 focus:ring-red-500 outline-none text-slate-200"
                            rows={3}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Tone</label>
                        <select
                            value={tone}
                            onChange={(e) => setTone(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 focus:ring-2 focus:ring-red-500 outline-none text-slate-200"
                        >
                            <option value="Viral & Catchy">Viral & Catchy</option>
                            <option value="Educational & Clear">Educational & Clear</option>
                            <option value="Clickbait & Shocking">Clickbait & Shocking</option>
                            <option value="Vlog & Personal">Vlog & Personal</option>
                        </select>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={!topic || loading}
                        className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold py-4 rounded-xl disabled:opacity-50"
                    >
                        {loading ? 'Generating...' : 'Generate Titles'}
                    </button>
                    
                    {result && (
                        <div className="mt-8 p-6 bg-slate-950 border border-slate-800 rounded-xl whitespace-pre-wrap text-lg leading-loose">
                            {result}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
PAGE

# Tool 2: Cover Letter Generator
mkdir -p app/api/cover-letter
cat << 'ROUTE2' > app/api/cover-letter/route.ts
import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
    throw new Error("NEXT_PUBLIC_GEMINI_API_KEY is not set");
}

const ai = new GoogleGenAI({ apiKey });

export async function POST(req: NextRequest) {
    try {
        const { jobTitle, company, skills } = await req.json();

        if (!jobTitle) {
            return NextResponse.json({ error: "Job title is required" }, { status: 400 });
        }

        const model = "gemini-2.5-flash";
        const instruction = `You are an expert career coach. Write a highly professional, engaging, and modern cover letter based on the user's inputs.
Job Title: ${jobTitle}
Company: ${company || '[Company Name]'}
Key Skills/Experience: ${skills || 'General experience in the field'}

Keep it to 3-4 paragraphs. Do not use generic buzzwords; make it sound confident and human. Include placeholder brackets like [Your Name] for the user to fill out.`;

        const responseStream = await ai.models.generateContentStream({
            model: model,
            contents: [{ role: "user", parts: [{ text: "Write the cover letter." }] }],
            config: {
                systemInstruction: instruction,
                temperature: 0.5,
            },
        });

        const stream = new ReadableStream({
            async start(controller) {
                for await (const chunk of responseStream) {
                    if (chunk.text) {
                        controller.enqueue(new TextEncoder().encode(chunk.text));
                    }
                }
                controller.close();
            },
        });

        return new NextResponse(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });

    } catch (error: any) {
        console.error("Gemini API Error:", error);
        return NextResponse.json({ error: error.message || "Failed to generate cover letter" }, { status: 500 });
    }
}
ROUTE2

mkdir -p app/tools/cover-letter-generator
cat << 'LAYOUT2' > app/tools/cover-letter-generator/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "AI Cover Letter Generator - Free Professional Letter Builder",
    description: "Write a perfect, ATS-friendly cover letter in seconds using our free AI generator.",
    keywords: ["cover letter generator", "ai cover letter", "resume builder", "job application ai"],
    alternates: { canonical: '/tools/cover-letter-generator' },
};

export default function CoverLetterLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "SoftwareApplication",
                        "name": "AI Cover Letter Generator",
                        "applicationCategory": "BusinessApplication",
                        "operatingSystem": "Web",
                        "description": "Write a perfect, ATS-friendly cover letter in seconds using our free AI generator.",
                        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
                    })
                }}
            />
            {children}
        </>
    );
}
LAYOUT2

cat << 'PAGE2' > app/tools/cover-letter-generator/page.tsx
'use client';
import React, { useState } from 'react';

export default function CoverLetterPage() {
    const [jobTitle, setJobTitle] = useState('');
    const [company, setCompany] = useState('');
    const [skills, setSkills] = useState('');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        if (!jobTitle.trim()) return;
        setLoading(true);
        setResult('');
        try {
            const response = await fetch('/api/cover-letter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobTitle, company, skills }),
            });
            if (!response.body) throw new Error('No response body');
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                setResult((prev) => prev + decoder.decode(value, { stream: true }));
            }
        } catch (error) {
            console.error(error);
            setResult("Failed to generate cover letter.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-950 text-slate-200 py-24 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400 mb-6">
                        AI Cover Letter Generator
                    </h1>
                    <p className="text-slate-400 text-lg">Generate a professional, tailored cover letter instantly to land your dream job.</p>
                </div>
                
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Job Title Applying For</label>
                        <input
                            type="text"
                            value={jobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
                            placeholder="e.g., Senior Frontend Developer"
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none text-slate-200"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Company Name (Optional)</label>
                        <input
                            type="text"
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            placeholder="e.g., Google"
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none text-slate-200"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Key Skills or Experience</label>
                        <textarea
                            value={skills}
                            onChange={(e) => setSkills(e.target.value)}
                            placeholder="e.g., 5 years of React, led a team of 3, passionate about UI/UX..."
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none text-slate-200"
                            rows={3}
                        />
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={!jobTitle || loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold py-4 rounded-xl disabled:opacity-50"
                    >
                        {loading ? 'Generating...' : 'Generate Cover Letter'}
                    </button>
                    
                    {result && (
                        <div className="mt-8 p-6 bg-slate-950 border border-slate-800 rounded-xl whitespace-pre-wrap text-lg leading-relaxed font-serif">
                            {result}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
PAGE2
