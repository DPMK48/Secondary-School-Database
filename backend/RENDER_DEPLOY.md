# SchoolHub Backend - Render Deployment Configuration

## Environment Variables Required

Create these environment variables in your Render backend service:

### Required Variables:
- `NODE_ENV`: production
- `PORT`: 3000
- `DATABASE_URL`: Your PostgreSQL connection string (from Render database or external)
- `JWT_SECRET`: A secure random string for JWT signing
- `JWT_EXPIRES_IN`: 7d (or your preferred expiration)
- `CORS_ORIGIN`: Your frontend URL (e.g., https://schoolhub.onrender.com)

### Optional Variables:
- `BCRYPT_SALT_ROUNDS`: 10 (default)

## Build & Start Commands

- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start:prod`

## Health Check

Set health check path to: `/api/health`
