# Crimson Engine

**Crimson Engine** is a dark fantasy, tick-based idle RPG running entirely in the browser. It features automated vampire-versus-hunter combat, a layered resource economy, and a deep gear progression system across 6 zones and 6 gear tiers.

## 🎯 Who It's For

- A solo developer or small team building a browser-based idle RPG
- No backend required — all state persists in `localStorage`

## ✨ Key Features

- **100ms tick-based combat** — deterministic, formula-driven, zero server dependency
- **Scent of Fear** — evasion pressure mechanic; the longer you dodge, the more accurate enemies become
- **Red Mist** — high-risk sub-30% HP state with +20% damage and bonus item drops
- **Blood Echoes** — elite boss manifestations triggered at peak Scent (100%)
- **13 skills** — 7 combat + 6 idle skilling (Grave Harvesting, Night Foraging, Forging, Corpse Harvesting, Alchemy, Distillation)
- **6 zones** — levels 1–120, T1–T6 gear drops
- **Gear Refinement & Tier-Shifting** — Sanguine and Vile specialization paths
- **Ritual system** — pre-hunt modifiers that affect scent, loot, HP, and speed

---

## 🚀 Quick Start

### Prerequisites

- Node.js v18+
- npm v9+

### Install & Run

```bash
git clone https://github.com/Alphasinn/crimson-engine combat_system
cd combat_system
npm install
npm run dev
# Open http://localhost:5173
```

### Build for Production

```bash
npm run build
# Output in dist/ — deploy as a static site (Netlify, Vercel, Nginx)
```

### Run Tests

```bash
npm test
```

### Run Balance Simulator

```bash
npm run sim
```

---

## 🗂️ Documentation

| Document | Description |
|----------|-------------|
| [docs/installation.md](./docs/installation.md) | Full install & env setup |
| [docs/usage.md](./docs/usage.md) | Gameplay guide & workflows |
| [docs/architecture.md](./docs/architecture.md) | System design, component map, diagrams |
| [docs/api.md](./docs/api.md) | CombatEngine, formulas, store actions |
| [docs/configuration.md](./docs/configuration.md) | All game constants & config |
| [docs/deployment.md](./docs/deployment.md) | Build & deploy guide |
| [docs/troubleshooting.md](./docs/troubleshooting.md) | Common issues & diagnostics |
| [docs/adr/decisions.md](./docs/adr/decisions.md) | Architecture Decision Records |
| [docs/contributor.md](./docs/contributor.md) | Contributor & onboarding guide |
| [docs/changelog.md](./docs/changelog.md) | Release history |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Branching workflow |

---

## 🩸 Core Gameplay Loop

```
Hunt → Harvest → Evaluate → Distill
```

1. **Hunt** — Automatic combat in a chosen zone
2. **Harvest** — Collect Blood Shards, Cursed Ichor, Grave Steel
3. **Evaluate** — Decide when to flee based on HP and Scent level
4. **Distill** — Spend resources in the Sanctum for permanent upgrades

---

## 💎 Resource Economy

| Resource | Purpose | Death Penalty (unbanked) |
|----------|---------|--------------------------|
| Blood Shards | Main currency | −50% (−25% if Braced) |
| Cursed Ichor | Rare reagent | −100% (−50% if Braced) |
| Grave Steel | Crafting material | Retained |
| Stabilized Ichor | High-tier material | Retained |

---

## 🏗️ Architecture Summary

```
React UI → Zustand Stores → CombatEngine (pure TS) → formulas.ts
                                    ↓
                            localStorage (persist)
```

- **No backend** — pure SPA
- **No router library** — tab state in `useState`
- **Persist schema version**: 6 (migration logic included)

---

## ⚠️ Known Limitations

- Save data is `localStorage` only for now — planned to migrate to a proper persistence layer as the game matures
- No error tracking or analytics integrated
- No `.env` configuration — all constants are compile-time
- No static hosting chosen yet; deploy target TBD
- No export/import save data feature
- Blood Echoes not yet implemented for all 6 zones — content will expand with game updates

---

## 🔧 Troubleshooting (Quick Reference)

| Problem | Fix |
|---------|-----|
| Won't start | `node -v` must be v18+; run `npm install` |
| Lost save data | Clear localStorage: `localStorage.removeItem('crimson-engine-player')` |
| Skills not gaining XP | Check Training Mode matches weapon type |
| Auto-eat not working | Unlock `auto_eat` upgrade in Sanctum first |
| Build fails | Run `npx tsc --noEmit` to find type errors |

See [docs/troubleshooting.md](./docs/troubleshooting.md) for full diagnostics.

---

## 📜 License
MIT
