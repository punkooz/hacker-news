# Known Bugs and Fixes

This document tracks bugs encountered in the Hacker News clone application and their solutions. **Check this document first before debugging from scratch.**

## Bug #1: Blank Screen / UI Crash - URL Parsing Error

### Symptoms
- Frontend loads but shows completely blank/white screen
- React error in console: "An error occurred in the `<NewsList>` component"
- Browser console shows successful API fetch but no UI renders

### Root Cause
The `NewsList.jsx` component crashes when trying to parse invalid URLs using `new URL(post.url).hostname` without error handling. If any post in the database has a malformed URL, the entire component crashes.

### Location
`apps/frontend/src/pages/NewsList.jsx` - Line ~114

### Fix
Wrap URL parsing in try-catch:
```javascript
{post.url && (() => {
    try {
        return <span className="text-xs text-gray-400">({new URL(post.url).hostname})</span>;
    } catch {
        return null;
    }
})()}
```

### Prevention
Always wrap `new URL()` calls in try-catch when dealing with user-generated content.

---

## Bug #2: Backend Container Fails to Start - Port Conflict

### Symptoms
- `docker-compose up` shows backend container exiting with code 1
- Backend logs show "Address already in use" or similar
- Frontend can't connect to API

### Root Cause
Port 3000 is occupied by another process (often a stray Node.js process from manual testing).

### Diagnosis
```powershell
netstat -ano | findstr :3000
tasklist /fi "pid eq <PID>"
```

### Fix
Kill the conflicting process:
```powershell
taskkill /F /PID <PID>
docker-compose restart backend
```

### Prevention
Always use `docker-compose down` to stop services cleanly. Avoid running backend manually while Docker is active.

---

## Bug #3: Environment Variables Not Working in Vite

### Symptoms
- `import.meta.env.VITE_API_URL` is `undefined`
- Frontend tries to fetch from wrong URL or crashes

### Root Cause
Vite requires environment variables to be:
1. Prefixed with `VITE_`
2. Defined in `.env` file OR passed at build/dev time
3. Container needs restart after `.env` changes

### Fix
1. Create `apps/frontend/.env`:
   ```
   VITE_API_URL=http://localhost:3000
   ```
2. Restart frontend container:
   ```
   docker-compose restart frontend
   ```

### Prevention
Always prefix client-side env vars with `VITE_` and restart containers after changes.

---

## Bug #4: Database Connection Fails in Docker

### Symptoms
- Backend crashes on startup
- Logs show "ECONNREFUSED" or "Connection timeout" to database

### Root Cause
Backend tries to connect to `localhost` instead of the Docker service name `db`.

### Fix
Update `knexfile.js` to use environment variable:
```javascript
host: process.env.DB_HOST || 'localhost',
```

Set in `docker-compose.yml`:
```yaml
backend:
  environment:
    - DB_HOST=db
```

### Prevention
Always use service names (not `localhost`) for inter-container communication in Docker.

---

## Debugging Checklist

When encountering issues, check in this order:

1. **Are all containers running?**
   ```
   docker-compose ps
   ```

2. **Check container logs:**
   ```
   docker-compose logs backend
   docker-compose logs frontend
   docker-compose logs db
   ```

3. **Port conflicts?**
   ```
   netstat -ano | findstr :3000
   netstat -ano | findstr :5173
   netstat -ano | findstr :5432
   ```

4. **Environment variables set?**
   ```
   docker exec hackernews-backend-1 env
   docker exec hackernews-frontend-1 env
   ```

5. **Database healthy?**
   ```
   docker exec hackernews-backend-1 wget -qO- http://localhost:3000/health
   ```

6. **Browser console errors?**
   Open DevTools → Console and Network tabs

---

## Quick Fixes

### Nuclear Option (Reset Everything)
```powershell
docker-compose down
docker-compose up --build -d
```

### Just Restart Services
```powershell
docker-compose restart
```

### View Real-time Logs
```powershell
docker-compose logs -f
```
