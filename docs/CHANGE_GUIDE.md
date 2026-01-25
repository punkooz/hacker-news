# Change Guide

## How to add a new Feature
1. **Database**: Create migration in `apps/backend/src/db/migrations`.
2. **Backend**: Add route in `src/api` and logic.
3. **Frontend**: Add component in `src/components` or page in `src/pages`.
4. **Test**: Add integration test in `apps/backend/tests`.

## Running Tests
- Backend: `npm test`
- Frontend: `npm test`

## Auth
- User logic in `apps/backend/src/services/auth.js`.
- Frontend context in `apps/frontend/src/context/AuthContext.jsx`.

## Posts
- API: `apps/backend/src/api/posts.js`
- Frontend: `apps/frontend/src/pages/NewsList.jsx` and `Submit.jsx`
