"use client";

import { useState } from "react";
import { Post } from "@/lib/types";

interface PostModalProps {
  post: Post | null;
  onClose: () => void;
  onPostCreated: (newPost: Post) => void;
  onPostUpdated: (updatedPost: Post) => void;
}

export default function PostModal({
  post,
  onClose,
  onPostCreated,
  onPostUpdated,
}: PostModalProps) {
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const body = formData.get("body") as string;

    try {
      if (post) {
        // Update existing post
        const updatedPost: Post = {
          ...post,
          title,
          body,
        };
        onPostUpdated(updatedPost);
      } else {
        // Create new post with temporary ID
        const newPost: Post = {
          id: Date.now(), // Use timestamp as temporary ID
          userId: 1,
          title,
          body,
        };
        onPostCreated(newPost);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-3 sm:p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 id="modal-title" className="text-xl sm:text-2xl font-bold text-white">
              {post ? "Edit Post" : "Create New Post"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1"
              aria-label="Close modal"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {error && (
            <div
              className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-red-950 border border-red-800 text-red-400 rounded-lg text-sm"
              role="alert"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-200 mb-1.5"
              >
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                defaultValue={post?.title || ""}
                required
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-gray-900 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter post title"
              />
            </div>

            <div>
              <label
                htmlFor="body"
                className="block text-sm font-medium text-gray-200 mb-1.5"
              >
                Body
              </label>
              <textarea
                id="body"
                name="body"
                defaultValue={post?.body || ""}
                required
                rows={6}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-gray-900 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                placeholder="Enter post content"
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-2 sm:pt-4">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 border border-gray-600 text-gray-200 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
              >
                {post ? "Update Post" : "Create Post"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
