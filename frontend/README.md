# DocSpace - Frontend

This directory contains the frontend for the DocSpace application, a React application built with Vite that provides a rich and intuitive user interface for real-time collaborative document editing.

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Bun (latest version)
- A Firebase project

### 1. Install Dependencies

```bash
bun install
```

### 2. Set Up Environment Variables

Create a `firebaseConfig.json` file in `src/config/` with your Firebase project credentials:

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

### 3. Run the Application

```bash
bun dev
```

The application will be available at `http://localhost:5173`.

## 🛠 Key Dependencies

- **React.js**: A JavaScript library for building user interfaces.
- **BlockNote**: A block-based rich text editor for a seamless writing experience.
- **Yjs & Y-Sweet**: For enabling real-time collaboration and data synchronization between users.
- **Tailwind CSS**: A utility-first CSS framework for creating a modern and responsive design.
- **Firebase**: For handling user authentication and managing user data.
- **React Router**: For client-side routing and navigation.
