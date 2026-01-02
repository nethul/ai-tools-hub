import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { NewsArticle } from "@/types/viral-news";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
    throw new Error("NEXT_PUBLIC_GEMINI_API_KEY is not set");
}

const ai = new GoogleGenAI({ apiKey });

export async function POST(req: NextRequest) {
    try {
        const { article } = await req.json() as { article: NewsArticle };

        if (!article || !article.headline) {
            return NextResponse.json({ error: "Article data is required" }, { status: 400 });
        }

        const textPrompt = `
    You are a world-class social media manager. Rewrite the following news story for Facebook to get maximum engagement (likes, shares, comments).
    
    Original Headline: ${article.headline}
    Original Summary: ${article.summary}

    Return a JSON object with:
    1. "fbPost": A highly engaging, slightly sensationalized post (emojis, hook, call to action).
    2. "hashtags": A list of 5-7 viral hashtags.
    3. "seoKeywords": A list of 5 keywords for SEO.

    Format: JSON.
  `;

        const imagePrompt = `
    Create a highly engaging, viral, futuristic, scroll-stopping digital art illustration for a Facebook post about this news: "${article.headline}". 
    Summary: "${article.summary}". 
    Style: High-tech, dramatic, neon, cinematic lighting, 4k render, clickbait style but professional art.
    Do not include text in the image.
  `;

        // First get the text enhancement
        const textResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: textPrompt,
            config: {
                responseMimeType: 'application/json',
            }
        });

        // Process Text Response
        const data = JSON.parse(textResponse.text || '{}');

        // Try to generate image with Imagen 3
        let generatedImage = '';
        try {
            const imageResponse = await ai.models.generateImages({
                model: 'imagen-3.0-generate-002',
                prompt: imagePrompt,
                config: {
                    numberOfImages: 1,
                },
            });

            if (imageResponse.generatedImages && imageResponse.generatedImages.length > 0) {
                const img = imageResponse.generatedImages[0];
                if (img.image?.imageBytes) {
                    generatedImage = `data:image/png;base64,${img.image.imageBytes}`;
                }
            }
        } catch (imgError: any) {
            console.warn("Image generation failed, continuing without image:", imgError.message);
            // Continue without image - not a critical failure
        }

        const enhancedArticle: NewsArticle = {
            ...article,
            enhancedContent: {
                fbPost: data.fbPost,
                hashtags: data.hashtags,
                seoKeywords: data.seoKeywords,
                generatedImage: generatedImage,
            }
        };

        return NextResponse.json({ article: enhancedArticle });

    } catch (error: any) {
        console.error("Enhance API Error:", error);
        return NextResponse.json({ error: error.message || "Failed to enhance article" }, { status: 500 });
    }
}
