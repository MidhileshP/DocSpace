# DocSpace - Backend

This directory contains the backend for the DocSpace application, an Express.js server that provides a RESTful API for managing documents, users, and real-time collaboration.

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Bun (latest version)
- A Firebase project

### 1. Install Dependencies

```bash
bun install
```

### 2. Run the Server

```bash
bun start
```

The server will start on port 5000 by default.

## 🧪 Running Tests

To run the tests for the backend, use the following command:

```bash
bun test
```

This will run Jest and execute all the test files in the `tests` directory.

## 📝 API Endpoints

The backend exposes a RESTful API for managing documents and users. The base URL for the API is `/api`.

| Method | Endpoint                    | Description                                  |
|--------|-----------------------------|----------------------------------------------|
| GET    | `/docs`                     | Get all documents for the authenticated user |
| POST   | `/docs`                     | Create a new document                        |
| GET    | `/docs/:id`                 | Get a single document by ID                  |
| PUT    | `/docs/:id`                 | Update a document by ID                      |
| DELETE | `/docs/:id`                 | Delete a document by ID                      |
| GET    | `/docs/:id/permissions`     | Get the permissions for a document           |
| POST   | `/docs/:id/share`           | Share a document with another user           |
| POST   | `/docs/:id/remove_access`   | Remove a user's access to a document       |
| POST   | `/docs/users/details`       | Get details for a list of users              |

For more detailed information about the API, see the [OpenAPI specification](/docs/openapi.yaml).

## 🛠 Key Dependencies

- **Express.js**: A fast, unopinionated, minimalist web framework for Node.js.
- **Firebase Admin SDK**: For interacting with Firebase services from the server.
- **Jest & Supertest**: For running tests and making HTTP requests in tests.
- **Swagger UI Express**: for serving the OpenAPI documentation.
