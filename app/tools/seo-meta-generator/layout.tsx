import { Metadata } from "next";

export const metadata: Metadata = {
    title: "AI SEO Meta Description Generator | AIToolVerse",
    description: "Generate highly optimized, clickable SEO meta descriptions in seconds with our free AI tool.",
};

export default function SEOMetaLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
