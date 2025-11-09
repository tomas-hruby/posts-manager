"use client";

import { useState, useMemo, useCallback } from "react";
import { Post } from "@/lib/types";
import PostModal from "./PostModal";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  addPost,
  updatePost,
  deletePost,
  setPage,
  setSortBy,
  setSortOrder,
  setSearch,
} from "@/lib/store/postsSlice";

// SortIcon component defined outside of render
function SortIcon({
  column,
  sortBy,
  sortOrder,
}: {
  column: "id" | "title" | "createdAt";
  sortBy: "id" | "title" | "createdAt";
  sortOrder: "asc" | "desc";
}) {
  if (sortBy !== column) {
    return (
      <span className="text-gray-400" aria-hidden="true">
        ⇅
      </span>
    );
  }
  return sortOrder === "asc" ? (
    <span aria-label="sorted ascending">↑</span>
  ) : (
    <span aria-label="sorted descending">↓</span>
  );
}

export default function PostsTable() {
  const dispatch = useAppDispatch();

  // Get state from Redux
  const posts = useAppSelector((state) => state.posts.posts);
  const page = useAppSelector((state) => state.posts.page);
  const limit = useAppSelector((state) => state.posts.limit);
  const sortBy = useAppSelector((state) => state.posts.sortBy);
  const sortOrder = useAppSelector((state) => state.posts.sortOrder);
  const search = useAppSelector((state) => state.posts.search);

  // Local state for search input
  const [searchInput, setSearchInput] = useState("");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  // Callbacks for post mutations
  const handlePostCreated = useCallback(
    (newPost: Post) => {
      const postWithTimestamp = {
        ...newPost,
        createdAt: new Date().toISOString(),
      };
      dispatch(addPost(postWithTimestamp));
    },
    [dispatch]
  );

  const handlePostUpdated = useCallback(
    (updatedPost: Post) => {
      const postWithEditTimestamp = {
        ...updatedPost,
        editedAt: new Date().toISOString(),
      };
      dispatch(updatePost(postWithEditTimestamp));
    },
    [dispatch]
  );

  const handlePostDeleted = useCallback(
    (deletedId: number) => {
      dispatch(deletePost(deletedId));
    },
    [dispatch]
  );

  // Client-side filtering, sorting, and pagination
  const { paginatedPosts, total, totalPages } = useMemo(() => {
    let filtered = [...posts];

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(searchLower) ||
          post.body.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      // Special handling for createdAt - use editedAt if available, otherwise createdAt
      if (sortBy === "createdAt") {
        const aDate = a.editedAt
          ? new Date(a.editedAt).getTime()
          : a.createdAt
          ? new Date(a.createdAt).getTime()
          : 0;
        const bDate = b.editedAt
          ? new Date(b.editedAt).getTime()
          : b.createdAt
          ? new Date(b.createdAt).getTime()
          : 0;

        return sortOrder === "asc" ? aDate - bDate : bDate - aDate;
      }

      const aVal = a[sortBy];
      const bVal = b[sortBy];

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortOrder === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortOrder === "asc"
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });

    // Calculate pagination
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedPosts = filtered.slice(start, end);

    return { paginatedPosts, total, totalPages };
  }, [posts, search, sortBy, sortOrder, page, limit]);

  // Handle sorting
  const handleSort = useCallback(
    (column: "id" | "title" | "createdAt") => {
      if (sortBy === column) {
        dispatch(setSortOrder(sortOrder === "asc" ? "desc" : "asc"));
      } else {
        dispatch(setSortBy(column));
        dispatch(setSortOrder("asc"));
      }
    },
    [sortBy, sortOrder, dispatch]
  );

  // Handle search
  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      dispatch(setSearch(searchInput));
    },
    [searchInput, dispatch]
  );

  // Handle delete
  const handleDelete = useCallback(
    (id: number) => {
      if (window.confirm("Are you sure you want to delete this post?")) {
        handlePostDeleted(id);
      }
    },
    [handlePostDeleted]
  );

  // Handle edit
  const handleEdit = useCallback((post: Post) => {
    setEditingPost(post);
    setIsModalOpen(true);
  }, []);

  // Handle add new
  const handleAddNew = useCallback(() => {
    setEditingPost(null);
    setIsModalOpen(true);
  }, []);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setEditingPost(null);
  }, []);

  return (
    <div className="w-full space-y-4">
      {/* Header with Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-white">Posts</h2>
        <button
          onClick={handleAddNew}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors"
          aria-label="Add new post"
        >
          + Add New Post
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-700">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search posts..."
            className="flex-1 px-4 py-2 bg-gray-900 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Search posts"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            aria-label="Submit search"
          >
            Search
          </button>
        </form>
      </div>

      {/* Sort Controls */}
      <div className="flex items-center gap-4 bg-gray-800 px-4 py-3 rounded-lg border border-gray-700">
        <span className="text-sm text-gray-300">Sort by:</span>
        <button
          onClick={() => handleSort("title")}
          className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-gray-200 hover:text-white bg-gray-700 hover:bg-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={`Sort by Title ${
            sortBy === "title"
              ? sortOrder === "asc"
                ? "descending"
                : "ascending"
              : ""
          }`}
        >
          Title{" "}
          <SortIcon column="title" sortBy={sortBy} sortOrder={sortOrder} />
        </button>
        <button
          onClick={() => handleSort("createdAt")}
          className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-gray-200 hover:text-white bg-gray-700 hover:bg-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={`Sort by Date ${
            sortBy === "createdAt"
              ? sortOrder === "asc"
                ? "descending"
                : "ascending"
              : ""
          }`}
        >
          Date Created{" "}
          <SortIcon column="createdAt" sortBy={sortBy} sortOrder={sortOrder} />
        </button>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {paginatedPosts.length === 0 ? (
          <div className="bg-gray-800 rounded-lg shadow-md p-8 border border-gray-700 text-center text-gray-400">
            No posts found
          </div>
        ) : (
          paginatedPosts.map((post: Post) => (
            <article
              key={post.id}
              className="bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <div className="flex justify-between items-start gap-4 mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white capitalize leading-tight">
                    {post.title}
                  </h3>
                  {post.editedAt ? (
                    <p className="text-xs text-gray-400 mt-1">
                      Edited: {new Date(post.editedAt).toLocaleString()}
                    </p>
                  ) : post.createdAt ? (
                    <p className="text-xs text-gray-400 mt-1">
                      Created: {new Date(post.createdAt).toLocaleString()}
                    </p>
                  ) : null}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleEdit(post)}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                    aria-label={`Edit post ${post.id}`}
                  >
                    <span className="flex items-center gap-1.5">
                      <svg
                        className="w-4 h-4"
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
                    onClick={() => handleDelete(post.id)}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={`Delete post ${post.id}`}
                  >
                    <span className="flex items-center gap-1.5">
                      <svg
                        className="w-4 h-4"
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
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {post.body}
              </p>
            </article>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-gray-800 px-6 py-4 rounded-lg border border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-300">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)}{" "}
            of {total} results
          </p>
          <nav className="flex gap-2" aria-label="Pagination">
            <button
              onClick={() => dispatch(setPage(Math.max(1, page - 1)))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-600 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Previous page"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-gray-300 flex items-center">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => dispatch(setPage(Math.min(totalPages, page + 1)))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-600 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Next page"
            >
              Next
            </button>
          </nav>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <PostModal
          post={editingPost}
          onClose={handleModalClose}
          onPostCreated={handlePostCreated}
          onPostUpdated={handlePostUpdated}
        />
      )}
    </div>
  );
}
