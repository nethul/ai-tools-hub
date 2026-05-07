#!/bin/bash
cd /root/.openclaw/workspace/ai-tools-hub

# Tool 3: AI Instagram Bio Generator
mkdir -p app/api/insta-bio
cat << 'ROUTE' > app/api/insta-bio/route.ts
import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
    throw new Error("NEXT_PUBLIC_GEMINI_API_KEY is not set");
}

const ai = new GoogleGenAI({ apiKey });

export async function POST(req: NextRequest) {
    try {
        const { details, tone } = await req.json();

        if (!details) {
            return NextResponse.json({ error: "Details are required" }, { status: 400 });
        }

        const model = "gemini-2.5-flash";
        const instruction = `You are an expert social media manager. Generate 3 engaging, highly optimized Instagram bios based on the user's details.
Tone: ${tone || 'Professional & Clean'}.
Keep each bio under 150 characters. Use emojis if appropriate for the tone. Separate each bio with a blank line. Do not include quotes or intro text.`;

        const responseStream = await ai.models.generateContentStream({
            model: model,
            contents: [{ role: "user", parts: [{ text: details }] }],
            config: {
                systemInstruction: instruction,
                temperature: 0.8,
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
        return NextResponse.json({ error: error.message || "Failed to generate bios" }, { status: 500 });
    }
}
ROUTE

mkdir -p app/tools/insta-bio-generator
cat << 'LAYOUT' > app/tools/insta-bio-generator/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "AI Instagram Bio Generator - Free Creative Bio Maker",
    description: "Generate aesthetic, funny, and professional Instagram bios instantly with our free AI tool. Boost your profile views.",
    keywords: ["instagram bio generator", "ig bio maker", "ai instagram bio", "creative bio ideas", "aesthetic instagram bio"],
    alternates: { canonical: '/tools/insta-bio-generator' },
};

export default function InstaBioLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "SoftwareApplication",
                        "name": "AI Instagram Bio Generator",
                        "applicationCategory": "SocialNetworkingApplication",
                        "operatingSystem": "Web",
                        "description": "Generate aesthetic, funny, and professional Instagram bios instantly with our free AI tool.",
                        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
                    })
                }}
            />
            {children}
        </>
    );
}
LAYOUT

cat << 'PAGE' > app/tools/insta-bio-generator/page.tsx
'use client';
import React, { useState } from 'react';

export default function InstaBioPage() {
    const [details, setDetails] = useState('');
    const [tone, setTone] = useState('Aesthetic & Minimalist');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        if (!details.trim()) return;
        setLoading(true);
        setResult('');
        try {
            const response = await fetch('/api/insta-bio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ details, tone }),
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
            setResult("Failed to generate bios.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-950 text-slate-200 py-24 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-amber-500 mb-6">
                        AI Instagram Bio Generator
                    </h1>
                    <p className="text-slate-400 text-lg">Generate 3 engaging, highly optimized Instagram bios to make your profile stand out.</p>
                </div>
                
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">About You / Your Brand</label>
                        <textarea
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            placeholder="e.g., I'm a Perth wedding photographer who loves coffee, dogs, and chasing golden hour..."
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 focus:ring-2 focus:ring-pink-500 outline-none text-slate-200"
                            rows={3}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Tone & Vibe</label>
                        <select
                            value={tone}
                            onChange={(e) => setTone(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 focus:ring-2 focus:ring-pink-500 outline-none text-slate-200"
                        >
                            <option value="Aesthetic & Minimalist">Aesthetic & Minimalist</option>
                            <option value="Professional & Clean">Professional & Clean</option>
                            <option value="Funny & Quirky">Funny & Quirky</option>
                            <option value="Influencer & Bold">Influencer & Bold</option>
                        </select>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={!details || loading}
                        className="w-full bg-gradient-to-r from-pink-600 to-amber-500 hover:from-pink-500 hover:to-amber-400 text-white font-bold py-4 rounded-xl disabled:opacity-50"
                    >
                        {loading ? 'Generating...' : 'Generate Bios'}
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
