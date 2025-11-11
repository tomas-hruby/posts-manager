import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PostModal from '../PostModal';
import { Post } from '@/lib/types';

// Mock ToastContext
const mockAddToast = jest.fn();
jest.mock('@/lib/toast/ToastContext', () => ({
  useToast: () => ({
    addToast: mockAddToast,
  }),
}));

describe('PostModal Component', () => {
  const mockOnClose = jest.fn();
  const mockOnPostCreated = jest.fn();
  const mockOnPostUpdated = jest.fn();

  const defaultProps = {
    post: null,
    onClose: mockOnClose,
    onPostCreated: mockOnPostCreated,
    onPostUpdated: mockOnPostUpdated,
  };

  const mockPost: Post = {
    id: 1,
    userId: 1,
    title: 'Test Post',
    body: 'Test Body',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the modal for creating a new post', () => {
      render(<PostModal {...defaultProps} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Create New Post')).toBeInTheDocument();
      expect(screen.getByLabelText('Title')).toBeInTheDocument();
      expect(screen.getByLabelText('Body')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create post/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should render the modal for editing a post', () => {
      render(<PostModal {...defaultProps} post={mockPost} />);

      expect(screen.getByText('Edit Post')).toBeInTheDocument();
      expect(screen.getByLabelText('Title')).toHaveValue('Test Post');
      expect(screen.getByLabelText('Body')).toHaveValue('Test Body');
      expect(screen.getByRole('button', { name: /update post/i })).toBeInTheDocument();
    });

    it('should have proper ARIA attributes', () => {
      render(<PostModal {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
    });
  });

  describe('Form Interactions', () => {
    it('should allow typing in the title field', async () => {
      const user = userEvent.setup();
      render(<PostModal {...defaultProps} />);

      const titleInput = screen.getByLabelText('Title');
      await user.type(titleInput, 'My New Post');

      expect(titleInput).toHaveValue('My New Post');
    });

    it('should allow typing in the body field', async () => {
      const user = userEvent.setup();
      render(<PostModal {...defaultProps} />);

      const bodyInput = screen.getByLabelText('Body');
      await user.type(bodyInput, 'This is the post body');

      expect(bodyInput).toHaveValue('This is the post body');
    });
  });

  describe('Form Validation', () => {
    it('should not submit when title is empty', async () => {
      const user = userEvent.setup();
      render(<PostModal {...defaultProps} />);

      const bodyInput = screen.getByLabelText('Body');
      await user.type(bodyInput, 'Some body text');

      const submitButton = screen.getByRole('button', { name: /create post/i });
      await user.click(submitButton);

      // HTML5 validation prevents submission, so callback shouldn't be called
      expect(mockOnPostCreated).not.toHaveBeenCalled();
    });

    it('should not submit when body is empty', async () => {
      const user = userEvent.setup();
      render(<PostModal {...defaultProps} />);

      const titleInput = screen.getByLabelText('Title');
      await user.type(titleInput, 'Some title');

      const submitButton = screen.getByRole('button', { name: /create post/i });
      await user.click(submitButton);

      // HTML5 validation prevents submission
      expect(mockOnPostCreated).not.toHaveBeenCalled();
    });

    it('should show error when title is only whitespace', async () => {
      const user = userEvent.setup();
      render(<PostModal {...defaultProps} />);

      const titleInput = screen.getByLabelText('Title');
      const bodyInput = screen.getByLabelText('Body');
      
      await user.type(titleInput, '   ');
      await user.type(bodyInput, 'Some body');

      const submitButton = screen.getByRole('button', { name: /create post/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockAddToast).toHaveBeenCalledWith('Title is required', 'error');
      });

      expect(mockOnPostCreated).not.toHaveBeenCalled();
    });
  });

  describe('Creating a Post', () => {
    it('should create a new post with valid data', async () => {
      const user = userEvent.setup();
      render(<PostModal {...defaultProps} />);

      const titleInput = screen.getByLabelText('Title');
      const bodyInput = screen.getByLabelText('Body');

      await user.type(titleInput, 'New Post Title');
      await user.type(bodyInput, 'New Post Body');

      const submitButton = screen.getByRole('button', { name: /create post/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnPostCreated).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'New Post Title',
            body: 'New Post Body',
            userId: 1,
          })
        );
      });

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should trim whitespace from title and body', async () => {
      const user = userEvent.setup();
      render(<PostModal {...defaultProps} />);

      const titleInput = screen.getByLabelText('Title');
      const bodyInput = screen.getByLabelText('Body');

      await user.type(titleInput, '  Trimmed Title  ');
      await user.type(bodyInput, '  Trimmed Body  ');

      const submitButton = screen.getByRole('button', { name: /create post/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnPostCreated).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Trimmed Title',
            body: 'Trimmed Body',
          })
        );
      });
    });

    it('should generate a timestamp-based ID for new posts', async () => {
      const user = userEvent.setup();
      const dateSpy = jest.spyOn(Date, 'now').mockReturnValue(1234567890);
      
      render(<PostModal {...defaultProps} />);

      const titleInput = screen.getByLabelText('Title');
      const bodyInput = screen.getByLabelText('Body');

      await user.type(titleInput, 'Test Title');
      await user.type(bodyInput, 'Test Body');

      const submitButton = screen.getByRole('button', { name: /create post/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnPostCreated).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 1234567890,
          })
        );
      });

      dateSpy.mockRestore();
    });
  });

  describe('Updating a Post', () => {
    it('should update an existing post with valid data', async () => {
      const user = userEvent.setup();
      render(<PostModal {...defaultProps} post={mockPost} />);

      const titleInput = screen.getByLabelText('Title');
      const bodyInput = screen.getByLabelText('Body');

      await user.clear(titleInput);
      await user.clear(bodyInput);
      await user.type(titleInput, 'Updated Title');
      await user.type(bodyInput, 'Updated Body');

      const submitButton = screen.getByRole('button', { name: /update post/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnPostUpdated).toHaveBeenCalledWith({
          id: 1,
          userId: 1,
          title: 'Updated Title',
          body: 'Updated Body',
        });
      });

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should preserve post ID and userId when updating', async () => {
      const user = userEvent.setup();
      render(<PostModal {...defaultProps} post={mockPost} />);

      const titleInput = screen.getByLabelText('Title');
      await user.clear(titleInput);
      await user.type(titleInput, 'New Title');

      const submitButton = screen.getByRole('button', { name: /update post/i });
      await user.click(submitButton);

      await waitFor(() => {
        const updatedPost = mockOnPostUpdated.mock.calls[0][0];
        expect(updatedPost.id).toBe(1);
        expect(updatedPost.userId).toBe(1);
      });
    });
  });

  describe('Modal Closing', () => {
    it('should close modal when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<PostModal {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should close modal when close icon is clicked', async () => {
      const user = userEvent.setup();
      render(<PostModal {...defaultProps} />);

      const closeButton = screen.getByLabelText('Close modal');
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should close modal when clicking outside the modal content', async () => {
      const user = userEvent.setup();
      render(<PostModal {...defaultProps} />);

      const backdrop = screen.getByRole('dialog');
      await user.click(backdrop);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should not close modal when clicking inside the modal content', async () => {
      const user = userEvent.setup();
      render(<PostModal {...defaultProps} />);

      const titleInput = screen.getByLabelText('Title');
      await user.click(titleInput);

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should allow valid submission after fixing whitespace error', async () => {
      const user = userEvent.setup();
      render(<PostModal {...defaultProps} />);

      // Submit with whitespace title to trigger error
      const bodyInput = screen.getByLabelText('Body');
      const titleInput = screen.getByLabelText('Title');
      
      await user.type(bodyInput, 'Some body');
      await user.type(titleInput, '   ');
      
      const submitButton = screen.getByRole('button', { name: /create post/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockAddToast).toHaveBeenCalledWith('Title is required', 'error');
      });

      // Now fix title and resubmit
      await user.clear(titleInput);
      await user.type(titleInput, 'Valid Title');
      await user.click(submitButton);

      // Post should be created
      await waitFor(() => {
        expect(mockOnPostCreated).toHaveBeenCalled();
      });
    });
  });
});
