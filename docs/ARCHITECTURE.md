# Architecture

## High Level Design
```mermaid
graph TD
    User[User Client] -->|HTTP/REST| LB[Load Balancer / Nginx (Optional)]
    LB -->|HTTP| API[Backend API (Node.js/Express)]
    API -->|SQL| DB[(PostgreSQL)]
    
    subgraph "Apps"
        Frontend[React Frontend]
        Backend[Express Backend]
    end
    
    Frontend -->|Requests| Backend
    Backend -->|Queries| DB
```

## Low Level Design (ERD)
```mermaid
erDiagram
    USERS {
        int id PK
        string username
        string password_hash
        timestamp created_at
    }
    POSTS {
        int id PK
        int author_id FK
        string title
        string url
        text text
        int points
        int comments_count
        timestamp created_at
    }
    COMMENTS {
        int id PK
        int post_id FK
        int author_id FK
        int parent_id FK
        text content
        int points
        timestamp created_at
    }
    VOTES {
        int id PK
        int user_id FK
        int post_id FK
        int value "1 or -1"
    }

    USERS ||--o{ POSTS : "creates"
    USERS ||--o{ COMMENTS : "writes"
    USERS ||--o{ VOTES : "casts"
    POSTS ||--o{ COMMENTS : "has"
    POSTS ||--o{ VOTES : "receives"
    COMMENTS ||--o{ COMMENTS : "parent of"
```

## Key Flows
1. **Login**: POST /auth/login -> Returns JWT. Frontend stores in Context/LocalStorage.
2. **Create Post**: POST /posts (Auth required).
3. **Add Comment**: POST /posts/:id/comments (Auth required). Recursive structure.

## Directory Structure
- `apps/backend`:
  - `src/api`: Routes and Controllers.
  - `src/core`: Business logic / Services.
  - `src/db`: Knex migrations/seeds over Models.
- `apps/frontend`:
  - `src/components`: Reusable UI.
  - `src/pages`: Route pages.
  - `src/context`: Global state (Auth).
