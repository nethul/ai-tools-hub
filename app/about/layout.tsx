import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "About Us | AI Tool Verse",
    description: "Learn more about AI Tool Verse, our mission, and the innovative AI tools we provide.",
    keywords: ["about us", "AI Tool Verse", "mission", "company", "AI tools", "artificial intelligence"],
};

export default function FactCheckerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
