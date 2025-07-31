# DocSpace - A Collaborative Real-time Editor

DocSpace is a modern, real-time collaborative documentation platform built with the MERN stack (MongoDB, Express.js, React, Node.js) and integrated with Firebase for authentication. It provides a seamless and intuitive interface for creating, editing, and managing documents with features like AI-powered assistance, real-time collaboration, and a comprehensive commenting system.

## 🚀 Features

- **Real-time Collaboration**: Work on documents with multiple users in real-time, with changes reflected instantly.
- **Rich Text Editor**: A powerful WYSIWYG editor with a wide range of formatting options to create beautiful documents.
- **AI-Powered Assistance**: Integrated with Groq for AI-powered content generation, editing, and suggestions.
- **Commenting System**: Add, reply to, and resolve comments on documents, with support for user mentions.
- **Document Management**: A full suite of CRUD operations for documents, with role-based access control (Admin, Editor, Viewer).
- **Secure Authentication**: Built-in email and password authentication powered by Firebase.
- **Dark/Light Mode**: A sleek and modern UI with support for both dark and light themes.

## 🛠 Tech Stack

### Frontend

- **React.js**: A JavaScript library for building user interfaces.
- **BlockNote**: A block-based rich text editor.
- **Yjs & Y-Sweet**: For real-time collaboration and data synchronization.
- **Tailwind CSS**: A utility-first CSS framework for styling.
- **Firebase**: For authentication and user management.

### Backend

- **Node.js & Express.js**: A runtime environment and web framework for building the server.
- **Firebase Admin SDK**: For server-side Firebase operations.
- **Firestore**: A NoSQL database for storing documents and user data.
- **Swagger**: For API documentation and testing.

## 📁 Project Structure

```
DocSpace/
├── frontend/          # React application
├── backend/           # Express.js API
├── docs/              # Technical documentation
└── README.md          # Main project documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- Bun (latest version)
- A Firebase project

### 1. Clone the Repository

```bash
git clone <repository-url>
cd DocSpace
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
cd frontend && bun install

# Install backend dependencies
cd ../backend && bun install
```

### 3. Set Up Environment Variables

Create a `firebaseConfig.json` file in `frontend/src/config/` with your Firebase project credentials:

```json
{
  "apiKey": "YOUR_API_KEY",
  "authDomain": "YOUR_AUTH_DOMAIN",
  "projectId": "YOUR_PROJECT_ID",
  "storageBucket": "YOUR_STORAGE_BUCKET",
  "messagingSenderId": "YOUR_MESSAGING_SENDER_ID",
  "appId": "YOUR_APP_ID"
}
```

### 4. Run the Application

```bash
# Run the frontend (from the frontend/ directory)
bun dev

# Run the backend (from the backend/ directory)
bun start
```
