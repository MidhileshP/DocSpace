# DocSpace - System Architecture

This document provides a comprehensive overview of the DocSpace system architecture, its components, and the design decisions behind it.

## 1. High-Level Architecture

DocSpace is a real-time collaborative documentation platform with a modern architecture that separates the frontend and backend concerns.

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   Frontend      │      │   Backend       │      │   External      │
│   (React)       │◄───►│   (Node.js)     │◄───►│   Services      │
│                 │      │                 │      │                 │
│ • React Router  │      │ • Express.js    │      │ • Firebase Auth │
│ • BlockNote     │      │ • Firebase SDK  │      │ • Firestore     │
│ • Yjs/Y-Sweet   │      │ • Swagger       │      │ • Groq AI       │
│ • Tailwind CSS  │      │                 │      │ • Y-Sweet       │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

## 2. Frontend Architecture

The frontend is a single-page application (SPA) built with React. It's responsible for the user interface, real-time collaboration features, and communication with the backend API.

### Key Components

- **`App.jsx`**: The root component that sets up routing and global context providers.
- **`pages/`**: Contains the main pages of the application, such as the dashboard and editor.
- **`components/`**: Contains reusable UI components used throughout the application.
- **`contexts/`**: Contains React contexts for managing global state, such as authentication and the active document.
- **`services/`**: Contains the API service for making requests to the backend.

### State Management

- **`AuthContext`**: Manages the user's authentication state.
- **`DocumentContext`**: Manages the currently active document's ID.
- **`ThemeContext`**: Manages the application's theme (dark/light mode).
- **Local State**: Used for managing component-level state, such as UI loading and error states.

## 3. Backend Architecture

The backend is a Node.js application built with Express.js. It provides a RESTful API for managing documents, users, and authentication.

### Project Structure

```
backend/
├── src/
│   ├── controllers/   # Business logic for API endpoints
│   ├── middleware/    # Authentication and error handling
│   ├── routes/        # API route definitions
│   └── config/        # Firebase Admin SDK setup
├── tests/             # Jest and Supertest tests
└── app.js             # Express application setup
```

### Request Flow

1.  **Client Request**: The frontend sends a request to the backend.
2.  **Middleware**: The request passes through middleware for CORS, rate limiting, and authentication.
3.  **Routing**: The request is routed to the appropriate controller based on the endpoint.
4.  **Controller**: The controller processes the request, interacts with Firebase/Firestore, and returns a response.
5.  **Response**: The backend sends a response back to the client.

## 4. Data and Real-time Collaboration

### Firestore

- **`/docs/{docId}`**: A collection of documents, where each document contains its title, roles, members, and other metadata.
- **Security Rules**: Firestore security rules are used to enforce access control and ensure that users can only access the data they are authorized to.

### Yjs and Y-Sweet

- **Real-time Sync**: Yjs is used for real-time data synchronization between clients.
- **CRDTs**: Conflict-free Replicated Data Types are used to resolve conflicts automatically.
- **Y-Sweet**: A hosted Yjs backend is used to manage WebSocket connections and ensure reliable real-time updates.

## 5. Security

- **Authentication**: Firebase Authentication is used for secure email/password authentication. JWTs are used to authenticate API requests.
- **Authorization**: Role-based access control (Admin, Editor, Viewer) is implemented to control access to documents and features.
- **API Security**: The backend uses CORS and rate limiting to protect against common attacks.

## 6. Testing

- **Backend**: The backend has a suite of tests written with Jest and Supertest to test the API endpoints and authentication middleware.
- **Frontend**: The frontend testing strategy includes unit tests for components and integration tests for user flows.