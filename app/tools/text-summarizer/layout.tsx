import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "AI Text Summarizer - Condense Articles & Docs Instantly",
    description: "Use our free AI Text Summarizer to turn long articles, PDFs, and documents into concise, actionable summaries in seconds.",
    keywords: ["text summarizer", "article abstract", "tldr generator", "summary maker", "content condenser", "ai summarizer", "free summary tool"],
    alternates: {
      canonical: '/tools/text-summarizer',
    },
};

export default function TextSummarizerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "AI Text Summarizer",
              "applicationCategory": "ProductivityApplication",
              "operatingSystem": "Web",
              "description": "Use our free AI Text Summarizer to turn long articles, PDFs, and documents into concise, actionable summaries in seconds.",
              "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
            })
          }}
        />
        {children}
      </>
    );
}
