import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { NewsArticle, NewsSource } from "@/types/viral-news";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
    throw new Error("NEXT_PUBLIC_GEMINI_API_KEY is not set");
}

const ai = new GoogleGenAI({ apiKey });

export async function POST(req: NextRequest) {
    try {
        const { niche } = await req.json();

        if (!niche || typeof niche !== 'string') {
            return NextResponse.json({ error: "Niche is required" }, { status: 400 });
        }

        const prompt = `
    Act as a viral content researcher. Search for the top 4 most engaging, controversial, or attention-grabbing ${niche} news stories happening right now (last 24-48 hours).
    Focus on topics that are trending, controversial, breakthrough announcements, or surprising developments in the ${niche} space.
    
    For EACH story, I need:
    1. A catchy, clickbait-style headline.
    2. A brief summary (2 sentences).
    3. A "Viral Score" estimate (1-100).
    4. 3 relevant tags.

    CRITICAL: You must format your response as a strict JSON array of objects. 
    Wrap the JSON array in <<<JSON_START>>> and <<<JSON_END>>> delimiters so I can extract it.
    
    Example format:
    <<<JSON_START>>>
    [
      {
        "headline": "Breaking: Major development in ${niche}",
        "summary": "Something significant happened...",
        "viralScore": 95,
        "tags": ["${niche}", "Trending", "Breaking"]
      }
    ]
    <<<JSON_END>>>
  `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        const text = response.text || '';

        // Extract Sources from Grounding Metadata
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const globalSources: NewsSource[] = (chunks as any[])
            .filter((c: any) => c.web)
            .map((c: any) => ({
                title: c.web.title || 'Source',
                uri: c.web.uri || '#',
            }));

        // Parse the JSON from the text
        const jsonMatch = text.match(/<<<JSON_START>>>([\s\S]*?)<<<JSON_END>>>/);
        if (!jsonMatch || !jsonMatch[1]) {
            console.error("Failed to parse JSON from model response:", text);
            return NextResponse.json({ error: "Failed to parse news data." }, { status: 500 });
        }

        const rawArticles = JSON.parse(jsonMatch[1]);

        const articles: NewsArticle[] = rawArticles.map((article: any, index: number) => ({
            id: `news-${Date.now()}-${index}`,
            headline: article.headline,
            summary: article.summary,
            viralScore: article.viralScore,
            tags: article.tags,
            sources: globalSources.slice(0, 3),
        }));

        return NextResponse.json({ articles });

    } catch (error: any) {
        console.error("Viral News API Error:", error);
        return NextResponse.json({ error: error.message || "Failed to fetch viral news" }, { status: 500 });
    }
}
