"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Post } from "@/lib/types";
import PostModal from "./PostModal";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  addPost,
  updatePost,
  deletePost,
  setSortBy,
  setSortOrder,
  setSearch,
  setPosts,
} from "@/lib/store/postsSlice";
import { fetchPostsClient } from "@/lib/api";

// SortIcon component
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
  const sortBy = useAppSelector((state) => state.posts.sortBy);
  const sortOrder = useAppSelector((state) => state.posts.sortOrder);
  const search = useAppSelector((state) => state.posts.search);

  // Local state
  const [searchInput, setSearchInput] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [displayCount, setDisplayCount] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Load all posts once on mount
  useEffect(() => {
    const loadAllPosts = async () => {
      if (initialLoadDone) return;
      setIsLoading(true);
      try {
        const response = await fetchPostsClient({
          page: 1,
          limit: 1000,
          sortBy: "id",
          sortOrder: "asc",
          search: "",
        });
        dispatch(setPosts(response.data));
        setInitialLoadDone(true);
      } catch (error) {
        console.error("Failed to load posts:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadAllPosts();
  }, [dispatch, initialLoadDone]);

  // Filter and sort posts
  const filteredSortedPosts = useMemo(() => {
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
      // Special handling for createdAt
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

    return filtered;
  }, [posts, search, sortBy, sortOrder]);

  // Get displayed posts based on displayCount
  const displayedPosts = useMemo(() => {
    return filteredSortedPosts.slice(0, displayCount);
  }, [filteredSortedPosts, displayCount]);

  const hasMore = displayCount < filteredSortedPosts.length;

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          setDisplayCount((prev) => prev + 10);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoading]);

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

  // Handle sorting
  const handleSort = useCallback(
    (column: "id" | "title" | "createdAt") => {
      if (sortBy === column) {
        dispatch(setSortOrder(sortOrder === "asc" ? "desc" : "asc"));
      } else {
        dispatch(setSortBy(column));
        dispatch(setSortOrder("asc"));
      }
      setDisplayCount(10); // Reset display count on sort
    },
    [sortBy, sortOrder, dispatch]
  );

  // Handle search
  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      dispatch(setSearch(searchInput));
      setDisplayCount(10); // Reset display count on search
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

  if (!initialLoadDone && isLoading) {
    return (
      <div className="w-full space-y-4">
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-300">Loading posts...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Header with Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <p className="text-gray-300">
          Showing {displayedPosts.length} of {filteredSortedPosts.length} posts
        </p>
        <button
          onClick={handleAddNew}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800"
        >
          + Add New Post
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search posts..."
            className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        >
          Title{" "}
          <SortIcon column="title" sortBy={sortBy} sortOrder={sortOrder} />
        </button>
        <button
          onClick={() => handleSort("createdAt")}
          className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-gray-200 hover:text-white bg-gray-700 hover:bg-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Date Created{" "}
          <SortIcon column="createdAt" sortBy={sortBy} sortOrder={sortOrder} />
        </button>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {displayedPosts.length === 0 ? (
          <div className="bg-gray-800 rounded-lg shadow-md p-8 border border-gray-700 text-center text-gray-400">
            No posts found
          </div>
        ) : (
          displayedPosts.map((post: Post) => (
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

        {/* Infinite scroll trigger */}
        {hasMore && (
          <div ref={observerTarget} className="py-8 text-center">
            <div className="text-gray-400">Loading more posts...</div>
          </div>
        )}

        {!hasMore && displayedPosts.length > 0 && (
          <div className="py-8 text-center text-gray-400">All posts loaded</div>
        )}
      </div>

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
