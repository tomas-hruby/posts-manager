export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
  createdAt?: string;
  editedAt?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: "id" | "title" | "createdAt";
  sortOrder?: "asc" | "desc";
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
