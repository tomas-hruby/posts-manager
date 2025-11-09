import PostsTable from "@/components/PostsTable";
import { fetchPosts } from "@/lib/api";
import StoreProvider from "@/lib/store/StoreProvider";

export default async function Home() {
  // Fetch ALL posts once on initial page load
  const data = await fetchPosts({
    page: 1,
    limit: 1000, // Get all posts at once
    sortBy: "id",
    sortOrder: "asc",
    search: "",
  });

  return (
    <StoreProvider initialPosts={data.data}>
      <main className="min-h-screen bg-linear-to-br from-gray-900 to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Posts Manager
            </h1>
          </header>

          <PostsTable />
        </div>
      </main>
    </StoreProvider>
  );
}
