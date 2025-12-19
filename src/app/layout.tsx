import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ContentForge AI - AI-Powered Content Intelligence",
    template: "%s | ContentForge AI",
  },
  description:
    "Transform, analyze, and repurpose your content with AI. Upload documents, chat with your files, and create social media content in seconds.",
  keywords: [
    "AI content",
    "document analysis",
    "content transformation",
    "PDF chat",
    "Gemini AI",
    "content repurposing",
  ],
  authors: [{ name: "ContentForge AI" }],
  creator: "ContentForge AI",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://contentforge.ai",
    siteName: "ContentForge AI",
    title: "ContentForge AI - AI-Powered Content Intelligence",
    description:
      "Transform, analyze, and repurpose your content with AI. Upload documents, chat with your files, and create social media content in seconds.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ContentForge AI - AI-Powered Content Intelligence",
    description:
      "Transform, analyze, and repurpose your content with AI.",
    creator: "@contentforgeai",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
