import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
    throw new Error("NEXT_PUBLIC_GEMINI_API_KEY is not set");
}

const ai = new GoogleGenAI({ apiKey });

export async function POST(req: NextRequest) {
    try {
        const { title, content, tone } = await req.json();

        if (!title) {
            return NextResponse.json({ error: "Page title is required" }, { status: 400 });
        }

        const model = "gemini-2.5-flash";
        const instruction = `You are a world-class SEO specialist. Generate 3 compelling, high-CTR meta descriptions for a webpage based on the provided title and context.
Title: ${title}
Context: ${content || 'N/A'}
Strategy: ${tone || 'Professional & Persuasive'}.

Requirements:
- Each description must be between 140 and 160 characters.
- Include the primary keywords naturally.
- Add a clear Call to Action (CTA).
- Separate each description with a blank line.
- Do not include quotes, intro text, or numbering.
- Focus on the latest 2026 search intent patterns.`;

        const responseStream = await ai.models.generateContentStream({
            model: model,
            contents: [{ role: "user", parts: [{ text: `Title: ${title}\nContext: ${content}` }] }],
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
        return NextResponse.json({ error: error.message || "Failed to generate meta descriptions" }, { status: 500 });
    }
}
