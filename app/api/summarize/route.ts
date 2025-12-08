import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { SummaryOptions, SummaryLength, SummaryFormat } from "../../../types";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
    throw new Error("NEXT_PUBLIC_GEMINI_API_KEY is not set");
}

const ai = new GoogleGenAI({ apiKey });

const buildSystemInstruction = (options: SummaryOptions): string => {
    let instruction = "You are an expert editor and summarizer. Your goal is to provide accurate, concise, and readable summaries of the provided text.";

    instruction += `\n\nFormat Preference: ${options.format}.`;

    if (options.format === SummaryFormat.BULLET_POINTS) {
        instruction += " Use a markdown list for the output.";
    } else if (options.format === SummaryFormat.TLDR) {
        instruction += " Provide a very brief, high-level overview in 1-2 sentences.";
    } else {
        instruction += " Provide coherent paragraphs.";
    }

    instruction += `\n\nLength Preference: ${options.length}.`;

    if (options.length === SummaryLength.SHORT) {
        instruction += " Keep it very concise, capturing only the absolute most important points.";
    } else if (options.length === SummaryLength.LONG) {
        instruction += " Provide a comprehensive summary that includes supporting details and nuance.";
    } else {
        instruction += " Balance brevity with detail.";
    }

    instruction += "\n\nDo not include any preamble (e.g., 'Here is the summary'). Just output the summary directly.";

    return instruction;
};

export async function POST(req: NextRequest) {
    try {
        const { text, options } = await req.json();

        if (!text) {
            return NextResponse.json({ error: "Text is required" }, { status: 400 });
        }

        const model = "gemini-2.5-flash";

        const responseStream = await ai.models.generateContentStream({
            model: model,
            contents: [
                {
                    role: "user",
                    parts: [{ text: text }],
                },
            ],
            config: {
                systemInstruction: buildSystemInstruction(options),
                temperature: 0.3,
            },
        });

        // Create a ReadableStream from the generator
        const stream = new ReadableStream({
            async start(controller) {
                for await (const chunk of responseStream) {
                    const chunkText = chunk.text;
                    if (chunkText) {
                        controller.enqueue(new TextEncoder().encode(chunkText));
                    }
                }
                controller.close();
            },
        });

        return new NextResponse(stream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
            },
        });

    } catch (error: any) {
        console.error("Gemini API Error:", error);
        return NextResponse.json({ error: error.message || "Failed to generate summary" }, { status: 500 });
    }
}
