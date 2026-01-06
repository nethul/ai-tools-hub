'use server';

import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
    throw new Error("NEXT_PUBLIC_GEMINI_API_KEY is not set");
}

const ai = new GoogleGenAI({ apiKey });

export async function generateCaptions(topic: string, platform: string, tone: string): Promise<string[]> {
    try {
        const model = 'gemini-2.5-flash';

        const prompt = `
            Generate 3 distinct social media captions for the following topic.
            
            Topic/Content: "${topic}"
            Platform: ${platform}
            Tone: ${tone}
            
            Requirements:
            - Create 3 options.
            - Include relevant emojis.
            - Include 3-5 relevant hashtags for each option.
            - Keep in mind the character limits and style of the selected platform.
            - OUTPUT ONLY A RAW JSON ARRAY of strings, where each string is a complete caption option.
            - Do not include any markdown formatting (like ** or ##) in the caption text unless it's typical for the platform (e.g. hashtags).
            - Do not include any introductory text or explanation. 
            
            Example Output Format:
            ["Caption 1 text...", "Caption 2 text...", "Caption 3 text..."]
        `;

        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                temperature: 0.8,
            }
        });

        const result = response.text;

        if (!result) {
            throw new Error("No response generated.");
        }

        // Clean up markdown code blocks if present
        let cleanResult = result.trim();
        if (cleanResult.startsWith('```json')) {
            cleanResult = cleanResult.replace(/^```json/, '').replace(/```$/, '');
        } else if (cleanResult.startsWith('```')) {
            cleanResult = cleanResult.replace(/^```/, '').replace(/```$/, '');
        }

        try {
            const captions = JSON.parse(cleanResult);
            if (Array.isArray(captions)) {
                return captions.map(c => String(c).trim());
            } else {
                throw new Error("Response is not an array");
            }
        } catch (e) {
            console.error("Failed to parse JSON response:", result);
            // Fallback: split by double newlines if JSON parsing fails, though prompt should enforce JSON
            return result.split(/\n\n+/).filter(Boolean);
        }

    } catch (error: any) {
        console.error("Error generating captions:", error);
        throw new Error(error.message || "Failed to generate captions");
    }
}
