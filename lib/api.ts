import { Post, PaginationParams, PaginatedResponse } from "./types";

const API_BASE_URL = "https://jsonplaceholder.typicode.com";

// Client-side fetch for infinite scroll
export async function fetchPostsClient(
  params: PaginationParams
): Promise<PaginatedResponse<Post>> {
  const { page, limit, sortBy = "id", sortOrder = "asc", search } = params;

  const response = await fetch(`${API_BASE_URL}/posts`, {
    cache: "force-cache", // Cache on client side
  });
  if (!response.ok) {
    throw new Error("Failed to fetch posts");
  }

  let posts: Post[] = await response.json();

  // Apply search filter
  if (search) {
    const searchLower = search.toLowerCase();
    posts = posts.filter(
      (post) =>
        post.title.toLowerCase().includes(searchLower) ||
        post.body.toLowerCase().includes(searchLower)
    );
  }

  // Apply sorting
  posts.sort((a, b) => {
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
  const total = posts.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedPosts = posts.slice(start, end);

  return {
    data: paginatedPosts,
    total,
    page,
    limit,
    totalPages,
  };
}

// Fetch a single post
export async function fetchPost(id: number): Promise<Post> {
  const response = await fetch(`${API_BASE_URL}/posts/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch post");
  }
  return response.json();
}

// Create a new post
export async function createPost(post: Omit<Post, "id">): Promise<Post> {
  const response = await fetch(`${API_BASE_URL}/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(post),
  });

  if (!response.ok) {
    throw new Error("Failed to create post");
  }

  return response.json();
}

// Update a post
export async function updatePost(
  id: number,
  post: Partial<Post>
): Promise<Post> {
  const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(post),
  });

  if (!response.ok) {
    throw new Error("Failed to update post");
  }

  return response.json();
}

// Delete a post
export async function deletePost(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete post");
  }
}
