import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "AI YouTube Title Generator - Free Viral Title Maker",
    description: "Generate catchy, viral YouTube titles instantly with our free AI tool. Boost your CTR and get more views.",
    keywords: ["youtube title generator", "youtube title maker", "ai youtube titles", "viral youtube titles"],
    alternates: { canonical: '/tools/youtube-title-generator' },
};

export default function YouTubeTitleLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "SoftwareApplication",
                        "name": "AI YouTube Title Generator",
                        "applicationCategory": "UtilitiesApplication",
                        "operatingSystem": "Web",
                        "description": "Generate catchy, viral YouTube titles instantly with our free AI tool.",
                        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
                    })
                }}
            />
            {children}
        </>
    );
}
