import { memo } from "react";
import { Post } from "@/lib/types";

interface PostCardProps {
  post: Post;
  onEdit: (post: Post) => void;
  onDelete: (id: number) => void;
}

const PostCard = memo(function PostCard({ post, onEdit, onDelete }: PostCardProps) {
  return (
    <article
      className="rounded-lg shadow-md p-4 sm:p-6 border hover:opacity-95 transition-all bg-card-bg border-border"
    >
      <div className="flex flex-col gap-3 mb-3 sm:mb-4">
        <div className="flex-1">
          <h3 className="text-lg sm:text-xl font-bold capitalize leading-tight text-primary-text">
            {post.title}
          </h3>
          {post.editedAt ? (
            <p className="text-xs mt-1 text-secondary-text">
              Edited: {new Date(post.editedAt).toLocaleString()}
            </p>
          ) : post.createdAt ? (
            <p className="text-xs mt-1 text-secondary-text">
              Created: {new Date(post.createdAt).toLocaleString()}
            </p>
          ) : null}
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => onEdit(post)}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-background"
            aria-label={`Edit post ${post.id}`}
          >
            <span className="flex items-center justify-center gap-1.5">
              <svg
                className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit
            </span>
          </button>
          <button
            onClick={() => onDelete(post.id)}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={`Delete post ${post.id}`}
          >
            <span className="flex items-center justify-center gap-1.5">
              <svg
                className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Delete
            </span>
          </button>
        </div>
      </div>
      <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap wrap-break-word text-primary-text">
        {post.body}
      </p>
    </article>
  );
});

export default PostCard;
