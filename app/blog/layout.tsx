import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "AI Tool Verse Blog",
    description: "Latest updates and insights about AI tools and technology.",
    keywords: ["ai tools", "ai technology", "ai updates", "ai insights", "ai tool verse"],
};

export default function BlogHomeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
