# DocSpace - Setup Guide

This guide will walk you through setting up the DocSpace application for local development, covering both the backend and frontend services.

## 1. Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **Bun** (latest version)
- **Git**

## 2. Clone the Repository

```bash
git clone <repository-url>
cd DocSpace
```

## 3. Backend Setup (Express.js)

### 3.1. Install Dependencies

Navigate to the backend directory and install the required packages.

```bash
cd backend
bun install
```

### 3.2. Configure Firebase Admin

The backend uses the Firebase Admin SDK and requires a service account key.

1.  In your Firebase project, go to **Project Settings > Service accounts**.
2.  Click **Generate new private key** to download a service account JSON file.
3.  Place the downloaded file in the `backend/config/` directory and rename it to `serviceAccount.json`.

> **Security Note:** This file is gitignored for security. **Never commit it to version control.**

### 3.3. Configure Environment Variables (Optional)

The backend uses a `.env` file for environment variables.

1.  Create a `.env` file in the `backend/` directory.
2.  You can specify the server port (it defaults to 5000 if not set):

    ```env
    # backend/.env
    PORT=5000
    ```

### 3.4. Run the Server

From the `backend/` directory, start the server:

```bash
bun start
```

The backend API will be available at `http://localhost:5000`.

### 3.5. Run Backend Tests

To run the backend tests (using Jest and Supertest), run the following command from the `backend/` directory:

```bash
bun test
```

## 4. Frontend Setup (React)

### 4.1. Install Dependencies

Navigate to the frontend directory and install the required packages.

```bash
cd ../frontend
bun install
```

### 4.2. Configure Firebase

The frontend requires your Firebase project's configuration.

1.  In your Firebase project, go to **Project Settings > General**.
2.  Under "Your apps," click the web icon (`</>`) to find your web app's configuration.
3.  Create a file named `firebaseConfig.json` in `frontend/src/config/`.
4.  Paste the `firebaseConfig` object into the file:

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

### 4.3. Configure AI API Key (Groq)

The editor uses AI features powered by Groq.

1.  Create a file named `getEnv.js` in `frontend/src/pages/`.
2.  Add the following code, replacing the placeholder with your own API key:

    ```javascript
    // frontend/src/pages/getEnv.js
    export function getEnv(key) {
      const env = {
        GROQ_API_KEY: "your_groq_api_key_here", // Replace with your Groq API key
      };
      return env[key];
    }
    ```

> **Note:** You can get a free API key from the [Groq Console](https://console.groq.com/). If no key is provided, AI features will be disabled.

### 4.4. Run the Application

From the `frontend/` directory, start the development server:

```bash
bun dev
```

The frontend will be available at `http://localhost:5173`.

## 5. Firestore Security Rules

For production, it's critical to secure your Firestore database. Here are some basic rules to get you started:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /docs/{docId} {
      allow read, write: if request.auth != null && request.auth.uid in resource.data.members;
      allow create: if request.auth != null;
    }
  }
}
```

These rules ensure only authenticated users can create documents and only members can read or write to them.