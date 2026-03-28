# Deployment Notes

## Deployment Model

Crimson Engine is a **static SPA**. The production build outputs a folder of HTML, JS, CSS, and assets that can be served by any static host.

There is **no backend server, no database, and no authentication service** to deploy. All state is stored in the user's browser `localStorage`.

---

## Build Process

### 1. Type-check & bundle

```bash
npm run build
```

This runs `tsc && vite build`. Output is placed in `dist/`.

Expected output structure:
```
dist/
  index.html
  assets/
    index-[hash].js
    index-[hash].css
    [images and icons]
```

### 2. Preview production bundle locally

```bash
npm run preview
```

Serves the `dist/` folder at `http://localhost:4173`. Use this to verify the build before deploying.

---

## Deployment Targets

> **No hosting provider has been chosen yet.** The options below are ready-to-use recipes when a host is selected.

1. Connect the GitHub repo to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Deploy

Add a `netlify.toml` for SPA redirect support:

```toml
# netlify.toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Vercel

```bash
npx vercel --prod
```

Vercel auto-detects Vite. Set output directory to `dist` if it doesn't detect automatically.

### GitHub Pages

```bash
npm run build
npx gh-pages -d dist
```

Add `base: '/your-repo-name/'` to `vite.config.ts` if hosted at a sub-path:

```typescript
export default defineConfig({
  base: '/combat_system/',
  // ...
})
```

### Nginx / Self-Hosted

```nginx
server {
    listen 80;
    root /var/www/crimson-engine/dist;
    index index.html;

    # SPA fallback — required for client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## Branching & Release Workflow

From `CONTRIBUTING.md`:

```
tech/YOUR_NAME  (sandbox — free experimentation)
      ↓  merge when ready
     DEV         (staging / integration testing)
      ↓  merge after verification (project lead only)
    main          (production — always stable)
```

### Promoting a Release

```bash
# 1. Ensure DEV is tested and stable
git checkout main
git merge DEV
git push origin main

# 2. Build and deploy
npm run build
# Deploy dist/ to hosting provider
```

---

## Post-Deployment Verification Checklist

- [ ] `index.html` loads without console errors
- [ ] Profile tab renders skill list
- [ ] Combat tab — zone selection visible
- [ ] Start a hunt — combat log populates
- [ ] Refresh page — `currentVitae` and skills persist (localStorage working)
- [ ] Sanctum tab — distill buttons visible
- [ ] Sanguine Exchange — items listed correctly
- [ ] Assets (zone backgrounds, sprite images) load without 404

---

## Rollback

Since there is no persistent backend, rollback is simply redeploying the previous build artifact.

```bash
# If using git tags for releases:
git checkout v0.1.0
npm run build
# Redeploy dist/
```

Player save data lives in the user's `localStorage` and is **not affected** by a deployment rollback.

---

## Observability

> **Missing**: No logging service, error tracking (e.g. Sentry), or analytics integration was found in the source.

**Recommended additions:**

```typescript
// Suggested: add to src/main.tsx after MVP stabilizes
import * as Sentry from '@sentry/react';
Sentry.init({ dsn: import.meta.env.VITE_SENTRY_DSN });
```

**Current diagnostics:**
- Browser `console.*` calls are present throughout the engine for debugging
- `build_error.log`, `lint_results.txt`, and `lint_final.txt` at the project root are development artifacts; **do not commit these to main**

---

## Infra Dependencies

| Service | Required | Notes |
|---------|---------|-------|
| Static file host | ✅ Yes | Any CDN or server |
| Database | ❌ No | localStorage only |
| Auth service | ❌ No | No user accounts |
| Backend API | ❌ No | Pure client-side |
| CDN for assets | ⚠️ Recommended | Images can be large |
