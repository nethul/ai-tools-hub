'use server';

import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
    throw new Error("NEXT_PUBLIC_GEMINI_API_KEY is not set");
}

const ai = new GoogleGenAI({ apiKey });

export async function humanizeText(text: string): Promise<string> {
    try {
        const model = 'gemini-2.5-flash';

        const prompt = `
            Rewrite the following text to sound more human, natural, and conversational.
            Avoid robotic phrasing, overly complex jargon (unless appropriate for context), and stiff sentence structures.
            Maintain the original meaning but improve flow, tone, and readability.
            
            Original Text:
            "${text}"
            
            Humanized Text:
        `;

        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                temperature: 0.7, // Balance between creativity and fidelity
            }
        });

        const result = response.text;

        if (!result) {
            throw new Error("No response generated.");
        }

        return result.trim();

    } catch (error: any) {
        console.error("Error humanizing text:", error);
        throw new Error(error.message || "Failed to humanize text");
    }
}
