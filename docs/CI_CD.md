# CI/CD Pipeline

This project uses GitHub Actions for continuous integration and deployment.

## Pipeline Overview

The CI/CD pipeline runs on every push and pull request to `main`/`master` branches.

### Jobs

#### 1. Backend Tests (`backend-test`)
- Spins up PostgreSQL test database
- Installs backend dependencies
- Runs backend test suite
- **Blocks deployment if tests fail**

#### 2. Frontend Build (`frontend-build`)
- Installs frontend dependencies
- Builds production bundle with Vite
- Uploads build artifacts
- **Blocks deployment if build fails**

#### 3. Docker Build (`docker-build`)
- Only runs on push (not PRs)
- Requires backend tests and frontend build to pass
- Builds Docker images for backend and frontend
- Uses GitHub Actions cache for faster builds
- **Ready for deployment to container registry**

#### 4. Lint (`lint`)
- Runs code quality checks
- Can be extended with ESLint, Prettier, etc.

## Workflow Triggers

```yaml
on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
```

## Environment Variables

The pipeline uses these environment variables:

### Backend Tests
- `POSTGRES_USER`: postgres
- `POSTGRES_PASSWORD`: password
- `POSTGRES_DB`: hackernews_test
- `DB_HOST`: localhost

### Frontend Build
- `VITE_API_URL`: http://localhost:3000

## Extending the Pipeline

### Add Docker Registry Push

To push images to Docker Hub or GitHub Container Registry:

```yaml
- name: Login to Docker Hub
  uses: docker/login-action@v2
  with:
    username: ${{ secrets.DOCKER_USERNAME }}
    password: ${{ secrets.DOCKER_PASSWORD }}

- name: Build and push backend
  uses: docker/build-push-action@v4
  with:
    context: ./apps/backend
    push: true
    tags: yourusername/hackernews-backend:latest
```

### Add Deployment Step

```yaml
deploy:
  runs-on: ubuntu-latest
  needs: [docker-build]
  if: github.ref == 'refs/heads/main'
  
  steps:
    - name: Deploy to production
      run: |
        # SSH to server and pull latest images
        # Or use cloud provider CLI (AWS, GCP, Azure)
```

### Add E2E Tests

```yaml
e2e-tests:
  runs-on: ubuntu-latest
  needs: [backend-test, frontend-build]
  
  steps:
    - name: Run Playwright tests
      working-directory: apps/frontend
      run: npm run test:e2e
```

## Status Badge

Add this to your README.md:

```markdown
![CI/CD](https://github.com/yourusername/hackernews-clone/workflows/CI%2FCD%20Pipeline/badge.svg)
```

## Local Testing

Test the workflow locally using [act](https://github.com/nektos/act):

```bash
# Install act
brew install act  # macOS
# or
choco install act  # Windows

# Run workflow
act push
```

## Troubleshooting

### Tests Failing
- Check PostgreSQL connection in backend tests
- Verify environment variables are set correctly

### Build Failing
- Ensure all dependencies are in package.json
- Check for TypeScript/ESLint errors

### Docker Build Failing
- Verify Dockerfile syntax
- Check that all required files are copied
- Ensure nginx.conf exists for frontend
