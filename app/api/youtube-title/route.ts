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
