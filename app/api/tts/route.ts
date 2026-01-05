import { NextRequest, NextResponse } from 'next/server';

// Voice mapping for Google TTS
const VOICE_LANG_MAP: Record<string, { lang: string; name?: string }> = {
    'en-US-female': { lang: 'en-US' },
    'en-US-male': { lang: 'en-US' },
    'en-GB-female': { lang: 'en-GB' },
    'en-GB-male': { lang: 'en-GB' },
    'en-AU-female': { lang: 'en-AU' },
    'en-IN-female': { lang: 'en-IN' },
    'es-ES-female': { lang: 'es-ES' },
    'fr-FR-female': { lang: 'fr-FR' },
    'de-DE-female': { lang: 'de-DE' },
    'it-IT-female': { lang: 'it-IT' },
    'pt-BR-female': { lang: 'pt-BR' },
    'ja-JP-female': { lang: 'ja-JP' },
    'ko-KR-female': { lang: 'ko-KR' },
    'zh-CN-female': { lang: 'zh-CN' },
    'hi-IN-female': { lang: 'hi-IN' },
};

export async function POST(request: NextRequest) {
    try {
        const { text, voice, rate } = await request.json();

        if (!text || typeof text !== 'string' || text.trim().length === 0) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        // Limit text length for free API
        const trimmedText = text.trim().slice(0, 200);

        if (text.length > 200) {
            console.warn('Text truncated to 200 characters for free TTS');
        }

        // Get language
        const voiceConfig = VOICE_LANG_MAP[voice] || { lang: 'en-US' };

        // Use Google Translate TTS (free, no API key needed)
        const encodedText = encodeURIComponent(trimmedText);
        const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${voiceConfig.lang}&client=tw-ob&q=${encodedText}`;

        const response = await fetch(ttsUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://translate.google.com/',
            },
        });

        if (!response.ok) {
            console.error('TTS API error:', response.status);
            return NextResponse.json({ error: 'Failed to generate audio. Please try with shorter text.' }, { status: 500 });
        }

        const audioBuffer = await response.arrayBuffer();

        return new NextResponse(audioBuffer, {
            headers: {
                'Content-Type': 'audio/mpeg',
                'Content-Disposition': 'attachment; filename="speech.mp3"',
            },
        });
    } catch (error) {
        console.error('TTS error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
