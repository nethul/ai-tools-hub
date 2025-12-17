import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "AI Text Humanizer | AI Tool Verse",
    description: "Convert AI-generated text into natural, human-like writing.",
    keywords: ["humanize ai text", "bypass ai detection", "natural writing", "ai to human", "text humanizer"],
};

export default function HumanizerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
