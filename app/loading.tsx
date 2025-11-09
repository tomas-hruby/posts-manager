export default function Loading() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="h-10 w-48 bg-gray-700 rounded animate-pulse" />
        </header>

        <div className="space-y-4">
          {/* Search bar skeleton */}
          <div className="h-12 bg-gray-800 rounded-lg border border-gray-700 animate-pulse" />

          {/* Sort controls skeleton */}
          <div className="h-12 bg-gray-800 rounded-lg border border-gray-700 animate-pulse" />

          {/* Posts skeleton */}
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700"
            >
              <div className="space-y-3">
                <div className="h-6 w-3/4 bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-1/4 bg-gray-700 rounded animate-pulse" />
                <div className="h-20 bg-gray-700 rounded animate-pulse" />
              </div>
            </div>
          ))}

          {/* Pagination skeleton */}
          <div className="h-16 bg-gray-800 rounded-lg border border-gray-700 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
