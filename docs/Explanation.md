# DocSpace - Complete Line-by-Line Project Explanation

This document provides a comprehensive explanation of every aspect of the DocSpace collaborative documentation platform, including every import, hook, state variable, and functionality.

## Table of Contents
1. [Project Overview](#project-overview)
2. [Frontend Architecture](#frontend-architecture)
3. [Backend Architecture](#backend-architecture)
4. [Line-by-Line Code Explanation](#line-by-line-code-explanation)
5. [State Management](#state-management)
6. [Context System](#context-system)
7. [Real-time Collaboration](#real-time-collaboration)
8. [AI Integration](#ai-integration)

## Project Overview

DocSpace is a Notion-like collaborative documentation platform that enables real-time editing, commenting, AI assistance, and user management. It's built with React.js frontend and Node.js backend, using Firebase for authentication and Firestore for data storage.

### Core Technologies
- **Frontend**: React 18.3.1, Vite, Tailwind CSS
- **Editor**: BlockNote (rich text editor with collaboration)
- **Real-time**: Yjs + Y-Sweet for CRDT-based collaboration
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **AI**: Groq API with Llama models
- **Backend**: Node.js + Express.js

## Frontend Architecture

### Main Application Structure

#### `src/main.jsx` - Application Entry Point
```jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { DocumentProvider } from './contexts/DocumentContext';
import App from './App.jsx';
import './index.css';
```

**Line-by-Line Explanation:**
- `StrictMode`: React's development mode for detecting side effects and deprecated APIs
- `createRoot`: React 18's new root API for better concurrent features
- `BrowserRouter`: Enables client-side routing with HTML5 history API
- `AuthProvider`: Context provider for authentication state management
- `ThemeProvider`: Context provider for dark/light theme switching
- `DocumentProvider`: Context provider for active document state
- `App`: Main application component with routing logic
- `index.css`: Global styles including Tailwind CSS imports

**Context Hierarchy:**
```
Router (routing)
  └── AuthProvider (user authentication)
      └── ThemeProvider (theme state)
          └── DocumentProvider (document state)
              └── App (main application)
```

#### `src/App.jsx` - Main Application Component
```jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
```

**Route Structure:**
- `/` - Landing page (Home component)
- `/login` - Authentication page
- `/register` - User registration page
- `/dashboard` - Protected route showing user's documents
- `/editor` - Protected route for document editing

**ProtectedRoute Component:**
- Wraps routes that require authentication
- Redirects to login if user is not authenticated
- Shows loading spinner during authentication check

## Line-by-Line Code Explanation

### Editor Component (`src/pages/Editor.jsx`)

This is the most complex component in the application. Let's break it down completely:

#### Imports Section
```jsx
import React, { useState, useMemo, useEffect, useCallback } from 'react';
```
- `useState`: For local component state management
- `useMemo`: For expensive computations and object memoization
- `useEffect`: For side effects and lifecycle management
- `useCallback`: For function memoization to prevent unnecessary re-renders

```jsx
import { useNavigate } from 'react-router-dom';
```
- `useNavigate`: React Router hook for programmatic navigation

```jsx
import { documentApi } from '../services/api';
```
- Custom API service for backend communication (CRUD operations)

```jsx
import { BlockNoteView } from "@blocknote/mantine";
import { 
  useCreateBlockNote,
  SuggestionMenuController,
  getDefaultReactSlashMenuItems,
  FormattingToolbar,
  FormattingToolbarController,
  getFormattingToolbarItems
} from "@blocknote/react";
```
- `BlockNoteView`: Main editor component with Mantine styling
- `useCreateBlockNote`: Hook to create editor instance
- `SuggestionMenuController`: Controls suggestion menus (slash commands, mentions)
- `getDefaultReactSlashMenuItems`: Default slash menu items (headings, lists, etc.)
- `FormattingToolbar`: Toolbar for text formatting
- `FormattingToolbarController`: Controls formatting toolbar behavior
- `getFormattingToolbarItems`: Default formatting toolbar items

```jsx
import { 
  BlockNoteSchema, 
  defaultInlineContentSpecs,
  filterSuggestionItems 
} from "@blocknote/core";
```
- `BlockNoteSchema`: Defines editor schema (blocks, inline content)
- `defaultInlineContentSpecs`: Default inline content types (bold, italic, etc.)
- `filterSuggestionItems`: Utility to filter suggestion items based on query

```jsx
import { 
  createReactInlineContentSpec
} from "@blocknote/react";
```
- `createReactInlineContentSpec`: Creates custom inline content types (mentions)

```jsx
import {
  AIMenuController,
  AIToolbarButton,
  createAIExtension,
  getAISlashMenuItems,
} from "@blocknote/xl-ai";
```
- `AIMenuController`: Controls AI command menu
- `AIToolbarButton`: AI button for formatting toolbar
- `createAIExtension`: Creates AI extension for editor
- `getAISlashMenuItems`: AI-powered slash menu items

```jsx
import { createGroq } from "@ai-sdk/groq";
```
- `createGroq`: Creates Groq AI model instance for AI features

```jsx
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useDocument } from '../contexts/DocumentContext';
```
- Custom context hooks for accessing global state

```jsx
import { YDocProvider, useYDoc, useYjsProvider } from "@y-sweet/react";
```
- Y-Sweet React hooks for real-time collaboration using Yjs CRDTs

```jsx
import {
  DefaultThreadStoreAuth,
  YjsThreadStore,
} from "@blocknote/core/comments";
```
- Comment system components for threaded discussions

#### Utility Functions

```jsx
export const generateUserColor = (userId) => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};
```
**Purpose**: Generates consistent colors for user cursors and avatars
**Algorithm**: 
1. Creates hash from userId string
2. Uses modulo to select from predefined color palette
3. Ensures same user always gets same color

#### AI Configuration

```jsx
const createAIModel = () => {
  try {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey || apiKey === "your_groq_api_key_here") {
      console.warn("No Groq API key found. AI features will be disabled.");
      return null;
    }
    
    return createGroq({
      apiKey: apiKey,
    })("llama3-70b-8192");
  } catch (error) {
    console.error("Failed to create AI model:", error);
    return null;
  }
};
```
**Purpose**: Creates AI model instance for content generation
**Error Handling**: Gracefully disables AI if no API key provided
**Model**: Uses Llama 3 70B model via Groq API

#### Custom Inline Content (Mentions)

```jsx
const Mention = createReactInlineContentSpec(
  {
    type: "mention",
    propSchema: {
      user: {
        default: "Unknown",
      },
      userId: {
        default: "",
      },
    },
    content: "none",
  },
  {
    render: (props) => (
      <span className="bg-[#3b82f633] text-[#3b82f6] px-1 py-0.5 rounded font-medium">
        @{props.inlineContent.props.user}
      </span>
    ),
  },
);
```
**Purpose**: Creates custom mention inline content type
**Schema**: Defines user and userId properties
**Rendering**: Blue highlighted span with @ symbol
**Styling**: Uses Tailwind classes for consistent appearance

#### Schema Creation

```jsx
const schema = BlockNoteSchema.create({
  inlineContentSpecs: {
    ...defaultInlineContentSpecs,
    mention: Mention,
  },
});
```
**Purpose**: Creates editor schema with default content plus mentions
**Extension**: Adds mention functionality to default BlockNote features

#### Custom Hooks

```jsx
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};
```
**Purpose**: Debounces rapid value changes to prevent excessive API calls
**Implementation**: Uses setTimeout to delay value updates
**Cleanup**: Clears timeout on value change or unmount

#### User Resolution Function

```jsx
const resolveUsersFromBackend = async (userIds) => {
  try {
    if (!userIds || userIds.length === 0) return [];
    
    const users = await documentApi.getUserDetails(userIds);
    return users;
    
  } catch (error) {
    console.error('Error resolving users:', error);
    return userIds.map(userId => ({
      id: userId,
      name: `User ${userId.slice(-4)}`,
      email: ''
    }));
  }
};
```
**Purpose**: Resolves user IDs to user details (name, email)
**API Call**: Uses backend endpoint to get Firebase Auth user data
**Fallback**: Creates placeholder user data if API fails
**Error Handling**: Graceful degradation with user ID fragments

#### Main Editor Component

```jsx
const Editor = () => {
  const { activeDocumentId } = useDocument();
  const navigate = useNavigate();

  useEffect(() => {
    if (!activeDocumentId) {
      navigate('/dashboard');
    }
  }, [activeDocumentId, navigate]);

  if (!activeDocumentId) {
    return null;
  }

  return (
    <YDocProvider
      docId={activeDocumentId}
      authEndpoint="https://demos.y-sweet.dev/api/auth"
      showDebuggerLink={false}
    >
      <Document />
    </YDocProvider>
  );
};
```
**Purpose**: Wrapper component that provides Yjs document context
**Navigation**: Redirects to dashboard if no active document
**YDocProvider**: Provides real-time collaboration infrastructure
**Auth Endpoint**: Y-Sweet demo endpoint for WebSocket authentication

#### Document Component State

```jsx
function Document() {
  const { activeDocumentId: id } = useDocument();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark } = useTheme();

  // Core State
  const [document, setDocument] = useState(null);
  const [activeUsers, setActiveUsers] = useState([]); 
  const [activeUser, setActiveUser] = useState(null);
  const [title, setTitle] = useState('');
  const [isEditable, setIsEditable] = useState(false);
  const [documentUsers, setDocumentUsers] = useState([]);
  const [userCache, setUserCache] = useState(new Map());

  // UI & Save State
  const [status, setStatus] = useState('idle');
  const [loading, setLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);
  const [error, setError] = useState('');
  const [isShareModalOpen, setShareModalOpen] = useState(false);

  // Store initial data for comparison
  const [initialData, setInitialData] = useState({
    title: '',
  });

  // Yjs providers
  const provider = useYjsProvider();
  const ydoc = useYDoc();
```

**State Variables Explained:**

1. **document**: Current document data from API (title, roles, members, etc.)
2. **activeUsers**: Array of users currently editing (from Yjs awareness)
3. **activeUser**: Current user's data with role information
4. **title**: Document title (controlled input)
5. **isEditable**: Boolean indicating if user can edit (based on role)
6. **documentUsers**: All users with access to document (for mentions)
7. **userCache**: Map cache for resolved user data (performance optimization)
8. **status**: Save status ('idle', 'saving', 'saved')
9. **loading**: Initial loading state
10. **lastSaved**: Timestamp of last save operation
11. **error**: Error message for display
12. **isShareModalOpen**: Modal visibility state
13. **initialData**: Original data for change detection
14. **provider**: Yjs WebSocket provider for real-time sync
15. **ydoc**: Yjs document instance

#### Debounced Values

```jsx
const debouncedTitle = useDebounce(title, 1500);
```
**Purpose**: Debounces title changes to trigger auto-save after 1.5 seconds
**Prevents**: Excessive API calls while user is typing

#### Memoized Values

```jsx
const aiModel = useMemo(() => createAIModel(), []);
```
**Purpose**: Creates AI model instance once and memoizes it
**Performance**: Prevents recreation on every render

#### Cached User Resolution

```jsx
const resolveUsersWithCache = useCallback(async (userIds) => {
  if (!userIds || userIds.length === 0) return [];
  
  const uncachedIds = userIds.filter(id => !userCache.has(id));
  
  if (uncachedIds.length > 0) {
    const newUsers = await resolveUsersFromBackend(uncachedIds);
    const newCache = new Map(userCache);
    newUsers.forEach(userData => {
      newCache.set(userData.id, userData);
    });
    setUserCache(newCache);
  }
  
  return userIds.map(id => userCache.get(id) || {
    id,
    name: `User ${id.slice(-4)}`,
    email: ''
  });
}, [userCache]);
```
**Purpose**: Resolves user IDs to user data with caching
**Optimization**: Only fetches uncached user data
**Fallback**: Provides placeholder data for missing users
**Memoization**: useCallback prevents recreation unless userCache changes

#### Mention Menu Items

```jsx
const getMentionMenuItems = useCallback((editor) => {    
  return documentUsers
    .filter(docUser => docUser && docUser.id && docUser.name)
    .map((docUser) => ({
      title: docUser.name,
      subtext: docUser.email || '',
      onItemClick: () => {
        editor.insertInlineContent([
          {
            type: "mention",
            props: {
              user: docUser.name,
              userId: docUser.id,
            },
          },
          " ",
        ]);
      },
    }));
}, [documentUsers]);
```
**Purpose**: Creates mention menu items for @ trigger
**Filtering**: Only includes users with valid ID and name
**Click Handler**: Inserts mention inline content into editor
**Spacing**: Adds space after mention for better UX

#### User Awareness Effect

```jsx
useEffect(() => {
  if (!provider || !user) return;

  const awareness = provider.awareness;
  
  awareness.setLocalStateField('user', {
    id: user.uid,
    name: user.displayName || user.email?.split('@')[0] || `User ${user.uid.slice(-4)}`,
    email: user.email,
    color: generateUserColor(user.uid)
  });

  const handleAwarenessChange = () => {
    const states = Array.from(awareness.getStates().values());
    setActiveUsers(states);
  };

  awareness.on('change', handleAwarenessChange);
  handleAwarenessChange();

  return () => {
    awareness.off('change', handleAwarenessChange);
  };
}, [provider, user]);
```
**Purpose**: Manages user presence and cursor sharing
**Awareness**: Yjs awareness API for real-time user presence
**User Data**: Sets current user's info (name, color, email)
**Event Handling**: Listens for awareness changes (users joining/leaving)
**Cleanup**: Removes event listener on unmount

#### Document Loading Effect

```jsx
useEffect(() => {
  const fetchDocumentAndUsers = async () => {
    if (user && id) {
      try {
        setLoading(true);
        
        const doc = await documentApi.getById(id);
        const userRole = doc.roles?.[user.uid] || null;
        const canEdit = userRole === 'admin' || userRole === 'editor';
        
        setIsEditable(canEdit);
        setTitle(doc.title);
        setDocument({ ...doc, role: userRole });
        setLastSaved(doc.updatedAt ? new Date(doc.updatedAt) : null);
        setInitialData({ title: doc.title });

        const userIds = doc.members || [];
        
        if (userIds.length > 0) {
          const resolvedUsers = await resolveUsersFromBackend(userIds);
          
          const newCache = new Map();
          resolvedUsers.forEach(userData => {
            newCache.set(userData.id, userData);
          });
          setUserCache(newCache);
          
          setDocumentUsers(resolvedUsers);
          
          const currentUserData = resolvedUsers.find(u => u.id === user.uid) || {
            id: user.uid,
            name: user.displayName || user.email?.split('@')[0] || `User ${user.uid.slice(-4)}`,
            email: user.email || ''
          };
          
          setActiveUser({ ...currentUserData, role: userRole || 'viewer' });
        } else {
          const currentUserData = {
            id: user.uid,
            name: user.displayName || user.email?.split('@')[0] || `User ${user.uid.slice(-4)}`,
            email: user.email || ''
          };
          
          setDocumentUsers([currentUserData]);
          setActiveUser({ ...currentUserData, role: userRole || 'viewer' });
        }
        
      } catch (error) {
        console.error('Load document error:', error);
        setError('Failed to load document.');
      } finally {
        setLoading(false);
      }
    }
  };
  
  fetchDocumentAndUsers();
}, [id, user]);
```
**Purpose**: Loads document data and user information on mount
**API Call**: Fetches document by ID from backend
**Permission Check**: Determines if user can edit based on role
**User Resolution**: Loads all document members for mentions
**Cache Population**: Populates user cache for performance
**Error Handling**: Sets error state if loading fails
**Loading State**: Manages loading spinner

#### Auto-save Effect

```jsx
useEffect(() => {
  if (!isEditable || !document || loading || !activeUser) return;

  const hasTitleChanged = debouncedTitle !== initialData.title;
  if (hasTitleChanged && debouncedTitle.trim()) {
    handleSave({ title: debouncedTitle });
  }
}, [debouncedTitle, initialData.title, isEditable, document, loading, activeUser]);
```
**Purpose**: Auto-saves title changes after debounce delay
**Conditions**: Only saves if user can edit and document is loaded
**Change Detection**: Compares debounced title with initial value
**Validation**: Only saves non-empty titles

#### Thread Store for Comments

```jsx
const threadStore = useMemo(() => {
  if (!activeUser || !ydoc) return null;
  return new YjsThreadStore(
    activeUser.id,
    ydoc.getMap("threads"),
    new DefaultThreadStoreAuth(activeUser.id, activeUser.role === 'viewer' ? 'comment' : 'editor'),
  );
}, [ydoc, activeUser]);
```
**Purpose**: Creates comment thread store for collaborative commenting
**Yjs Integration**: Uses Yjs Map for real-time comment synchronization
**Authentication**: Sets permissions based on user role
**Memoization**: Recreates only when dependencies change

#### BlockNote Editor Creation

```jsx
const editor = useCreateBlockNote(
  {
    schema,
    resolveUsers: resolveUsersWithCache,
    comments: threadStore ? { threadStore } : undefined,
    extensions: aiModel ? [
      createAIExtension({
        model: aiModel,
      }),
    ] : [],
    collaboration: provider && activeUser ? {
      provider,
      fragment: ydoc.getXmlFragment("blocknote"),
      user: { 
        color: generateUserColor(activeUser.id), 
        name: activeUser.name 
      },
      showCursorLabels: "activity",
      onError: (error) => {
        console.warn('Collaboration error:', error);
      }
    } : undefined,
    slashMenu: false,
    formattingToolbar: false,
  },
  [activeUser, threadStore, provider, ydoc, schema, resolveUsersWithCache, aiModel],
);
```
**Purpose**: Creates BlockNote editor instance with all features
**Configuration Options:**
- `schema`: Custom schema with mentions
- `resolveUsers`: Function to resolve user IDs to user data
- `comments`: Comment system integration
- `extensions`: AI extension if available
- `collaboration`: Real-time collaboration setup
- `slashMenu: false`: Disables default slash menu (using custom)
- `formattingToolbar: false`: Disables default toolbar (using custom)

**Collaboration Setup:**
- `provider`: Yjs WebSocket provider
- `fragment`: XML fragment for document content
- `user`: Current user info for cursors
- `showCursorLabels`: Shows user names on cursors
- `onError`: Handles collaboration errors gracefully

#### Custom Toolbar Component

```jsx
const FormattingToolbarWithAI = ({ editor }) => {
  return (
    <FormattingToolbarController
      editor={editor}
      getItems={(editor) => [
        ...getFormattingToolbarItems(editor),
        ...(aiModel ? [AIToolbarButton(editor)] : []),
      ]}
    />
  );
};
```
**Purpose**: Creates custom formatting toolbar with AI button
**Items**: Includes default formatting items plus AI button if available
**Conditional**: Only adds AI button if AI model is configured

#### Custom Slash Menu Component

```jsx
const SuggestionMenuWithAI = ({ editor }) => {
  return (
    <SuggestionMenuController
      triggerCharacter="/"
      getItems={async (query) =>
        filterSuggestionItems(
          [
            ...getDefaultReactSlashMenuItems(editor),
            ...(aiModel ? getAISlashMenuItems(editor) : []),
          ],
          query,
        )
      }
    />
  );
};
```
**Purpose**: Creates custom slash menu with AI options
**Trigger**: Activates on "/" character
**Items**: Combines default items with AI items if available
**Filtering**: Filters items based on user query

#### Save Function

```jsx
const handleSave = async (data = {}) => {
  if (status === 'saving' || !isEditable || !document) return;

  try {
    setStatus('saving');
    
    const updateData = {};
    
    if (data.title !== undefined) {
      updateData.title = data.title;
      setInitialData(prev => ({ ...prev, title: data.title }));
    }
    
    if (Object.keys(updateData).length > 0) {
      await documentApi.update(id, updateData);
    }

    setLastSaved(new Date());
    setStatus('saved');

    setTimeout(() => setStatus('idle'), 2000);

  } catch (err) {
    console.error('Save error:', err);
    setError('Failed to save document');
    setStatus('idle');
  }
};
```
**Purpose**: Saves document changes to backend
**Debouncing**: Prevents multiple simultaneous saves
**Status Management**: Updates UI with save status
**Error Handling**: Shows error message if save fails
**Success Feedback**: Shows "saved" status for 2 seconds

#### Status Indicator Function

```jsx
const getStatusIndicator = () => {
  if (!isEditable) {
    return lastSaved ? (
      <span className="text-sm text-secondary-500 dark:text-primary-300 flex items-center">
        <Clock className="h-4 w-4 mr-1.5" />
        Last saved: {lastSaved.toLocaleTimeString()}
      </span>
    ) : null;
  }

  if (status === 'saving') {
    return (
      <span className="text-sm text-secondary-500 dark:text-primary-300 flex items-center">
        <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
        Saving...
      </span>
    );
  }

  if (status === 'saved' || status === 'idle') {
    return (
      <span className="text-sm text-green-600 dark:text-green-400 flex items-center">
        <CheckCircle className="h-4 w-4 mr-1.5" />
        Saved
      </span>
    );
  }

  return <div className="h-5 w-20" />;
};
```
**Purpose**: Displays appropriate save status indicator
**Read-only**: Shows last saved time for viewers
**Saving**: Shows spinner during save operation
**Saved**: Shows checkmark when save completes
**Fallback**: Empty div for consistent spacing

## State Management

### Context System

#### AuthContext (`src/contexts/AuthContext.jsx`)

```jsx
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (userName, email, password) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    await updateProfile(userCredential.user, {
      displayName: userName
    });
    
    setUser({
      ...userCredential.user,
      displayName: userName
    });
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

**Purpose**: Manages global authentication state
**State Variables:**
- `user`: Current authenticated user object
- `loading`: Authentication check in progress

**Functions:**
- `login`: Authenticates user with email/password
- `register`: Creates new user account with display name
- `logout`: Signs out current user

**Firebase Integration:**
- `onAuthStateChanged`: Listens for auth state changes
- `signInWithEmailAndPassword`: Firebase login method
- `createUserWithEmailAndPassword`: Firebase registration method
- `updateProfile`: Sets user display name
- `signOut`: Firebase logout method

#### ThemeContext (`src/contexts/ThemeContext.jsx`)

```jsx
const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : false;
  });

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const value = {
    isDark,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
```

**Purpose**: Manages global theme state (dark/light mode)
**State Variables:**
- `isDark`: Boolean indicating current theme

**Functions:**
- `toggleTheme`: Switches between dark and light themes

**Persistence**: Saves theme preference to localStorage
**DOM Integration**: Adds/removes 'dark' class on document element

#### DocumentContext (`src/contexts/DocumentContext.jsx`)

```jsx
const DocumentContext = createContext();

export const useDocument = () => {
  return useContext(DocumentContext);
};

export const DocumentProvider = ({ children }) => {
  const [activeDocumentId, setActiveDocumentId] = useState(null);

  const value = {
    activeDocumentId,
    setActiveDocumentId,
  };

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
};
```

**Purpose**: Manages currently active document ID
**State Variables:**
- `activeDocumentId`: ID of document being edited

**Usage**: Allows navigation between dashboard and editor while maintaining document context

## Real-time Collaboration

### Yjs Integration

The project uses Yjs (Yet another JavaScript library) for real-time collaboration:

#### Y-Sweet Provider
```jsx
<YDocProvider
  docId={activeDocumentId}
  authEndpoint="https://demos.y-sweet.dev/api/auth"
  showDebuggerLink={false}
>
```

**Purpose**: Provides Yjs document and WebSocket connection
**docId**: Unique identifier for the collaborative document
**authEndpoint**: Y-Sweet authentication endpoint
**showDebuggerLink**: Disables debug UI in production

#### Collaboration Features

1. **Real-time Text Editing**: Multiple users can edit simultaneously
2. **Cursor Sharing**: See other users' cursor positions
3. **User Presence**: Know who's currently online
4. **Conflict Resolution**: Automatic merge of conflicting changes
5. **Offline Support**: Changes sync when connection restored

#### Awareness System
```jsx
const awareness = provider.awareness;

awareness.setLocalStateField('user', {
  id: user.uid,
  name: user.displayName || user.email?.split('@')[0] || `User ${user.uid.slice(-4)}`,
  email: user.email,
  color: generateUserColor(user.uid)
});
```

**Purpose**: Shares user presence information
**Data Shared**: User ID, name, email, cursor color
**Real-time Updates**: Other users see this information instantly

## AI Integration

### Groq API Integration

The project integrates with Groq API for AI-powered content generation:

#### Model Configuration
```jsx
const createAIModel = () => {
  try {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey || apiKey === "your_groq_api_key_here") {
      console.warn("No Groq API key found. AI features will be disabled.");
      return null;
    }
    
    return createGroq({
      apiKey: apiKey,
    })("llama3-70b-8192");
  } catch (error) {
    console.error("Failed to create AI model:", error);
    return null;
  }
};
```

**Model**: Llama 3 70B (8192 context length)
**Error Handling**: Gracefully disables AI if no API key
**Environment Variable**: `VITE_GROQ_API_KEY`

#### AI Features

1. **AI Toolbar Button**: Edit selected text with AI
2. **AI Slash Commands**: Generate content with AI
3. **AI Menu Controller**: Additional AI operations

#### AI Extension
```jsx
extensions: aiModel ? [
  createAIExtension({
    model: aiModel,
  }),
] : [],
```

**Purpose**: Adds AI capabilities to BlockNote editor
**Conditional**: Only enabled if AI model is available

## Backend Architecture

### Express.js Server (`server/app.js`)

```jsx
import express from 'express';
import cors from 'cors';
import documentRoutes from './routes/documentRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/docs', documentRoutes);
```

**Purpose**: Creates Express.js server with middleware
**CORS**: Enables cross-origin requests from frontend
**JSON Parsing**: Parses JSON request bodies
**Routes**: Mounts document routes at `/api/docs`

### Authentication Middleware (`server/src/middleware/auth.js`)

```jsx
export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(403).json({ error: 'Invalid token' });
  }
};
```

**Purpose**: Verifies Firebase JWT tokens
**Token Extraction**: Gets token from Authorization header
**Verification**: Uses Firebase Admin SDK to verify token
**User Context**: Adds decoded user info to request object

### Document Controller (`server/src/controllers/documentController.js`)

The controller handles all document-related operations:

#### Get All Documents
```jsx
export const getAllDocuments = async (req, res) => {
  try {
    const userId = req.user.uid;
    const docsRef = db.collection('docs');
    
    const snapshot = await docsRef
      .where('members', 'array-contains', userId)
      .orderBy('updatedAt', 'desc')
      .get();
    
    const documents = [];
    snapshot.forEach((doc) => {
      documents.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      });
    });

    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
};
```

**Purpose**: Retrieves all documents user has access to
**Query**: Firestore array-contains query on members field
**Sorting**: Orders by updatedAt descending (newest first)
**Date Conversion**: Converts Firestore timestamps to JavaScript dates

#### Create Document
```jsx
export const createDocument = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { title, content } = req.body;
    
    const docData = {
      title: title || 'Untitled Document',
      comments: [],
      suggestions: [],
      roles: {
        [userId]: 'admin',
      },
      members: [userId],
      createdByName: req.user.name || req.user.email,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await db.collection('docs').add(docData);
    
    res.status(201).json({
      id: docRef.id,
      ...docData,
    });
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ error: 'Failed to create document' });
  }
};
```

**Purpose**: Creates new document with creator as admin
**Default Values**: Sets default title, empty arrays for comments/suggestions
**Permissions**: Creator gets admin role automatically
**Timestamps**: Sets creation and update timestamps

#### Update Document
```jsx
export const updateDocument = async (req, res) => {
  try {
    const userId = req.user.uid;
    const docId = req.params.id;
    const { title, content, roles, comments, suggestions } = req.body;
    
    const docRef = db.collection('docs').doc(docId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const docData = doc.data();
    const userRole = docData.roles?.[userId];

    if (!userRole) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const updateData = {
      updatedAt: new Date(),
    };
    
    // Role updates are restricted to admins
    if (roles) {
      if (userRole !== 'admin') {
        return res.status(403).json({ error: 'Only admins can change roles.' });
      }
      updateData.roles = roles;
      updateData.members = Object.keys(roles);
    }
    
    // Content/Title updates restricted to admins/editors
    if (title !== undefined || content !== undefined) {
      if (userRole === 'viewer') {
        return res.status(403).json({ error: 'Viewers cannot edit the document.' });
      }
      if (title !== undefined) updateData.title = title;
      if (content !== undefined) updateData.content = content;
    }
    
    // Comments/Suggestions can be updated by any member
    if (comments !== undefined) {
        updateData.comments = comments;
    }
    if (suggestions !== undefined) {
        updateData.suggestions = suggestions;
    }

    await docRef.update(updateData);

    res.json({ message: 'Document updated successfully' });
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ error: 'Failed to update document' });
  }
};
```

**Purpose**: Updates document based on user permissions
**Permission Checks**: Different operations require different roles
**Role Management**: Only admins can change user roles
**Content Editing**: Admins and editors can edit content
**Comments**: All members can add comments

### Firebase Configuration (`server/src/config/firebase.js`)

```jsx
import admin from 'firebase-admin';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const serviceAccount = require('./serviceAccount.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export const db = admin.firestore();
export const auth = admin.auth();
```

**Purpose**: Initializes Firebase Admin SDK
**Service Account**: Uses service account key for authentication
**Exports**: Provides Firestore database and Auth instances

## API Service (`src/services/api.js`)

```jsx
const API_BASE_URL = 'http://localhost:5000/api';

const getAuthToken = async () => {
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken(true);
  }
  return null;
};

