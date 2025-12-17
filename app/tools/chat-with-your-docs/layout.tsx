import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Chat with Docs | AI Tool Verse",
    description: "Upload documents and have interactive conversations with them using AI.",
    keywords: ["chat with pdf", "document analysis", "ai document chat", "pdf ai", "doc chat"],
};

export default function ChatWithDocsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
