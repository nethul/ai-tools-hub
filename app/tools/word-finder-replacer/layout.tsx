import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Word Finder & Replacer | AI Tool Verse",
    description: "Free online word finder and replacer tool. Find words with live highlighting, select specific matches, and replace them instantly. No upload required.",
    keywords: ["word finder", "find and replace", "text replacer", "word replacer", "text editor", "bulk replace", "find word online"],
};

export default function WordFinderReplacerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
