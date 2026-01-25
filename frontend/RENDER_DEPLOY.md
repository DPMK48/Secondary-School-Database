# SchoolHub Frontend - Render Deployment Configuration

## Static Site Configuration

### Build Settings:
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`

### Environment Variables:
- `VITE_API_URL`: Your backend API URL (e.g., https://schoolhub-api.onrender.com/api)

### Rewrite Rules:
Add this rewrite rule for SPA routing:
- Source: `/*`
- Destination: `/index.html`

### Headers (Optional but Recommended):
```
# Cache static assets aggressively
/*
  Cache-Control: public, max-age=31536000, immutable

# Don't cache HTML for fresh updates
/index.html
  Cache-Control: no-cache, no-store, must-revalidate

# Don't cache service worker
/sw.js
  Cache-Control: no-cache
```

## PWA Support

The app is configured as a Progressive Web App with:
- Offline support via service worker
- App manifest for installation
- Caching strategies for fonts and API responses
