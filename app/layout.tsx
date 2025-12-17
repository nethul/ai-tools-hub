import type { Metadata } from "next";

import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import { Analytics } from "@vercel/analytics/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://aitoolverse.app'),
  title: {
    default: "AI Tools Verse - Curated AI-Powered Tools Collection",
    template: "%s | AI Tools Verse",
  },
  description: "Discover and explore curated AI-powered tools to boost your productivity, creativity, and decision-making.",
  keywords: ["AI tools", "machine learning", "productivity", "movie recommendations", "AI-powered applications", "Next.js", "React"],
  authors: [{ name: "AI Tools Verse Team" }],
  creator: "AI Tools Verse",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "AI Tool Verse - Curated AI-Powered Tools Collection",
    description: "Discover and explore curated AI-powered tools to boost your productivity, creativity, and decision-making.",
    siteName: "AI Tools Hub",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AI Tools Verse Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Tools Verse - Curated AI-Powered Tools Collection",
    description: "Discover and explore curated AI-powered tools to boost your productivity, creativity, and decision-making.",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5855569700640315"
          crossOrigin="anonymous"></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} antialiased bg-slate-900 text-slate-100`}
      >
        <Navbar />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
