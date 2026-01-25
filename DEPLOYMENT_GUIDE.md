# 🚀 SchoolHub Deployment Guide

## Supabase PostgreSQL + Render Deployment

This guide walks you through deploying SchoolHub on Render.com with Supabase PostgreSQL.

## Prerequisites

- A [Render](https://render.com) account
- A [Supabase](https://supabase.com) account
- Git repository with your code (GitHub, GitLab, or Bitbucket)

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Render.com    │  │   Render.com    │  │   Supabase      │ │
│  │   Static Site   │──│   Web Service   │──│   PostgreSQL    │ │
│  │   (Frontend)    │  │   (Backend)     │  │   Database      │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Step 1: Set Up Supabase Database

### 1.1 Create a Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click **New Project**
3. Fill in:
   - **Name**: `schoolhub`
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your users
4. Click **Create new project**
5. Wait for the project to be provisioned (1-2 minutes)

### 1.2 Get Database Connection String

1. Go to **Project Settings** → **Database**
2. Scroll to **Connection string** section
3. Select **URI** tab
4. Copy the connection string. It looks like:
   ```
   postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```
5. **Important**: Replace `[YOUR-PASSWORD]` with your actual database password

### 1.3 Configure Connection Pooling (Recommended)

For production, use the **Transaction pooler** (port 6543) connection string:
- Better for serverless/cloud deployments
- Handles connection limits automatically

---

## Step 2: Deploy to Render

### Method A: Manual Deployment (Recommended for first time)

#### 2.1 Deploy Backend API

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New** → **Web Service**
3. Connect your GitHub/GitLab repository
4. Configure the service:

| Setting | Value |
|---------|-------|
| **Name** | `schoolhub-api` |
| **Region** | Oregon (or closest to Supabase) |
| **Root Directory** | `instructions/backend` |
| **Runtime** | Node |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm run start:prod` |
| **Plan** | Free (or Starter for production) |

5. Add **Environment Variables**:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `DATABASE_URL` | `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres` |
| `JWT_SECRET` | (generate a random 32+ character string) |
| `JWT_REFRESH_SECRET` | (generate another random string) |
| `JWT_EXPIRATION` | `1h` |
| `JWT_REFRESH_EXPIRATION` | `7d` |
| `CORS_ORIGINS` | `https://schoolhub.onrender.com` (update after frontend deploy) |

6. Click **Create Web Service**
7. Wait for deployment (5-10 minutes first time)
8. Copy your backend URL: `https://schoolhub-api.onrender.com`

#### 2.2 Deploy Frontend

1. Go to Render Dashboard → **New** → **Static Site**
2. Connect the same repository
3. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `schoolhub` |
| **Root Directory** | `instructions/frontend` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

4. Add **Environment Variables**:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://schoolhub-api.onrender.com/api` |

5. Add **Redirect/Rewrite Rule** (for SPA routing):
   - Source: `/*`
   - Destination: `/index.html`
   - Action: **Rewrite**

6. Click **Create Static Site**
7. Wait for deployment

#### 2.3 Update CORS Origins

After frontend deploys:
1. Go to your backend service in Render
2. Update `CORS_ORIGINS` to include your actual frontend URL:
   ```
   https://schoolhub.onrender.com
   ```

---

### Method B: Blueprint Deployment

1. Push the `render.yaml` file to your repository root
2. Go to Render Dashboard → **New** → **Blueprint**
3. Connect your repository
4. Render will detect `render.yaml` and create services
5. **Manually set** these environment variables after creation:
   - Backend: `DATABASE_URL` (from Supabase)
   - Backend: `CORS_ORIGINS` (your frontend URL)
   - Frontend: `VITE_API_URL` (your backend URL + `/api`)

---

## Step 3: Verify Deployment

### 3.1 Check Health Endpoint

```bash
curl https://schoolhub-api.onrender.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-01-25T00:00:00.000Z",
  "uptime": 123.456,
  "environment": "production"
}
```

### 3.2 Check Frontend

Visit your frontend URL (e.g., `https://schoolhub.onrender.com`)

### 3.3 Verify Database Connection

Check Render logs for your backend service:
- No database connection errors
- "Nest application successfully started" message

---

## Step 4: Initial Setup

### 4.1 Database Schema Sync

For the first deployment, the database tables need to be created. Options:

**Option A: Temporary sync (Quick setup)**
1. In Render, temporarily set `NODE_ENV=development`
2. Trigger a redeploy
3. Tables will be created via TypeORM synchronize
4. Set `NODE_ENV=production` again

**Option B: Run migrations (Recommended)**
Use Render's Shell feature or connect locally:
```bash
npm run migration:run
```

### 4.2 Create Admin User

Run the seed script to create initial data:
```bash
npm run seed
```

Or create an admin user manually through Supabase SQL Editor.

---

## Troubleshooting

### Common Issues

**1. "Connection refused" or database errors**
- Verify DATABASE_URL is correct
- Check if password contains special characters (URL-encode them)
- Use the Transaction pooler URL (port 6543), not Direct connection

**2. CORS errors**
- Ensure CORS_ORIGINS exactly matches your frontend URL
- Include the protocol (`https://`)
- No trailing slash

**3. Frontend shows blank page**
- Check browser console for errors
- Verify VITE_API_URL is set correctly
- Ensure the rewrite rule is configured

**4. "Service Unavailable" on free tier**
- Free tier services sleep after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds to wake up
- Consider Starter tier ($7/month) for always-on

**5. Build failures**
- Check Render build logs
- Ensure all dependencies are in package.json
- Verify Node.js version compatibility

### Viewing Logs

1. Go to your service in Render Dashboard
2. Click **Logs** tab
3. Use the filter to search for errors

---

## Environment Variables Reference

### Backend

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | `production` |
| `PORT` | Yes | `3000` |
| `DATABASE_URL` | Yes | Supabase connection string |
| `JWT_SECRET` | Yes | Secret for JWT signing |
| `JWT_REFRESH_SECRET` | Yes | Secret for refresh tokens |
| `JWT_EXPIRATION` | No | Token expiry (default: `1h`) |
| `JWT_REFRESH_EXPIRATION` | No | Refresh token expiry (default: `7d`) |
| `CORS_ORIGINS` | Yes | Comma-separated allowed origins |

### Frontend

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Full API URL (e.g., `https://api.example.com/api`) |

---

## Cost Estimate

| Service | Free Tier | Starter Tier |
|---------|-----------|--------------|
| **Render Static Site** | ✅ Free | Free |
| **Render Web Service** | ✅ Free (sleeps after 15min) | $7/month |
| **Supabase Database** | ✅ Free (500MB, pauses after 1 week inactive) | $25/month |

**Recommended for Production**: Render Starter + Supabase Pro = ~$32/month

---

## Security Checklist

- [ ] Generate strong, unique JWT secrets (32+ characters)
- [ ] Set `NODE_ENV=production`
- [ ] HTTPS enabled (automatic on Render)
- [ ] Proper CORS origins configured
- [ ] Database synchronize disabled in production
- [ ] Supabase Row Level Security enabled (optional)

---

## Next Steps

1. **Custom Domain**: Add your own domain in Render settings
2. **Monitoring**: Set up uptime monitoring (e.g., UptimeRobot)
3. **Backups**: Enable Supabase daily backups (Pro tier)
4. **CI/CD**: Render auto-deploys on push to main branch
