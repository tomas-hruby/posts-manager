import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import PostsTable from '../PostsTable';
import postsReducer from '@/lib/store/postsSlice';
import { Post } from '@/lib/types';
import * as api from '@/lib/api';

// Mock API
jest.mock('@/lib/api');
const mockedApi = api as jest.Mocked<typeof api>;

// Mock ToastContext
const mockAddToast = jest.fn();
jest.mock('@/lib/toast/ToastContext', () => ({
  useToast: () => ({
    addToast: mockAddToast,
  }),
}));

// Helper to create test store
const createTestStore = (initialPosts: Post[] = []) => {
  return configureStore({
    reducer: {
      posts: postsReducer,
    },
    preloadedState: {
      posts: {
        posts: initialPosts,
        page: 1,
        limit: 10,
        sortBy: 'id' as const,
        sortOrder: 'asc' as const,
        search: '',
      },
    },
  });
};

// Helper to render with Redux
const renderWithStore = (component: React.ReactElement, initialPosts: Post[] = []) => {
  const store = createTestStore(initialPosts);
  return {
    ...render(<Provider store={store}>{component}</Provider>),
    store,
  };
};

describe('PostsTable Component', () => {
  const mockPosts: Post[] = [
    {
      id: 1,
      userId: 1,
      title: 'First Post',
      body: 'First Body',
      createdAt: '2024-01-01T10:00:00Z',
    },
    {
      id: 2,
      userId: 1,
      title: 'Second Post',
      body: 'Second Body',
      createdAt: '2024-01-02T10:00:00Z',
    },
    {
      id: 3,
      userId: 1,
      title: 'Third Post',
      body: 'Third Body',
      createdAt: '2024-01-03T10:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockedApi.fetchPostsClient.mockResolvedValue({
      data: mockPosts,
      total: 3,
      page: 1,
      limit: 1000,
      totalPages: 1,
    });
  });

  describe('Loading and Initial Render', () => {
    it('should show loading state initially', () => {
      mockedApi.fetchPostsClient.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      renderWithStore(<PostsTable />);

      expect(screen.getByText('Loading posts...')).toBeInTheDocument();
    });

    it('should load and display posts on mount', async () => {
      renderWithStore(<PostsTable />);

      await waitFor(() => {
        expect(screen.getByText('First Post')).toBeInTheDocument();
      });

      expect(screen.getByText('First Body')).toBeInTheDocument();
      expect(screen.getByText('Second Post')).toBeInTheDocument();
      expect(screen.getByText('Third Post')).toBeInTheDocument();
    });

    it('should show error toast when loading fails', async () => {
      mockedApi.fetchPostsClient.mockRejectedValueOnce(new Error('Network error'));

      renderWithStore(<PostsTable />);

      await waitFor(() => {
        expect(mockAddToast).toHaveBeenCalledWith(
          'Failed to load posts. Please try again.',
          'error'
        );
      });
    });

    it('should display correct post count', async () => {
      renderWithStore(<PostsTable />);

      await waitFor(() => {
        expect(screen.getByText(/Showing 3 of 3 posts/i)).toBeInTheDocument();
      });
    });
  });

  describe('Add New Post Button', () => {
    it('should render Add New Post button', async () => {
      renderWithStore(<PostsTable />);

      await waitFor(() => {
        expect(screen.getByText('First Post')).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /add new post/i })).toBeInTheDocument();
    });

    it('should open modal when Add New Post is clicked', async () => {
      const user = userEvent.setup();
      renderWithStore(<PostsTable />);

      await waitFor(() => {
        expect(screen.getByText('First Post')).toBeInTheDocument();
      });

      const addButton = screen.getByRole('button', { name: /add new post/i });
      await user.click(addButton);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Create New Post')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should render search input', async () => {
      renderWithStore(<PostsTable />);

      await waitFor(() => {
        expect(screen.getByText('First Post')).toBeInTheDocument();
      });

      expect(screen.getByPlaceholderText('Search posts...')).toBeInTheDocument();
    });

    it('should filter posts by search query', async () => {
      const user = userEvent.setup();
      renderWithStore(<PostsTable />);

      await waitFor(() => {
        expect(screen.getByText('First Post')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search posts...');
      await user.type(searchInput, 'Second');

      const searchButton = screen.getByRole('button', { name: /submit search/i });
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText('Second Post')).toBeInTheDocument();
        expect(screen.queryByText('First Post')).not.toBeInTheDocument();
        expect(screen.queryByText('Third Post')).not.toBeInTheDocument();
      });
    });

    it('should search in both title and body', async () => {
      const user = userEvent.setup();
      renderWithStore(<PostsTable />);

      await waitFor(() => {
        expect(screen.getByText('First Post')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search posts...');
      await user.type(searchInput, 'Body');

      const searchButton = screen.getByRole('button', { name: /submit search/i });
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText('First Post')).toBeInTheDocument();
        expect(screen.getByText('Second Post')).toBeInTheDocument();
        expect(screen.getByText('Third Post')).toBeInTheDocument();
      });
    });

    it('should be case insensitive', async () => {
      const user = userEvent.setup();
      renderWithStore(<PostsTable />);

      await waitFor(() => {
        expect(screen.getByText('First Post')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search posts...');
      await user.type(searchInput, 'SECOND');

      const searchButton = screen.getByRole('button', { name: /submit search/i });
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText('Second Post')).toBeInTheDocument();
      });
    });
  });

  describe('Sorting Functionality', () => {
    it('should render sort buttons', async () => {
      renderWithStore(<PostsTable />);

      await waitFor(() => {
        expect(screen.getByText('First Post')).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: 'Title' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Date Created' })).toBeInTheDocument();
    });

    it('should sort by title ascending', async () => {
      const user = userEvent.setup();
      renderWithStore(<PostsTable />);

      await waitFor(() => {
        expect(screen.getByText('First Post')).toBeInTheDocument();
      });

      const sortButton = screen.getByRole('button', { name: 'Title' });
      await user.click(sortButton);

      const articles = screen.getAllByRole('article');
      expect(within(articles[0]).getByText('First Post')).toBeInTheDocument();
      expect(within(articles[1]).getByText('Second Post')).toBeInTheDocument();
      expect(within(articles[2]).getByText('Third Post')).toBeInTheDocument();
    });

    it('should toggle sort order when clicking same column', async () => {
      const user = userEvent.setup();
      renderWithStore(<PostsTable />);

      await waitFor(() => {
        expect(screen.getByText('First Post')).toBeInTheDocument();
      });

      const sortButton = screen.getByRole('button', { name: 'Title' });
      
      // Click once for ascending
      await user.click(sortButton);
      expect(screen.getByLabelText('sorted ascending')).toBeInTheDocument();

      // Click again for descending
      await user.click(sortButton);
      expect(screen.getByLabelText('sorted descending')).toBeInTheDocument();
    });

    it('should sort by date created', async () => {
      const user = userEvent.setup();
      renderWithStore(<PostsTable />);

      await waitFor(() => {
        expect(screen.getByText('First Post')).toBeInTheDocument();
      });

      const sortButton = screen.getByRole('button', { name: 'Date Created' });
      await user.click(sortButton);

      await waitFor(() => {
        expect(screen.getByLabelText('sorted ascending')).toBeInTheDocument();
      });
    });
  });

  describe('Post Actions', () => {
    it('should render edit and delete buttons for each post', async () => {
      renderWithStore(<PostsTable />);

      await waitFor(() => {
        expect(screen.getByText('First Post')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByRole('button', { name: /edit post/i });
      const deleteButtons = screen.getAllByRole('button', { name: /delete post/i });

      expect(editButtons).toHaveLength(3);
      expect(deleteButtons).toHaveLength(3);
    });

    it('should open edit modal when edit button is clicked', async () => {
      const user = userEvent.setup();
      renderWithStore(<PostsTable />);

      await waitFor(() => {
        expect(screen.getByText('First Post')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByRole('button', { name: /edit post/i });
      await user.click(editButtons[0]);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Edit Post')).toBeInTheDocument();
      expect(screen.getByDisplayValue('First Post')).toBeInTheDocument();
    });

    it('should show confirmation when delete is clicked', async () => {
      const user = userEvent.setup();
      renderWithStore(<PostsTable />);

      await waitFor(() => {
        expect(screen.getByText('First Post')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole('button', { name: /delete post/i });
      await user.click(deleteButtons[0]);

      expect(window.confirm).toHaveBeenCalledWith(
        'Are you sure you want to delete this post?'
      );
    });

    it('should delete post when confirmed', async () => {
      (window.confirm as jest.Mock).mockReturnValueOnce(true);
      const user = userEvent.setup();
      renderWithStore(<PostsTable />);

      await waitFor(() => {
        expect(screen.getByText('First Post')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole('button', { name: /delete post/i });
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(mockAddToast).toHaveBeenCalledWith(
          'Post deleted successfully!',
          'success'
        );
        expect(screen.queryByText('First Post')).not.toBeInTheDocument();
      });
    });

    it('should not delete post when cancelled', async () => {
      (window.confirm as jest.Mock).mockReturnValueOnce(false);
      const user = userEvent.setup();
      renderWithStore(<PostsTable />);

      await waitFor(() => {
        expect(screen.getByText('First Post')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole('button', { name: /delete post/i });
      await user.click(deleteButtons[0]);

      expect(screen.getByText('First Post')).toBeInTheDocument();
    });
  });

  describe('Post Creation', () => {
    it('should add new post and show success toast', async () => {
      const user = userEvent.setup();
      renderWithStore(<PostsTable />);

      await waitFor(() => {
        expect(screen.getByText('First Post')).toBeInTheDocument();
      });

      // Open modal
      const addButton = screen.getByRole('button', { name: /add new post/i });
      await user.click(addButton);

      // Fill form
      await user.type(screen.getByLabelText('Title'), 'New Test Post');
      await user.type(screen.getByLabelText('Body'), 'New Test Body');

      // Submit
      const createButton = screen.getByRole('button', { name: /create post/i });
      await user.click(createButton);

      await waitFor(() => {
        expect(mockAddToast).toHaveBeenCalledWith(
          'Post created successfully!',
          'success'
        );
        expect(screen.getByText('New Test Post')).toBeInTheDocument();
      });
    });
  });

  describe('Post Update', () => {
    it('should update post and show success toast', async () => {
      const user = userEvent.setup();
      renderWithStore(<PostsTable />);

      await waitFor(() => {
        expect(screen.getByText('First Post')).toBeInTheDocument();
      });

      // Open edit modal
      const editButtons = screen.getAllByRole('button', { name: /edit post/i });
      await user.click(editButtons[0]);

      // Update form
      const titleInput = screen.getByLabelText('Title');
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated First Post');

      // Submit
      const updateButton = screen.getByRole('button', { name: /update post/i });
      await user.click(updateButton);

      await waitFor(() => {
        expect(mockAddToast).toHaveBeenCalledWith(
          'Post updated successfully!',
          'success'
        );
        expect(screen.getByText('Updated First Post')).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('should show "No posts found" when there are no posts', async () => {
      mockedApi.fetchPostsClient.mockResolvedValueOnce({
        data: [],
        total: 0,
        page: 1,
        limit: 1000,
        totalPages: 0,
      });

      renderWithStore(<PostsTable />);

      await waitFor(() => {
        expect(screen.getByText('No posts found')).toBeInTheDocument();
      });
    });

    it('should show "No posts found" when search returns no results', async () => {
      const user = userEvent.setup();
      renderWithStore(<PostsTable />);

      await waitFor(() => {
        expect(screen.getByText('First Post')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search posts...');
      await user.type(searchInput, 'NonExistentPost');

      const searchButton = screen.getByRole('button', { name: /submit search/i });
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText('No posts found')).toBeInTheDocument();
      });
    });
  });

  describe('Post Display', () => {
    it('should display post with created date', async () => {
      renderWithStore(<PostsTable />);

      await waitFor(() => {
        expect(screen.getByText('First Post')).toBeInTheDocument();
      });

      expect(screen.getAllByText(/Created:/)[0]).toBeInTheDocument();
    });

    it('should display edited date when post is edited', async () => {
      const editedPost = {
        ...mockPosts[0],
        editedAt: '2024-01-05T10:00:00Z',
      };

      mockedApi.fetchPostsClient.mockResolvedValueOnce({
        data: [editedPost],
        total: 1,
        page: 1,
        limit: 1000,
        totalPages: 1,
      });

      renderWithStore(<PostsTable />);

      await waitFor(() => {
        expect(screen.getByText(/Edited:/)).toBeInTheDocument();
      });
    });
  });
});
