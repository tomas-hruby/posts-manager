import PostsTable from "@/components/PostsTable";
import StoreProvider from "@/lib/store/StoreProvider";

export const metadata = {
  title: "Posts Manager",
  description: "Manage posts with infinite scroll and on-demand data fetching",
};

export default async function Home() {
  return (
    <StoreProvider initialPosts={[]}>
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
