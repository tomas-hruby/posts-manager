import PostsTable from "@/components/PostsTable";
import StoreProvider from "@/lib/store/StoreProvider";
import ThemeToggle from "@/components/ThemeToggle";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Posts Manager - Manage Your Posts Efficiently",
  description: "Manage posts with infinite scroll, real-time search, and advanced sorting. Create, edit, and delete posts with a modern, responsive interface.",
  openGraph: {
    title: "Posts Manager - Manage Your Posts Efficiently",
    description: "Manage posts with infinite scroll, real-time search, and advanced sorting. Create, edit, and delete posts with a modern, responsive interface.",
  },
};

export default async function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Posts Manager",
    "description": "A modern, high-performance posts management application with infinite scroll, real-time filtering, and advanced sorting capabilities.",
    "url": process.env.NEXT_PUBLIC_SITE_URL || "https://posts-manager.vercel.app",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "100",
    },
  };

  return (
    <StoreProvider initialPosts={[]}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-[linear-gradient(to_bottom_right,var(--color-background),var(--color-surface))]">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
          <header className="mb-4 sm:mb-6 md:mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-primary-text">
                Posts Manager
              </h1>
            </div>
            <ThemeToggle />
          </header>

          <PostsTable />
        </div>
      </main>
    </StoreProvider>
  );
}
