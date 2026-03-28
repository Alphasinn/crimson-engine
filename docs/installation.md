# Installation & Environment Setup

## Supported Environments

| Environment | Status |
|-------------|--------|
| Local development (Windows/Mac/Linux) | ✅ Confirmed |
| Static hosting (Netlify, Vercel, GitHub Pages, Nginx) | ✅ Confirmed (Vite SPA build) |
| Docker | ⚠️ No Dockerfile found — TODO |
| Server-side rendering | ❌ Not applicable (pure SPA) |

## Prerequisites

| Dependency | Required Version | Notes |
|-----------|-----------------|-------|
| Node.js | **v18 or later** | v20+ recommended. Check: `node -v` |
| npm | v9+ | Ships with Node. Check: `npm -v` |
| Git | Any recent | For branching workflow |
| Python 3 | Optional | Only for `remove_bg_v3.py` / `refine_bg.py` asset scripts |

> **NOTE**: No `.nvmrc` file is present. The stated minimum (`v18`) comes from the README. Confirm with `node -v` before beginning.

## Step-by-Step Installation

### 1. Clone the repository

```bash
git clone https://github.com/Alphasinn/crimson-engine combat_system
cd combat_system
```

### 2. Install dependencies

```bash
npm install
```

This installs both `dependencies` and `devDependencies` as defined in `package.json`.

**Key dependencies installed:**

| Package | Version | Role |
|---------|---------|------|
| react | ^19.0.0 | UI framework |
| react-dom | ^19.0.0 | DOM renderer |
| zustand | ^5.0.0 | Global state management |
| sass | ^1.81.0 | SCSS compilation |
| zod | ^3.23.8 | Runtime schema validation |
| zod-validation-error | ^3.4.0 | Human-readable Zod errors |
| vite | ^6.0.0 | Dev server & build tool |
| vitest | ^4.0.18 | Unit test runner |
| typescript | ~5.6.2 | Type checker |

### 3. Verify installation

```bash
npm run dev
```

Expected output:
```
  VITE v6.x.x  ready in NNNms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Open `http://localhost:5173` and the Crimson Engine UI should appear.

### 4. (Optional) Verify tests pass

```bash
npm test
```

---

## Environment Variables

> **Confirmed**: No `.env` file, `.env.example`, or `import.meta.env` references were found in the source.

The project currently has **no required environment variables**. All configuration is compile-time or hardcoded in `src/engine/constants.ts`.

If environment-specific config (e.g., analytics key, remote API endpoint) is added in the future, create a `.env.local` file at the project root:

```dotenv
# .env.local (example — no values are required today)
VITE_APP_VERSION=0.1.0
# VITE_API_URL=https://api.example.com  # TODO: add if backend is wired up
```

Vite automatically exposes variables prefixed with `VITE_` to the browser via `import.meta.env`.

---

## Path Aliases (Vite Config)

Defined in `vite.config.ts`. Use these in all imports:

| Alias | Resolves To |
|-------|------------|
| `@` | `src/` |
| `@engine` | `src/engine/` |
| `@data` | `src/data/` |
| `@store` | `src/store/` |
| `@features` | `src/features/` |
| `@components` | `src/components/` |
| `@styles` | `src/styles/` |

---

## Common Installation Failures

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| `node: command not found` | Node not installed | Install from [nodejs.org](https://nodejs.org) |
| `npm install` fails with ERESOLVE | Peer dependency conflict | Try `npm install --legacy-peer-deps` |
| SCSS import errors at startup | Missing `sass` package | Run `npm install sass` |
| Port 5173 already in use | Another Vite instance running | Kill port: `npx kill-port 5173` or use `npm run dev -- --port 5174` |
| `ts-node` not found for `npm run sim` | `ts-node` not in PATH | Run `npm install` first; it's a devDependency |
