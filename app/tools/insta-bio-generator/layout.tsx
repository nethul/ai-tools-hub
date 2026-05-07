import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "AI Instagram Bio Generator - Free Creative Bio Maker",
    description: "Generate aesthetic, funny, and professional Instagram bios instantly with our free AI tool. Boost your profile views.",
    keywords: ["instagram bio generator", "ig bio maker", "ai instagram bio", "creative bio ideas", "aesthetic instagram bio"],
    alternates: { canonical: '/tools/insta-bio-generator' },
};

export default function InstaBioLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "SoftwareApplication",
                        "name": "AI Instagram Bio Generator",
                        "applicationCategory": "SocialNetworkingApplication",
                        "operatingSystem": "Web",
                        "description": "Generate aesthetic, funny, and professional Instagram bios instantly with our free AI tool.",
                        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
                    })
                }}
            />
            {children}
        </>
    );
}
