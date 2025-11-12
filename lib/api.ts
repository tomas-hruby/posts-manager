import { Post, PaginationParams, PaginatedResponse } from "./types";
import { API_BASE_URL } from "./constants";

export async function fetchPostsClient(
  params: PaginationParams
): Promise<PaginatedResponse<Post>> {
  const { page, limit, sortBy = "id", sortOrder = "asc", search } = params;

  const response = await fetch(`${API_BASE_URL}/posts`, {
    cache: "force-cache",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch posts");
  }

  let posts: Post[] = await response.json();

  if (search) {
    const searchLower = search.toLowerCase();
    posts = posts.filter(
      (post) =>
        post.title.toLowerCase().includes(searchLower) ||
        post.body.toLowerCase().includes(searchLower)
    );
  }

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
