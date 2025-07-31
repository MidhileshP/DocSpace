# DocSpace - API Documentation

This document provides detailed information about the backend API for the DocSpace application. For a more interactive experience, you can also use the [Swagger UI documentation](/api-docs).

## Authentication

All API endpoints require a valid Firebase JWT to be included in the `Authorization` header.

**Header Format:**

```
Authorization: Bearer <your_firebase_jwt>
```

## API Endpoints

### Documents

#### `GET /api/docs`

-   **Description**: Retrieves all documents that the authenticated user is a member of.
-   **Response**: `200 OK` - An array of document objects.

#### `POST /api/docs`

-   **Description**: Creates a new document.
-   **Request Body**: `{ "title": "string" }`
-   **Response**: `201 Created` - The newly created document object.

#### `GET /api/docs/:id`

-   **Description**: Retrieves a single document by its ID.
-   **Response**: `200 OK` - The requested document object.

#### `PUT /api/docs/:id`

-   **Description**: Updates a document's title or content.
-   **Request Body**: `{ "title": "string", "content": "object" }`
-   **Response**: `200 OK` - A success message.

#### `DELETE /api/docs/:id`

-   **Description**: Deletes a document. (Admin only)
-   **Response**: `200 OK` - A success message.

### Sharing and Permissions

#### `GET /api/docs/:id/permissions`

-   **Description**: Retrieves the users and their roles for a specific document.
-   **Response**: `200 OK` - An object containing the owner and a list of permissions.

#### `POST /api/docs/:id/share`

-   **Description**: Shares a document with another user.
-   **Request Body**: `{ "email": "string", "role": "string" }`
-   **Response**: `200 OK` - A success message.

#### `POST /api/docs/:id/remove_access`

-   **Description**: Removes a user's access to a document.
-   **Request Body**: `{ "userIdToRemove": "string" }`
-   **Response**: `200 OK` - A success message.

### Users

#### `POST /api/docs/users/details`

-   **Description**: Retrieves public details for a list of user IDs.
-   **Request Body**: `{ "userIds": ["string"] }`
-   **Response**: `200 OK` - An array of user detail objects.

## Error Handling

The API uses standard HTTP status codes to indicate the success or failure of a request. In case of an error, the response body will contain a JSON object with an `error` key.

-   **`400 Bad Request`**: The request was malformed or invalid.
-   **`401 Unauthorized`**: The request is missing a valid authentication token.
-   **`403 Forbidden`**: The user does not have permission to perform the requested action.
-   **`404 Not Found`**: The requested resource was not found.
-   **`500 Internal Server Error`**: An unexpected error occurred on the server.
