"use client";

import { useState } from "react";
import { Provider } from "react-redux";
import { makeStore } from "./store";
import { setPosts } from "./postsSlice";
import { Post } from "../types";

export default function StoreProvider({
  children,
  initialPosts,
}: {
  children: React.ReactNode;
  initialPosts: Post[];
}) {
  const [store] = useState(() => {
    const store = makeStore();
    store.dispatch(setPosts(initialPosts));
    return store;
  });

  return <Provider store={store}>{children}</Provider>;
}
