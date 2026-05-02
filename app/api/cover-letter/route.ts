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
