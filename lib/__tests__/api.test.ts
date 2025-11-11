import {
  fetchPostsClient,
  fetchPost,
  createPost,
  updatePost,
  deletePost,
} from '../api';
import { Post } from '../types';

// Mock fetch globally
global.fetch = jest.fn();

describe('API Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const mockPosts: Post[] = [
    { id: 1, userId: 1, title: 'Post 1', body: 'Body 1' },
    { id: 2, userId: 1, title: 'Post 2', body: 'Body 2' },
    { id: 3, userId: 1, title: 'Post 3', body: 'Body 3' },
  ];

  describe('fetchPostsClient', () => {
    it('should fetch posts with pagination', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPosts,
      });

      const result = await fetchPostsClient({
        page: 1,
        limit: 2,
        sortBy: 'id',
        sortOrder: 'asc',
        search: '',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://jsonplaceholder.typicode.com/posts',
        { cache: 'force-cache' }
      );

      expect(result.data.length).toBe(2); // Limited to 2
      expect(result.total).toBe(3);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(2);
      expect(result.totalPages).toBe(2);
    });

    it('should filter posts by search query', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPosts,
      });

      const result = await fetchPostsClient({
        page: 1,
        limit: 10,
        sortBy: 'id',
        sortOrder: 'asc',
        search: 'Post 2',
      });

      expect(result.data.length).toBe(1);
      expect(result.data[0].title).toBe('Post 2');
    });

    it('should sort posts by title ascending', async () => {
      const unsortedPosts: Post[] = [
        { id: 1, userId: 1, title: 'Zebra', body: 'Body Z' },
        { id: 2, userId: 1, title: 'Apple', body: 'Body A' },
        { id: 3, userId: 1, title: 'Mango', body: 'Body M' },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => unsortedPosts,
      });

      const result = await fetchPostsClient({
        page: 1,
        limit: 10,
        sortBy: 'title',
        sortOrder: 'asc',
        search: '',
      });

      expect(result.data[0].title).toBe('Apple');
      expect(result.data[1].title).toBe('Mango');
      expect(result.data[2].title).toBe('Zebra');
    });

    it('should sort posts by title descending', async () => {
      const unsortedPosts: Post[] = [
        { id: 1, userId: 1, title: 'Zebra', body: 'Body Z' },
        { id: 2, userId: 1, title: 'Apple', body: 'Body A' },
        { id: 3, userId: 1, title: 'Mango', body: 'Body M' },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => unsortedPosts,
      });

      const result = await fetchPostsClient({
        page: 1,
        limit: 10,
        sortBy: 'title',
        sortOrder: 'desc',
        search: '',
      });

      expect(result.data[0].title).toBe('Zebra');
      expect(result.data[1].title).toBe('Mango');
      expect(result.data[2].title).toBe('Apple');
    });

    it('should sort posts by id', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [mockPosts[2], mockPosts[0], mockPosts[1]],
      });

      const result = await fetchPostsClient({
        page: 1,
        limit: 10,
        sortBy: 'id',
        sortOrder: 'asc',
        search: '',
      });

      expect(result.data[0].id).toBe(1);
      expect(result.data[1].id).toBe(2);
      expect(result.data[2].id).toBe(3);
    });

    it('should handle pagination correctly', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPosts,
      });

      const result = await fetchPostsClient({
        page: 2,
        limit: 2,
        sortBy: 'id',
        sortOrder: 'asc',
        search: '',
      });

      expect(result.data.length).toBe(1); // Only post 3 on page 2
      expect(result.data[0].id).toBe(3);
      expect(result.page).toBe(2);
    });

    it('should throw error when fetch fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      await expect(
        fetchPostsClient({
          page: 1,
          limit: 10,
          sortBy: 'id',
          sortOrder: 'asc',
          search: '',
        })
      ).rejects.toThrow('Failed to fetch posts');
    });
  });

  describe('fetchPost', () => {
    it('should fetch a single post', async () => {
      const mockPost = mockPosts[0];
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPost,
      });

      const result = await fetchPost(1);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://jsonplaceholder.typicode.com/posts/1'
      );
      expect(result).toEqual(mockPost);
    });

    it('should throw error when fetch fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      await expect(fetchPost(1)).rejects.toThrow('Failed to fetch post');
    });
  });

  describe('createPost', () => {
    it('should create a new post', async () => {
      const newPost = {
        userId: 1,
        title: 'New Post',
        body: 'New Body',
      };

      const createdPost = { id: 101, ...newPost };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => createdPost,
      });

      const result = await createPost(newPost);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://jsonplaceholder.typicode.com/posts',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newPost),
        }
      );
      expect(result).toEqual(createdPost);
    });

    it('should throw error when creation fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      await expect(
        createPost({ userId: 1, title: 'Test', body: 'Test' })
      ).rejects.toThrow('Failed to create post');
    });
  });

  describe('updatePost', () => {
    it('should update an existing post', async () => {
      const updates = {
        title: 'Updated Title',
        body: 'Updated Body',
      };

      const updatedPost = { id: 1, userId: 1, ...updates };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => updatedPost,
      });

      const result = await updatePost(1, updates);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://jsonplaceholder.typicode.com/posts/1',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        }
      );
      expect(result).toEqual(updatedPost);
    });

    it('should throw error when update fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      await expect(updatePost(1, { title: 'Test' })).rejects.toThrow(
        'Failed to update post'
      );
    });
  });

  describe('deletePost', () => {
    it('should delete a post', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      });

      await deletePost(1);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://jsonplaceholder.typicode.com/posts/1',
        {
          method: 'DELETE',
        }
      );
    });

    it('should throw error when deletion fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      await expect(deletePost(1)).rejects.toThrow('Failed to delete post');
    });
  });
});
