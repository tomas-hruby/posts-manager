# Posts Manager

# Deployment

This app is deployed [here](https://posts-manager-iota.vercel.app/)

![Posts App Screenshot](https://i.postimg.cc/52GWzX6P/app-image.png)

A modern posts management application built with Next.js 15, featuring infinite scroll, Redux state management, and real-time CRUD operations.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Redux](https://img.shields.io/badge/Redux_Toolkit-2-purple)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-cyan)

## 🚀 Features

### Core Functionality
- ✅ **Infinite Scroll** - Automatically loads more posts as you scroll
- ✅ **CRUD Operations** - Create, Read, Update, and Delete posts
- ✅ **Real-time Search** - Filter posts by title or body content
- ✅ **Sorting** - Sort by Title or Date Created (ascending/descending)
- ✅ **Timestamps** - Tracks creation and edit dates for each post

### Technical Features
- ✅ **Server-Side Rendering** - Next.js 15 App Router with async Server Components
- ✅ **Redux Toolkit** - Centralized state management
- ✅ **On-Demand Loading** - Efficient data fetching with Intersection Observer API
- ✅ **Optimized Performance** - Uses `useMemo` and `useCallback` for optimizations
- ✅ **Error Boundaries** - Graceful error handling with custom error pages
- ✅ **Loading States** - Skeleton UI for better UX
- ✅ **Security Headers** - XSS protection, content-type options, frame options
- ✅ **Type Safety** - Full TypeScript coverage
- ✅ **Dark Theme** - Modern, professional UI with Tailwind CSS

## 📋 Prerequisites

- Node.js 18+ and npm
- Git

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone https://github.com/tomas-hruby/posts-manager.git
cd posts-manager
```

2. **Install dependencies**
```bash
npm install
```

3. **Run development server**
```bash
npm run dev
```

4. **Open in browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📦 Build for Production

```bash
npm run build
npm start
```

## 🏗️ Project Structure

```
web-it-next/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx             # Home page (Server Component)
│   ├── error.tsx            # Error boundary
│   ├── loading.tsx          # Loading skeleton
│   └── globals.css          # Global styles
├── components/
│   ├── PostsTable.tsx       # Main posts list with infinite scroll
│   ├── PostModal.tsx        # Create/Edit post modal
│   └── Providers.tsx        # Client providers wrapper
├── lib/
│   ├── api.ts               # API functions
│   ├── types.ts             # TypeScript interfaces
│   ├── store/
│   │   ├── store.ts         # Redux store configuration
│   │   ├── postsSlice.ts    # Posts Redux slice
│   │   ├── hooks.ts         # Typed Redux hooks
│   │   └── StoreProvider.tsx # Redux provider wrapper
│   └── queryClient.ts       # (Legacy - not used)
├── public/                  # Static assets
├── next.config.ts           # Next.js configuration
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.ts       # Tailwind CSS configuration
└── package.json             # Project dependencies
```

## 🎯 Key Technologies

### Framework & Language
- **Next.js 15** - React framework with App Router
- **TypeScript 5** - Type-safe JavaScript
- **React 19** - UI library

### State Management
- **Redux Toolkit 2** - Predictable state container
- **React-Redux 9** - React bindings for Redux

### Styling
- **Tailwind CSS 4** - Utility-first CSS framework
- **PostCSS** - CSS transformations

### API
- **JSONPlaceholder** - Fake REST API for testing

## 🔄 How It Works

### Data Flow
1. **Initial Load**: Component fetches all posts on mount (1000 posts)
2. **Display**: Shows first 10 posts
3. **Infinite Scroll**: Intersection Observer detects when user scrolls to bottom
4. **Load More**: Displays additional 10 posts from filtered/sorted dataset
5. **State Management**: All CRUD operations update Redux store
6. **Persistence**: New posts get highest ID and timestamp

### State Management Architecture
```
Server Component (page.tsx)
    ↓
StoreProvider (initializes Redux)
    ↓
PostsTable (Client Component)
    ↓
Redux Store (postsSlice)
    ↓
Filtered & Sorted Posts
    ↓
Infinite Scroll Display
```

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## 🎨 Features in Detail

### Infinite Scroll
- Uses Intersection Observer API for performance
- Loads 10 posts at a time
- Shows loading indicator while fetching
- "All posts loaded" message when complete

### CRUD Operations
- **Create**: Modal form with validation, assigns timestamp and highest ID
- **Read**: Infinite scroll list with search and sort
- **Update**: Edit modal pre-filled with post data, adds edit timestamp
- **Delete**: Confirmation dialog before deletion

### Search & Filter
- Real-time search across title and body
- Case-insensitive matching
- Resets scroll position on new search

### Sorting
- Sort by Title (alphabetical)
- Sort by Date Created (chronological)
- Uses edited date if available, otherwise created date
- Toggle ascending/descending order