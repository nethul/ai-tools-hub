import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Geo Vision AI | AI Tool Verse",
    description: "Analyze locations and geography from images using AI computer vision.",
    keywords: ["image location finder", "geo analysis", "landmark recognition", "ai vision", "geoguessr ai"],
};

export default function GeoVisionLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
