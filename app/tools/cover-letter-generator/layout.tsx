import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "AI Cover Letter Generator - Free Professional Letter Builder",
    description: "Write a perfect, ATS-friendly cover letter in seconds using our free AI generator.",
    keywords: ["cover letter generator", "ai cover letter", "resume builder", "job application ai"],
    alternates: { canonical: '/tools/cover-letter-generator' },
};

export default function CoverLetterLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "SoftwareApplication",
                        "name": "AI Cover Letter Generator",
                        "applicationCategory": "BusinessApplication",
                        "operatingSystem": "Web",
                        "description": "Write a perfect, ATS-friendly cover letter in seconds using our free AI generator.",
                        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
                    })
                }}
            />
            {children}
        </>
    );
}
