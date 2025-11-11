# Test Suite Documentation

## Overview

This project includes comprehensive unit tests to ensure reliability and maintainability. The test suite covers components, Redux store logic, and API utilities.

## Test Coverage

### Components Tests

#### `PostsTable.test.tsx`
- **Loading and Initial Render**: Tests loading state, post display, error handling
- **Add New Post**: Tests modal opening and post creation flow
- **Search Functionality**: Tests filtering posts by search query
- **Sorting**: Tests sorting by title and date in ascending/descending order
- **Post Actions**: Tests edit and delete functionality with confirmation
- **Empty State**: Tests display when no posts are found
- **Post Display**: Tests date formatting for created and edited posts

#### `PostModal.test.tsx`
- **Rendering**: Tests modal display for creating and editing posts
- **Form Interactions**: Tests user input in title and body fields
- **Form Validation**: Tests validation for empty and whitespace-only inputs
- **Creating Posts**: Tests successful post creation with valid data
- **Updating Posts**: Tests post editing and data preservation
- **Modal Closing**: Tests various ways to close the modal
- **Error Handling**: Tests error display and clearing

### Store Tests

#### `postsSlice.test.ts`
- **Reducers**: Tests all Redux actions (setPosts, addPost, updatePost, deletePost, etc.)
- **State Management**: Tests pagination, sorting, and search state updates
- **ID Generation**: Tests automatic ID assignment for new posts
- **Edge Cases**: Tests non-existent post updates and deletions
- **Complex Scenarios**: Tests multiple actions in sequence

### API Tests

#### `api.test.ts`
- **fetchPostsClient**: Tests pagination, sorting, searching, and filtering
- **fetchPost**: Tests fetching a single post by ID
- **createPost**: Tests creating a new post
- **updatePost**: Tests updating an existing post
- **deletePost**: Tests deleting a post
- **Error Handling**: Tests API failure scenarios

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Test Statistics

- **Total Test Suites**: 4
- **Total Tests**: 74
- **Coverage Areas**:
  - Components: 2 test files
  - Redux Store: 1 test file
  - API Utilities: 1 test file

## Testing Tools

- **Jest**: Test runner and assertion library
- **React Testing Library**: Component testing utilities
- **@testing-library/user-event**: User interaction simulation
- **@testing-library/jest-dom**: Custom DOM matchers

## Configuration

- **jest.config.js**: Jest configuration with Next.js support
- **jest.setup.js**: Global test setup with mock definitions
- **jest.setup.d.ts**: TypeScript declarations for test utilities

## Best Practices

1. **Isolation**: Each test is independent and doesn't affect others
2. **Mocking**: External dependencies (API, Toast) are properly mocked
3. **User-Centric**: Tests simulate real user interactions
4. **Accessibility**: Tests use accessible queries (getByRole, getByLabelText)
5. **Async Handling**: Proper use of waitFor for async operations

## Continuous Integration

Tests are designed to run in CI/CD pipelines and provide fast feedback on code changes.
