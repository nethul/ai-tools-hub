import { GoogleGenAI } from "@google/genai";

export interface Coordinates {
    latitude: number;
    longitude: number;
}

export interface GroundingSource {
    title?: string;
    uri: string;
}

export interface ImageResult {
    imageUrl: string;
    description?: string;
    sources?: GroundingSource[];
}

const getAI = () => {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("Gemini API key is not configured");
    }
    return new GoogleGenAI({ apiKey });
};

export const generateLocationImage = async (coords: Coordinates): Promise<ImageResult> => {
    const ai = getAI();

    // "nano banana pro" corresponds to 'gemini-3-pro-image-preview'
    const modelId = 'gemini-2.0-flash-exp';

    const prompt = `
    Generate a photorealistic, cinematic, and high-quality image of the location at these coordinates: 
    Latitude: ${coords.latitude}, Longitude: ${coords.longitude}.
    
    Use the available tools to research the geography, biome, terrain, and typical weather of this specific location on Earth.
    Create a vivid visualization of what it looks like standing at that spot. 
    Focus on realistic lighting, textures, and environmental details.
  `;

    try {
        const response = await ai.models.generateContent({
            model: modelId,
            contents: {
                parts: [{ text: prompt }]
            },
            config: {
                imageConfig: {
                    aspectRatio: "16:9",
                    imageSize: "1024x1024"
                },
                // Enable search grounding to help the model "know" where the coordinates are
                tools: [{ googleSearch: {} }],
            },
        });

        let imageUrl = '';
        let description = '';
        const sources: GroundingSource[] = [];

        // Extract grounding chunks
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (groundingChunks) {
            for (const chunk of groundingChunks) {
                if (chunk.web && chunk.web.uri) {
                    sources.push({ title: chunk.web.title, uri: chunk.web.uri });
                }
            }
        }

        // Iterate through parts to find the image and potentially text description
        if (response.candidates && response.candidates[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData && part.inlineData.data) {
                    imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
                } else if (part.text) {
                    description += part.text;
                }
            }
        }

        if (!imageUrl) {
            // Fallback for when image generation isn't supported or fails but text is returned
            // Note: In a real app we might want to handle this better
            throw new Error("No image was generated. The model might have declined the request or failed to produce visual output.");
        }

        return {
            imageUrl,
            description: description.trim(),
            sources
        };

    } catch (error: unknown) {
        console.error("Gemini API Error:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(errorMessage || "Failed to generate image.");
    }
};
