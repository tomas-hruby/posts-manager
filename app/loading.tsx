export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="h-10 w-48 bg-button-bg rounded animate-pulse" />
        </header>

        <div className="space-y-4">
          <div className="h-12 bg-card-bg rounded-lg border border-border animate-pulse" />

          <div className="h-12 bg-card-bg rounded-lg border border-border animate-pulse" />

          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bg-card-bg rounded-lg shadow-md p-6 border border-border"
            >
              <div className="space-y-3">
                <div className="h-6 w-3/4 bg-button-bg rounded animate-pulse" />
                <div className="h-4 w-1/4 bg-button-bg rounded animate-pulse" />
                <div className="h-20 bg-button-bg rounded animate-pulse" />
              </div>
            </div>
          ))}

          <div className="h-16 bg-card-bg rounded-lg border border-border animate-pulse" />
        </div>
      </div>
    </div>
  );
}
