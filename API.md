# API Documentation

Base URL: `http://localhost:3000`

## Authentication Endpoints

### Sign Up
```
POST /auth/signup
```

**Request Body:**
```json
{
  "username": "string (required)",
  "password": "string (required)"
}
```

**Response (201):**
```json
{
  "token": "string (JWT)",
  "user": {
    "id": "integer",
    "username": "string"
  }
}
```

**Error (400):**
```json
{
  "error": "Username already exists"
}
```

---

### Log In
```
POST /auth/login
```

**Request Body:**
```json
{
  "username": "string (required)",
  "password": "string (required)"
}
```

**Response (200):**
```json
{
  "token": "string (JWT)",
  "user": {
    "id": "integer",
    "username": "string"
  }
}
```

**Error (401):**
```json
{
  "error": "Invalid credentials"
}
```

---

## Post Endpoints

### Get Posts (Feed)
```
GET /posts
```

**Query Parameters:**
- `page`: integer (optional, default: 1)
- `sort`: string (optional, options: 'new', 'top', default: 'new')
- `q`: string (optional, search query)

**Response (200):**
```json
{
  "posts": [
    {
      "id": "integer",
      "title": "string",
      "url": "string | null",
      "text": "string | null",
      "author": "string (username)",
      "author_id": "integer",
      "points": "integer",
      "comments_count": "integer",
      "created_at": "timestamp"
    }
  ],
  "page": "integer",
  "totalPages": "integer"
}
```

---

### Create Post
```
POST /posts
```

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "title": "string (required)",
  "url": "string (optional)",
  "text": "string (optional)"
}
```

**Note:** Either `url` or `text` must be provided.

**Response (201):**
```json
{
  "id": "integer",
  "title": "string",
  "url": "string | null",
  "text": "string | null",
  "author_id": "integer",
  "points": "integer (default: 0)",
  "comments_count": "integer (default: 0)",
  "created_at": "timestamp"
}
```

**Error (400):**
```json
{
  "error": "Title required"
}
```

---

### Get Post Details
```
GET /posts/:id
```

**Response (200):**
```json
{
  "id": "integer",
  "title": "string",
  "url": "string | null",
  "text": "string | null",
  "author": "string (username)",
  "author_id": "integer",
  "points": "integer",
  "comments_count": "integer",
  "created_at": "timestamp"
}
```

**Error (404):**
```json
{
  "error": "Not found"
}
```

---

### Vote on Post
```
POST /posts/:id/vote
```

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "value": "integer (1 for upvote, -1 for downvote, 0 to remove vote)"
}
```

**Response (200):**
```json
{
  "points": "integer (updated points)"
}
```

**Error (400):**
```json
{
  "error": "Invalid vote value"
}
```

---

## Comment Endpoints

### Get Comments for Post
```
GET /posts/:id/comments
```

**Response (200):**
```json
[
  {
    "id": "integer",
    "content": "string",
    "author": "string (username)",
    "author_id": "integer",
    "post_id": "integer",
    "parent_id": "integer | null",
    "created_at": "timestamp",
    "replies": [
      {
        "id": "integer",
        "content": "string",
        "author": "string",
        "author_id": "integer",
        "post_id": "integer",
        "parent_id": "integer",
        "created_at": "timestamp",
        "replies": []
      }
    ]
  }
]
```

**Note:** Comments are returned as a nested tree structure with `replies` array.

---

### Add Comment
```
POST /posts/:id/comments
```

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "content": "string (required)",
  "parent_id": "integer (optional, for threaded replies)"
}
```

**Response (201):**
```json
{
  "id": "integer",
  "content": "string",
  "author": "string (username)",
  "author_id": "integer",
  "post_id": "integer",
  "parent_id": "integer | null",
  "created_at": "timestamp"
}
```

**Error (400):**
```json
{
  "error": "Content required"
}
```

---

### Edit Comment
```
PUT /posts/:postId/comments/:commentId
```

**Authentication:** Required (Bearer token)

**Authorization:** Only the comment author can edit their comment.

**Request Body:**
```json
{
  "content": "string (required)"
}
```

**Response (200):**
```json
{
  "id": "integer",
  "content": "string (updated)",
  "author_id": "integer",
  "post_id": "integer",
  "parent_id": "integer | null",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

**Error (403):**
```json
{
  "error": "Unauthorized"
}
```

**Error (404):**
```json
{
  "error": "Comment not found"
}
```

---

### Delete Comment
```
DELETE /posts/:postId/comments/:commentId
```

**Authentication:** Required (Bearer token)

**Authorization:** Only the comment author can delete their comment.

**Response (200):**
```json
{
  "message": "Comment deleted"
}
```

**Error (403):**
```json
{
  "error": "Unauthorized"
}
```

**Error (404):**
```json
{
  "error": "Comment not found"
}
```

---

## Health Check

### Server Health
```
GET /health
```

**Response (200):**
```json
{
  "status": "ok",
  "db": "connected"
}
```

**Error (500):**
```json
{
  "status": "error",
  "db": "disconnected",
  "error": "error message"
}
```

---

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

Tokens are obtained from `/auth/signup` or `/auth/login` endpoints.

---

## Error Responses

All endpoints may return the following error:

**500 Internal Server Error:**
```json
{
  "error": "server error"
}
```

Detailed error messages are logged server-side for debugging.

---

## Rate Limiting

All API endpoints are protected by rate limiting to prevent abuse:

- **Limit**: 100 requests per 15 minutes per IP address
- **Headers**: Rate limit information is returned in `RateLimit-*` headers
- **Error Response (429):**
  ```json
  {
    "error": "Too many requests, please try again later."
  }
  ```

