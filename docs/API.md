# API Documentation

## Auth
- `POST /auth/signup`
    - Body: `{ username, password }`
    - Response: `{ token, user: { id, username } }`
- `POST /auth/login`
    - Body: `{ username, password }`
    - Response: `{ token, user: { id, username } }`
- `POST /auth/logout` (Client-side token removal mainly, strictly speaking just 200 OK)

## Posts
- `GET /posts`
    - Params: `page`, `sort` ('new', 'top'), `q` (search query)
    - Response: `{ posts: [Post], page, totalPages }`
- `POST /posts`
    - Auth Required
    - Body: `{ title, url?, text? }` (One of url or text required)
    - Response: `{ id, ...post }`
- `GET /posts/:id`
    - Response: `{ ...post, comments: [CommentTree] }`
- `POST /posts/:id/vote`
    - Auth Required
    - Body: `{ value: 1 | -1 | 0 }` (0 to remove vote)
    - Response: `{ points }`

## Comments
- `POST /posts/:id/comments`
    - Auth Required
    - Body: `{ content, parent_id? }` (parent_id for nested replies)
    - Response: `{ id, content, author_id, post_id, parent_id, points, created_at, updated_at, author }`
- `GET /posts/:id/comments`
    - Response: `[CommentTree]`

## Models
### Post
```json
{
  "id": 1,
  "title": "Hello World",
  "url": "https://...",
  "text": null,
  "author": "username",
  "points": 10,
  "comments_count": 5,
  "created_at": "ISOString"
}
```

### Comment
```json
{
  "id": 1,
  "author_id": 2,
  "author": "username",
  "post_id": 1,
  "parent_id": null,
  "content": "Great post!",
  "points": 0,
  "replies": [],
  "created_at": "ISOString"
}
```
