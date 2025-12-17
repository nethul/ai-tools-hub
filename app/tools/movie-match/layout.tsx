import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Movie Match AI | AI Tool Verse",
    description: "Get personalized movie recommendations based on your preferences using AI.",
    keywords: ["movie recommender", "ai movie suggestions", "film finder", "what to watch", "movie discovery"],
};

export default function MovieMatchLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
