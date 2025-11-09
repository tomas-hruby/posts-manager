import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Post } from "../types";

interface PostsState {
  posts: Post[];
  page: number;
  limit: number;
  sortBy: "id" | "title" | "createdAt";
  sortOrder: "asc" | "desc";
  search: string;
}

const initialState: PostsState = {
  posts: [],
  page: 1,
  limit: 10,
  sortBy: "id",
  sortOrder: "asc",
  search: "",
};

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    setPosts: (state, action: PayloadAction<Post[]>) => {
      state.posts = action.payload;
    },
    addPost: (state, action: PayloadAction<Post>) => {
      // Find the highest ID and add 1 to ensure new post appears first when sorted by ID
      const maxId = state.posts.reduce(
        (max, post) => Math.max(max, post.id),
        0
      );
      const newPost = {
        ...action.payload,
        id: maxId + 1,
      };
      state.posts.unshift(newPost);
      state.page = 1; // Reset to first page
    },
    updatePost: (state, action: PayloadAction<Post>) => {
      const index = state.posts.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.posts[index] = action.payload;
      }
    },
    deletePost: (state, action: PayloadAction<number>) => {
      state.posts = state.posts.filter((p) => p.id !== action.payload);
      state.page = 1; // Reset to first page
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setSortBy: (state, action: PayloadAction<"id" | "title" | "createdAt">) => {
      state.sortBy = action.payload;
      state.page = 1;
    },
    setSortOrder: (state, action: PayloadAction<"asc" | "desc">) => {
      state.sortOrder = action.payload;
      state.page = 1;
    },
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
      state.page = 1;
    },
  },
});

export const {
  setPosts,
  addPost,
  updatePost,
  deletePost,
  setPage,
  setSortBy,
  setSortOrder,
  setSearch,
} = postsSlice.actions;

export default postsSlice.reducer;
