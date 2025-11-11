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
import { useToast } from "@/lib/toast/ToastContext";

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
      <span className="text-secondary-text" aria-hidden="true">
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
  const { addToast } = useToast();

  const posts = useAppSelector((state) => state.posts.posts);
  const sortBy = useAppSelector((state) => state.posts.sortBy);
  const sortOrder = useAppSelector((state) => state.posts.sortOrder);
  const search = useAppSelector((state) => state.posts.search);

  const [searchInput, setSearchInput] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [displayCount, setDisplayCount] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

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
        addToast("Failed to load posts. Please try again.", "error");
      } finally {
        setIsLoading(false);
      }
    };
    loadAllPosts();
  }, [dispatch, initialLoadDone, addToast]);

  const filteredSortedPosts = useMemo(() => {
    let filtered = [...posts];

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(searchLower) ||
          post.body.toLowerCase().includes(searchLower)
      );
    }

    filtered.sort((a, b) => {
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

  const displayedPosts = useMemo(() => {
    return filteredSortedPosts.slice(0, displayCount);
  }, [filteredSortedPosts, displayCount]);

  const hasMore = displayCount < filteredSortedPosts.length;

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

  const handlePostCreated = useCallback(
    (newPost: Post) => {
      const postWithTimestamp = {
        ...newPost,
        createdAt: new Date().toISOString(),
      };
      dispatch(addPost(postWithTimestamp));
      addToast("Post created successfully!", "success");
    },
    [dispatch, addToast]
  );

  const handlePostUpdated = useCallback(
    (updatedPost: Post) => {
      const postWithEditTimestamp = {
        ...updatedPost,
        editedAt: new Date().toISOString(),
      };
      dispatch(updatePost(postWithEditTimestamp));
      addToast("Post updated successfully!", "success");
    },
    [dispatch, addToast]
  );

  const handlePostDeleted = useCallback(
    (deletedId: number) => {
      dispatch(deletePost(deletedId));
      addToast("Post deleted successfully!", "success");
    },
    [dispatch, addToast]
  );

  const handleSort = useCallback(
    (column: "id" | "title" | "createdAt") => {
      if (sortBy === column) {
        dispatch(setSortOrder(sortOrder === "asc" ? "desc" : "asc"));
      } else {
        dispatch(setSortBy(column));
        dispatch(setSortOrder("asc"));
      }
      setDisplayCount(10);
    },
    [sortBy, sortOrder, dispatch]
  );

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      dispatch(setSearch(searchInput));
      setDisplayCount(10);
    },
    [searchInput, dispatch]
  );

  const handleDelete = useCallback(
    (id: number) => {
      if (window.confirm("Are you sure you want to delete this post?")) {
        handlePostDeleted(id);
      }
    },
    [handlePostDeleted]
  );

  const handleEdit = useCallback((post: Post) => {
    setEditingPost(post);
    setIsModalOpen(true);
  }, []);

  const handleAddNew = useCallback(() => {
    setEditingPost(null);
    setIsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setEditingPost(null);
  }, []);

  if (!initialLoadDone && isLoading) {
    return (
      <div className="w-full space-y-4">
        <div className="flex justify-center items-center py-12">
          <div className="text-secondary-text">Loading posts...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3 sm:space-y-4">
      {/* Header with Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <p className="text-sm sm:text-base text-secondary-text">
          Showing {displayedPosts.length} of {filteredSortedPosts.length} posts
        </p>
        <button
          onClick={handleAddNew}
          className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-background"
        >
          + Add New Post
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-3 sm:p-4 rounded-lg border bg-card-bg border-border">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search posts..."
            className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 bg-input-bg text-primary-text border-border"
            aria-label="Search posts"
          />
          <button
            type="submit"
            className="px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-background bg-button-bg text-primary-text"
            aria-label="Submit search"
          >
            Search
          </button>
        </form>
      </div>

      {/* Sort Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 px-3 sm:px-4 py-3 rounded-lg border bg-card-bg border-border">
        <span className="text-xs sm:text-sm font-medium text-secondary-text">Sort by:</span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleSort("title")}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-1 text-xs sm:text-sm font-medium hover:opacity-90 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-button-bg text-primary-text"
          >
            Title{" "}
            <SortIcon column="title" sortBy={sortBy} sortOrder={sortOrder} />
          </button>
          <button
            onClick={() => handleSort("createdAt")}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-1 text-xs sm:text-sm font-medium hover:opacity-90 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-button-bg text-primary-text"
          >
            Date Created{" "}
            <SortIcon column="createdAt" sortBy={sortBy} sortOrder={sortOrder} />
          </button>
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-3 sm:space-y-4">
        {displayedPosts.length === 0 ? (
          <div className="rounded-lg shadow-md p-6 sm:p-8 border text-center bg-card-bg border-border text-secondary-text">
            No posts found
          </div>
        ) : (
          displayedPosts.map((post: Post) => (
            <article
              key={post.id}
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
                    onClick={() => handleEdit(post)}
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
                    onClick={() => handleDelete(post.id)}
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
          ))
        )}

        {/* Infinite scroll trigger */}
        {hasMore && (
          <div ref={observerTarget} className="py-6 sm:py-8 text-center">
            <div className="text-sm sm:text-base text-secondary-text">Loading more posts...</div>
          </div>
        )}

        {!hasMore && displayedPosts.length > 0 && (
          <div className="py-6 sm:py-8 text-center text-sm sm:text-base text-secondary-text">All posts loaded</div>
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
