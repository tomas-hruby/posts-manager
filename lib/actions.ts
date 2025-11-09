"use server";

import { revalidatePath } from "next/cache";

const API_BASE_URL = "https://jsonplaceholder.typicode.com";

export async function createPostAction(formData: FormData) {
  const title = formData.get("title") as string;
  const body = formData.get("body") as string;

  const response = await fetch(`${API_BASE_URL}/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title,
      body,
      userId: 1,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create post");
  }

  revalidatePath("/");
  return await response.json();
}

export async function updatePostAction(id: number, formData: FormData) {
  const title = formData.get("title") as string;
  const body = formData.get("body") as string;

  const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title,
      body,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to update post");
  }

  revalidatePath("/");
  return await response.json();
}

export async function deletePostAction(id: number) {
  const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete post");
  }

  revalidatePath("/");
}
