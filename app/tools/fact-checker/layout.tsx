import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "AI Fact Checker | AI Tool Verse",
    description: "Verify claims and separate fact from fiction using AI and Google Search.",
    keywords: ["fact checker", "fake news detector", "claim verification", "ai fact check", "google fact check"],
};

export default function FactCheckerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
