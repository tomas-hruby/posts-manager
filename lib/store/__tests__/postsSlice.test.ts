import postsReducer, {
  setPosts,
  addPost,
  updatePost,
  deletePost,
  setPage,
  setSortBy,
  setSortOrder,
  setSearch,
} from '../postsSlice';
import { Post } from '@/lib/types';

describe('postsSlice', () => {
  const initialState = {
    posts: [],
    page: 1,
    limit: 10,
    sortBy: 'id' as const,
    sortOrder: 'asc' as const,
    search: '',
  };

  const mockPosts: Post[] = [
    { id: 1, userId: 1, title: 'Post 1', body: 'Body 1' },
    { id: 2, userId: 1, title: 'Post 2', body: 'Body 2' },
    { id: 3, userId: 1, title: 'Post 3', body: 'Body 3' },
  ];

  describe('reducers', () => {
    it('should return the initial state', () => {
      expect(postsReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle setPosts', () => {
      const actual = postsReducer(initialState, setPosts(mockPosts));
      expect(actual.posts).toEqual(mockPosts);
      expect(actual.posts.length).toBe(3);
    });

    it('should handle addPost', () => {
      const stateWithPosts = { ...initialState, posts: mockPosts };
      const newPost: Post = {
        id: 999, // This will be replaced
        userId: 1,
        title: 'New Post',
        body: 'New Body',
      };

      const actual = postsReducer(stateWithPosts, addPost(newPost));
      
      // Should be added to the beginning
      expect(actual.posts.length).toBe(4);
      expect(actual.posts[0].title).toBe('New Post');
      
      // ID should be maxId + 1
      expect(actual.posts[0].id).toBe(4); // max was 3, so new is 4
      
      // Should reset page to 1
      expect(actual.page).toBe(1);
    });

    it('should handle addPost with empty posts array', () => {
      const newPost: Post = {
        id: 0,
        userId: 1,
        title: 'First Post',
        body: 'First Body',
      };

      const actual = postsReducer(initialState, addPost(newPost));
      
      expect(actual.posts.length).toBe(1);
      expect(actual.posts[0].id).toBe(1); // Should start at 1
      expect(actual.posts[0].title).toBe('First Post');
    });

    it('should handle updatePost', () => {
      const stateWithPosts = { ...initialState, posts: mockPosts };
      const updatedPost: Post = {
        id: 2,
        userId: 1,
        title: 'Updated Post 2',
        body: 'Updated Body 2',
      };

      const actual = postsReducer(stateWithPosts, updatePost(updatedPost));
      
      expect(actual.posts.length).toBe(3);
      expect(actual.posts[1]).toEqual(updatedPost);
      expect(actual.posts[1].title).toBe('Updated Post 2');
    });

    it('should not change state when updating non-existent post', () => {
      const stateWithPosts = { ...initialState, posts: mockPosts };
      const updatedPost: Post = {
        id: 999,
        userId: 1,
        title: 'Non-existent',
        body: 'Non-existent',
      };

      const actual = postsReducer(stateWithPosts, updatePost(updatedPost));
      
      expect(actual.posts).toEqual(mockPosts);
    });

    it('should handle deletePost', () => {
      const stateWithPosts = { ...initialState, posts: mockPosts };
      
      const actual = postsReducer(stateWithPosts, deletePost(2));
      
      expect(actual.posts.length).toBe(2);
      expect(actual.posts.find(p => p.id === 2)).toBeUndefined();
      expect(actual.page).toBe(1);
    });

    it('should handle deletePost with non-existent id', () => {
      const stateWithPosts = { ...initialState, posts: mockPosts };
      
      const actual = postsReducer(stateWithPosts, deletePost(999));
      
      expect(actual.posts.length).toBe(3);
      expect(actual.posts).toEqual(mockPosts);
    });

    it('should handle setPage', () => {
      const actual = postsReducer(initialState, setPage(3));
      expect(actual.page).toBe(3);
    });

    it('should handle setSortBy', () => {
      const actual = postsReducer(initialState, setSortBy('title'));
      expect(actual.sortBy).toBe('title');
      expect(actual.page).toBe(1); // Should reset page
    });

    it('should handle setSortBy with createdAt', () => {
      const actual = postsReducer(initialState, setSortBy('createdAt'));
      expect(actual.sortBy).toBe('createdAt');
      expect(actual.page).toBe(1);
    });

    it('should handle setSortOrder', () => {
      const actual = postsReducer(initialState, setSortOrder('desc'));
      expect(actual.sortOrder).toBe('desc');
      expect(actual.page).toBe(1); // Should reset page
    });

    it('should handle setSearch', () => {
      const actual = postsReducer(initialState, setSearch('test query'));
      expect(actual.search).toBe('test query');
      expect(actual.page).toBe(1); // Should reset page
    });

    it('should handle setSearch with empty string', () => {
      const stateWithSearch = { ...initialState, search: 'previous search' };
      const actual = postsReducer(stateWithSearch, setSearch(''));
      expect(actual.search).toBe('');
    });
  });

  describe('complex scenarios', () => {
    it('should handle multiple actions in sequence', () => {
      let state = postsReducer(initialState, setPosts(mockPosts));
      expect(state.posts.length).toBe(3);

      state = postsReducer(state, setSortBy('title'));
      expect(state.sortBy).toBe('title');

      state = postsReducer(state, setSortOrder('desc'));
      expect(state.sortOrder).toBe('desc');

      const newPost: Post = {
        id: 0,
        userId: 1,
        title: 'Sequential Post',
        body: 'Sequential Body',
      };
      state = postsReducer(state, addPost(newPost));
      expect(state.posts.length).toBe(4);
      expect(state.page).toBe(1);
    });

    it('should maintain state immutability', () => {
      const stateWithPosts = { ...initialState, posts: mockPosts };
      const originalPosts = [...mockPosts];
      
      postsReducer(stateWithPosts, deletePost(2));
      
      // Original state should not be mutated
      expect(mockPosts).toEqual(originalPosts);
    });
  });
});
