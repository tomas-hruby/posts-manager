import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/lib/toast/ToastContext";
import ToastContainer from "@/components/ToastContainer";
import { ThemeProvider } from "@/lib/theme/ThemeContext";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
  fallback: ["system-ui", "arial"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://posts-manager.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "Posts Manager - Efficient Post Management System",
    template: "%s | Posts Manager",
  },
  description: "A modern, high-performance posts management application with infinite scroll, real-time filtering, and advanced sorting capabilities. Built with Next.js 16 and React 19.",
  keywords: ["posts manager", "content management", "next.js", "react", "infinite scroll", "post management system"],
  authors: [{ name: "Posts Manager Team" }],
  creator: "Posts Manager",
  publisher: "Posts Manager",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    title: "Posts Manager - Efficient Post Management System",
    description: "A modern, high-performance posts management application with infinite scroll, real-time filtering, and advanced sorting capabilities.",
    siteName: "Posts Manager",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Posts Manager Application",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Posts Manager - Efficient Post Management System",
    description: "A modern, high-performance posts management application with infinite scroll, real-time filtering, and advanced sorting capabilities.",
    images: ["/og-image.png"],
    creator: "@postsmanager",
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
  manifest: "/manifest.json",
  verification: {
    // Add your verification codes here when available
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
    // bing: "your-bing-verification-code",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://jsonplaceholder.typicode.com" />
        <link rel="dns-prefetch" href="https://jsonplaceholder.typicode.com" />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <ToastProvider>
            {children}
            <ToastContainer />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
