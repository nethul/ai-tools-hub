'use server';

import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
    throw new Error("NEXT_PUBLIC_GEMINI_API_KEY is not set");
}

const ai = new GoogleGenAI({ apiKey });

export async function polishText(text: string, type: 'summary' | 'experience' = 'experience'): Promise<string> {
    try {
        const model = 'gemini-2.5-flash';

        let contextParams = "";
        if (type === 'summary') {
            contextParams = "Refine this professional summary to be more impactful, confident, and concise. Highlight key strengths.";
        } else {
            contextParams = "Rewrite this job description bullet point to be action-oriented, results-driven, and professional. Use strong action verbs.";
        }

        const prompt = `
            You are a professional resume writer.
            ${contextParams}
            
            Original Text:
            "${text}"
            
            Polished Version:
        `;

        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                temperature: 0.7,
            }
        });

        const result = response.text;

        if (!result) {
            throw new Error("No response generated.");
        }

        return result.trim();

    } catch (error: unknown) {
        console.error("Error polishing text:", error);
        throw new Error((error as Error).message || "Failed to polish text");
    }
}
