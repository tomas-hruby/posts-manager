"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-surface rounded-lg shadow-xl p-8 border border-border max-w-md w-full">
        <h2 className="text-2xl font-bold text-red-500 mb-4">
          Something went wrong!
        </h2>
        <p className="text-secondary-text mb-6">
          {error.message || "An unexpected error occurred"}
        </p>
        <button
          onClick={reset}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-surface"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
