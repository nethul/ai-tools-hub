import { NextRequest, NextResponse } from 'next/server';

// Edge TTS voice mapping
const VOICE_MAP: Record<string, string> = {
    'en-US-male': 'en-US-GuyNeural',
    'en-US-female': 'en-US-JennyNeural',
    'en-GB-male': 'en-GB-RyanNeural',
    'en-GB-female': 'en-GB-SoniaNeural',
    'en-AU-female': 'en-AU-NatashaNeural',
    'en-IN-female': 'en-IN-NeerjaNeural',
    'es-ES-female': 'es-ES-ElviraNeural',
    'fr-FR-female': 'fr-FR-DeniseNeural',
    'de-DE-female': 'de-DE-KatjaNeural',
    'it-IT-female': 'it-IT-ElsaNeural',
    'pt-BR-female': 'pt-BR-FranciscaNeural',
    'ja-JP-female': 'ja-JP-NanamiNeural',
    'ko-KR-female': 'ko-KR-SunHiNeural',
    'zh-CN-female': 'zh-CN-XiaoxiaoNeural',
    'hi-IN-female': 'hi-IN-SwaraNeural',
    'ar-SA-male': 'ar-SA-HamedNeural',
};

export async function POST(request: NextRequest) {
    try {
        const { text, voice, rate } = await request.json();

        if (!text || typeof text !== 'string' || text.trim().length === 0) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        if (text.length > 5000) {
            return NextResponse.json({ error: 'Text too long. Maximum 5000 characters.' }, { status: 400 });
        }

        // Select voice
        const selectedVoice = VOICE_MAP[voice] || 'en-US-JennyNeural';

        // Calculate rate string (e.g., "+20%" or "-10%")
        const ratePercent = Math.round((rate - 1) * 100);
        const rateString = ratePercent >= 0 ? `+${ratePercent}%` : `${ratePercent}%`;

        // Build SSML
        const ssml = `
            <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
                <voice name="${selectedVoice}">
                    <prosody rate="${rateString}">
                        ${escapeXml(text)}
                    </prosody>
                </voice>
            </speak>
        `.trim();

        // Call Microsoft Edge TTS API
        const response = await fetch(
            `https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D68491D6F4&ConnectionId=${generateConnectionId()}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/ssml+xml',
                    'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                },
                body: ssml,
            }
        );

        if (!response.ok) {
            console.error('TTS API error:', response.status, await response.text());
            return NextResponse.json({ error: 'Failed to generate audio' }, { status: 500 });
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

function escapeXml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function generateConnectionId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
