import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "AI Text Summarizer | AI Tool Verse",
    description: "Condense long text into concise summaries instantly using AI.",
    keywords: ["text summarizer", "article abstract", "tldr generator", "summary maker", "content condenser"],
};

export default function TextSummarizerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
