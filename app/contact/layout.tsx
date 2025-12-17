import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contact Us | AI Tool Verse",
    description: "Get in touch with AI Tool Verse. Contact our support team, send feedback, or inquire about partnerships.",
    keywords: ["contact us", "AI Tool Verse support", "get in touch", "customer service", "feedback", "partnerships"],
};

export default function FactCheckerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