const apiRequest = async (endpoint, options = {}) => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('User is not authenticated.');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({
        error: `API request failed with status: ${response.status} ${response.statusText}`
    }));
    throw new Error(errorBody.error || 'An unknown API error occurred.');
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

export const documentApi = {
  getAll: () => apiRequest('/docs'),
  getById: (id) => apiRequest(`/docs/${id}`),
  create: (data) => apiRequest('/docs', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => apiRequest(`/docs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => apiRequest(`/docs/${id}`, {
    method: 'DELETE',
  }),
  getPermissions: (id) => apiRequest(`/docs/${id}/permissions`),
  share: (id, email, role) => apiRequest(`/docs/${id}/share`, {
    method: 'POST',
    body: JSON.stringify({ email, role }),
  }),
  removeAccess: (id, userId) => apiRequest(`/docs/${id}/remove_access`, {
      method: 'POST',
      body: JSON.stringify({ userIdToRemove: userId }),
  }),
  getUserDetails: (userIds) => apiRequest('/docs/users/details', {
    method: 'POST',
    body: JSON.stringify({ userIds }),
  }),
};
```

**Purpose**: Provides API interface for frontend
**Authentication**: Automatically includes Firebase JWT token
**Error Handling**: Parses and throws meaningful error messages
**Methods**: Covers all document CRUD operations and sharing

## Styling System

### Tailwind CSS Configuration (`tailwind.config.js`)

```jsx
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f8f6f3',
          100: '#f0ebe3',
          200: '#e4d7c7',
          300: '#d8c9ae',
          400: '#c9b595',
          500: '#b8a082',
          600: '#a08c70',
          700: '#87755e',
          800: '#6f614f',
          900: '#5a4f42',
        },
        secondary: {
          50: '#f7f7f7',
          100: '#ededed',
          200: '#dfdfdf',
          300: '#c4c4c4',
          400: '#a8a8a8',
          500: '#8c8c8c',
          600: '#757575',
          700: '#575757',
          800: '#454545',
          900: '#3a3a3a',
        }
      }
    },
  },
  plugins: [],
};
```

**Purpose**: Configures Tailwind CSS with custom color palette
**Dark Mode**: Uses class-based dark mode switching
**Color System**: Primary (warm browns) and secondary (grays) color ramps

### Global Styles (`src/index.css`)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-primary-50 dark:bg-secondary-900 text-secondary-800 dark:text-primary-100 select-none overflow-y-auto overflow-hidden;
  }
}

/* Comment System Styles */
.bn-comment-thread {
  @apply bg-white dark:bg-secondary-800 border border-primary-200 dark:border-secondary-700 rounded-lg shadow-lg p-4 max-w-sm;
}

.bn-comment-author {
  @apply font-semibold text-secondary-900 dark:text-white text-sm mb-1;
}

.bn-comment-content {
  @apply text-secondary-700 dark:text-primary-200 text-sm mb-3 leading-relaxed;
}

/* AI Styles */
.bn-ai-menu {
  @apply bg-white dark:bg-secondary-800 border border-primary-200 dark:border-secondary-700 rounded-lg shadow-lg;
}

.bn-ai-menu-item {
  @apply px-3 py-2 hover:bg-primary-50 dark:hover:bg-secondary-700 cursor-pointer text-secondary-900 dark:text-white;
}
```

**Purpose**: Provides global styles and component-specific styling
**Theme Support**: All styles support dark/light mode
**Component Styles**: Specific styles for comments and AI features

## Security Considerations

### Authentication Security
- Firebase JWT tokens for secure authentication
- Token verification on every API request
- Automatic token refresh handling

### Authorization Security
- Role-based access control (admin, editor, viewer)
- Server-side permission validation
- Document-level access control

### Data Security
- HTTPS for all communications
- WebSocket Secure (WSS) for real-time features
- Environment variable protection for API keys

## Performance Optimizations

### Frontend Optimizations
- React.memo for component memoization
- useCallback for function memoization
- useMemo for expensive computations
- Debouncing for API calls
- User data caching

### Backend Optimizations
- Firestore query optimization
- Proper indexing strategy
- Connection pooling
- Error handling and logging

## Deployment Considerations

### Frontend Deployment
- Static site hosting (Vercel, Netlify)
- Environment variable configuration
- Build optimization

### Backend Deployment
- Container-based deployment
- Environment configuration
- Health check endpoints
- Monitoring and logging

This comprehensive explanation covers every aspect of the DocSpace project, from individual imports and state variables to the overall architecture and deployment considerations. Each component, hook, and function serves a specific purpose in creating a robust collaborative documentation platform.