import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "MovieMatch AI - The Best Free AI Movie Recommender",
    description: "Stop scrolling. Let our AI analyze your taste and find the perfect movie across Netflix, Hulu, and Prime Video instantly.",
    keywords: ["movie recommender", "ai movie suggestions", "film finder", "what to watch", "movie discovery", "free ai movie recommender"],
    alternates: {
      canonical: '/tools/movie-match',
    },
};

export default function MovieMatchLayout({
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
              "name": "MovieMatch AI",
              "applicationCategory": "EntertainmentApplication",
              "operatingSystem": "Web",
              "description": "Stop scrolling. Let our AI analyze your taste and find the perfect movie across Netflix, Hulu, and Prime Video instantly.",
              "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
            })
          }}
        />
        {children}
      </>
    );
}
