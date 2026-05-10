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
    default: "AI Tool Verse | The Ultimate AI Tool Hub for Productivity & Creativity",
    template: "%s | AI Tool Verse",
  },
  description: "Welcome to AI Tool Verse, your premier AI Tool Hub. Discover and explore 100+ curated AI tools designed to boost your productivity, creativity, and daily workflow.",
  keywords: ["AI tools", "AI Tool Hub", "machine learning", "productivity", "AI-powered applications", "Next.js", "React"],
  authors: [{ name: "AI Tool Verse Team" }],
  creator: "AI Tool Verse",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "AI Tool Verse | The Ultimate AI Tool Hub for Productivity & Creativity",
    description: "Welcome to AI Tool Verse, your premier AI Tool Hub. Discover and explore 100+ curated AI tools designed to boost your productivity, creativity, and daily workflow.",
    siteName: "AI Tool Verse",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "AI Tools Verse Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Tool Verse | The Ultimate AI Tool Hub for Productivity & Creativity",
    description: "Welcome to AI Tool Verse, your premier AI Tool Hub. Discover and explore 100+ curated AI tools designed to boost your productivity, creativity, and daily workflow.",
    images: ["/logo.png"],
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
  alternates: {
    canonical: '/',
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
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-XNB1NV195P"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-XNB1NV195P');
            `,
          }}
        />
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
