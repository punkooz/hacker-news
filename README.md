# Hacker News Clone
[GitHub Repository](https://github.com/punkooz/didactic-sniffle)

A full-stack Hacker News clone built with Node.js, React, and PostgreSQL. Features user authentication, threaded comments, voting, search, and sorting.

## 🚀 Quick Start (Docker - Recommended)

The easiest way to run the entire application:

```bash
# Start all services (database, backend, frontend)
docker-compose up -d

# Access the application
open http://localhost:5173
```

That's it! The application will be running with:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Database**: PostgreSQL on port 5432

### Stopping the Application
```bash
docker-compose down
```

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, Knex.js, PostgreSQL
- **Frontend**: React (Vite), Tailwind CSS, React Router
- **Testing**: Jest (Backend), Playwright (E2E)
- **DevOps**: Docker, Docker Compose

---

## 📋 Features

### Core Features
- ✅ **User Authentication** - Sign up, log in, secure password hashing (bcrypt)
- ✅ **Post Feed** - Paginated list with title, URL/text, author, points, comments
- ✅ **Voting** - Upvote and downvote posts
- ✅ **Submission** - Create URL or text-based posts
- ✅ **Threaded Comments** - Nested comment discussions with edit and delete
- ✅ **Sorting** - Sort by "new", "top", and "best" (time-decay algorithm)
- ✅ **Search** - Search posts by title or content

### Bonus Features
- ✅ **Dockerization** - Full stack runs in containers
- ✅ **Mobile Responsive** - Tailwind CSS responsive design
- ✅ **Rate Limiting** - API protection (100 req/15min per IP)
- ✅ **CI/CD** - GitHub Actions pipeline for automated testing and builds

---

## 🔧 Local Development Setup

If you prefer to run services individually:

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- npm or yarn

### 1. Database Setup
```bash
# Option A: Use Docker for database only
docker-compose up -d db

# Option B: Use local PostgreSQL
# Create database: hackernews
# User: postgres, Password: password
```

### 2. Backend Setup
```bash
cd apps/backend
npm install

# Run migrations
npm run migrate

# Start development server
npm run dev
```

Backend will be available at `http://localhost:3000`

### 3. Frontend Setup
```bash
cd apps/frontend
npm install

# Start development server
npm run dev
```

Frontend will be available at `http://localhost:5173`

---

## 🌍 Environment Variables

### Backend (`apps/backend/.env`)
```env
# Database connection (Docker uses service name 'db')
DB_HOST=localhost
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=hackernews

# Server
PORT=3000
NODE_ENV=development
```

### Frontend (`apps/frontend/.env`)
```env
# API endpoint
VITE_API_URL=http://localhost:3000
```

**Note**: When using Docker, these are automatically configured in `docker-compose.yml`.

---

## 🧪 Testing

### Backend Tests
```bash
cd apps/backend
npm test
```

### Frontend E2E Tests
```bash
cd apps/frontend
npm run test:e2e
```

---

## 📖 Documentation

- **[API Documentation](API.md)** - Complete REST API reference
- **[Known Bugs](docs/KNOWN_BUGS.md)** - Common issues and fixes
- **[Docker Guide](docs/DOCKER_LEARNING.md)** - Understanding Docker concepts

---

## 🎯 How to Use

1. **Sign Up**: Navigate to `/signup` to create an account
2. **Submit Posts**: Click "submit" in the navbar to share links or text
3. **Vote**: Click ▲ to upvote or ▼ to downvote posts
4. **Comment**: Click on a post title to view and add threaded comments
5. **Manage Comments**: Edit or delete your own comments using the buttons below each comment
6. **Sort & Search**: Use tabs (New/Best/Top) and search bar to filter posts

---

## 🤖 AI Tools Used

This project was built with assistance from **Antigravity** (powered by Claude 4.5 Sonnet by Anthropic).

### How AI Assisted Development:

1. **Architecture Design**
   - Designed database schema with proper relationships
   - Structured the monorepo with separate backend/frontend apps
   - Planned RESTful API endpoints

2. **Code Generation**
   - Generated boilerplate for Express routes and React components
   - Created Knex migrations and seed files
   - Implemented authentication with JWT and bcrypt

3. **Dockerization**
   - Created Dockerfiles for backend and frontend
   - Configured docker-compose.yml with health checks and dependencies
   - Set up environment variable management

4. **Debugging**
   - Diagnosed and fixed URL parsing crash in React components
   - Resolved port conflicts and Docker networking issues
   - Fixed blank screen bugs with proper error handling

5. **Documentation**
   - Generated comprehensive API documentation
   - Created troubleshooting guides (KNOWN_BUGS.md)
   - Wrote Docker learning materials

**AI Usage Philosophy**: AI was used as a pair programming partner to accelerate development while maintaining code quality and understanding. All code was reviewed and tested to ensure correctness.

---

## 📁 Project Structure

```
.
├── apps/
│   ├── backend/          # Node.js API server
│   │   ├── src/
│   │   │   ├── api/      # Route handlers
│   │   │   ├── config/   # Database config
│   │   │   ├── db/       # Migrations & seeds
│   │   │   └── middleware/
│   │   └── Dockerfile
│   └── frontend/         # React application
│       ├── src/
│       │   ├── components/
│       │   ├── context/
│       │   └── pages/
│       └── Dockerfile
├── docs/                 # Documentation
├── docker-compose.yml    # Docker orchestration
├── API.md               # API documentation
└── README.md            # This file
```

---

## 🐛 Troubleshooting

If you encounter issues, check the [Known Bugs](docs/KNOWN_BUGS.md) document first. Common issues:

- **Blank screen**: Usually a URL parsing error or backend connection issue
- **Port conflicts**: Kill processes on ports 3000, 5173, or 5432
- **Docker issues**: Run `docker-compose down && docker-compose up --build -d`

---

## 📝 License

This project was created as an interview assignment.

---

## 🙏 Acknowledgments

Built as part of the SPC interview process. Special thanks to the Antigravity AI coding assistant for accelerating development.
