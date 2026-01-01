import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "AI Image Resizer | AI Tool Verse",
    description: "Free online AI image resizer. Resize, enhance, and optimize images locally in your browser. No upload required.",
    keywords: ["image resizer", "ai image enhancer", "resize image online", "client side image processing", "free photo tool", "image optimizer"],
};

export default function ImageResizerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
