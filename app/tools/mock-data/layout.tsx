import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Mock Data Generator | AI Tool Verse",
    description: "Generate realistic mock data for testing and development with custom schemas.",
    keywords: ["mock data generator", "test data", "fake data json", "sql data generator", "csv generator", "developer tools"],
};

export default function MockDataLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
