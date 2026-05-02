import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "AI CV Generator - Free Smart Resume Builder",
    description: "Create ATS-friendly, professional resumes in minutes with our free AI CV Generator. Enhance your experience and export to PDF instantly.",
    keywords: ["cv generator", "resume builder", "ai resume", "free cv maker", "pdf resume", "professional cv", "ai cv builder"],
    alternates: {
      canonical: '/tools/cv-generator',
    },
};

export default function CVGeneratorLayout({
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
              "name": "AI CV Generator",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web",
              "description": "Create ATS-friendly, professional resumes in minutes with our free AI CV Generator.",
              "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
            })
          }}
        />
        {children}
      </>
    );
}
