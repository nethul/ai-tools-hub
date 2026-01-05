import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Text to Speech - Convert Text to Voice Online | AI Tools Hub',
    description: 'Convert text to natural speech instantly. Choose from multiple voices, adjust speed and pitch. Works offline using your browser\'s built-in speech engine.',
    keywords: ['text to speech', 'TTS', 'voice generator', 'speech synthesis', 'read aloud', 'audio converter'],
};

export default function TextToSpeechLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
