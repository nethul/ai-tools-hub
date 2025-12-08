import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://ai-tools-hub.vercel.app'),
  title: {
    default: "AI Tools Hub - Curated AI-Powered Tools Collection",
    template: "%s | AI Tools Hub",
  },
  description: "Discover and explore curated AI-powered tools to boost your productivity, creativity, and decision-making.",
  keywords: ["AI tools", "machine learning", "productivity", "movie recommendations", "AI-powered applications", "Next.js", "React"],
  authors: [{ name: "AI Tools Hub Team" }],
  creator: "AI Tools Hub",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "AI Tools Hub - Curated AI-Powered Tools Collection",
    description: "Discover and explore curated AI-powered tools to boost your productivity, creativity, and decision-making.",
    siteName: "AI Tools Hub",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AI Tools Hub Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Tools Hub - Curated AI-Powered Tools Collection",
    description: "Discover and explore curated AI-powered tools to boost your productivity, creativity, and decision-making.",
  },
  robots: {
    index: true,
    follow: true,
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
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} antialiased bg-slate-900 text-slate-100`}
        >
          <Navbar />
          {children}
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
