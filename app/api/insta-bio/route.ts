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
