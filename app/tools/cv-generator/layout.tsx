import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "AI CV Generator | AI Tool Verse",
    description: "Create professional resumes with AI assistance. Free online CV builder with smart text enhancement and PDF export.",
    keywords: ["cv generator", "resume builder", "ai resume", "free cv maker", "pdf resume", "professional cv"],
};

export default function CVGeneratorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
