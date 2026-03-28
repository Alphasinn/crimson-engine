# Configuration Guide

## Overview

Crimson Engine has **no runtime configuration files** (no `.env`, no `config.json`, no server config). All tunable game parameters live in `src/engine/constants.ts` and are compiled into the SPA bundle at build time.

---

## Game Constants (`src/engine/constants.ts`)

All constants are exported named values. Change them, rebuild to see effect. No restart of a server required — but a new browser build (`npm run build`) or dev server refresh is needed.

### Engine Timing

| Constant | Value | Description |
|----------|-------|-------------|
| `TICK_MS` | `100` | Combat heartbeat in ms. **Do not set below 50** — causes browser throttling |
| `MIN_ATTACK_INTERVAL` | `0.6` | Hard floor on attack speed in seconds |
| `MAX_OFFLINE_HOURS` | `8` | Cap on offline simulation duration |
| `ANTI_STALL_SECONDS` | `60` | Warn threshold if no kill in N seconds |

### Combat Formulas

| Constant | Value | Description |
|----------|-------|-------------|
| `MAX_DAMAGE_REDUCTION` | `0.75` | DR cap (75%) — ⚠️ high-impact |
| `MIN_HIT_CHANCE` | `0.05` | Floor hit chance (5%) |
| `MAX_HIT_CHANCE` | `0.95` | Ceiling hit chance (95%) |
| `MAX_BLOCK_CHANCE` | `0.20` | Block chance cap (20%) |
| `MAX_LEVEL` | `120` | Maximum skill level |
| `XP_CAP` | `500_000_000` | Max XP per skill |
| `STARTING_VITAE_LEVEL` | `10` | New character starting HP |

### Style & Weakness Modifiers

| Constant | Value | Description |
|----------|-------|-------------|
| `STYLE_ADVANTAGE_BONUS` | `0.15` | Hit chance bonus when player style beats enemy weakness |
| `STYLE_RESISTANCE_PENALTY` | `-0.10` | Hit chance penalty when hitting into resistance |
| `WEAKNESS_DAMAGE_MOD` | `1.15` | Damage multiplier for hitting a weakness |
| `RESISTANCE_DAMAGE_MOD` | `0.85` | Damage multiplier for hitting a resistance |

### Damage Architecture (Trinity Lock v1.7)

| Constant | Value | Description |
|----------|-------|-------------|
| `MC_THRESHOLD` | `1.0` | Multiplicative Compression activates above this total multiplier |
| `MC_POWER_DEFAULT` | `0.65` | Compression exponent (most styles) |
| `MC_POWER_SLASH` | `0.45` | Stronger compression for Slash |
| `STAB_ARMOR_BYPASS` | `0.15` | Stab style: 15% of armor bypassed |
| `CRUSH_FRACTURE_RATE` | `0.05` | Crush style: bypass per second of attack interval |
| `DAMAGE_FLOOR_PERCENT` | `0.15` | Minimum damage = 15% of raw pre-mitigation |

### Phase 2A: Scent of Fear

| Constant | Value | Description |
|----------|-------|-------------|
| `SCENT_BUILD_INTERVAL` | `40` ticks (4s) | How often scent increases |
| `SCENT_INCREMENT` | `0.03` | Base scent gain per interval |
| `SCENT_ACCURACY_CAP` | `1.00` | Maximum scent (100%) |
| `RED_MIST_THRESHOLD` | `0.30` | HP fraction to enter Red Mist (<30%) |
| `RED_MIST_DMG_BONUS` | `1.20` | Damage multiplier in Red Mist (+20%) |
| `RED_MIST_ICHOR_MOD` | `0.10` | Additive drop rate bonus for Cursed Ichor |
| `SCENT_LOCK_DURATION_MS` | `120,000` | Post-Blood Echo scent lockout (2 min) |

### Phase 2A: Death Penalties

| Constant | Value | Description |
|----------|-------|-------------|
| `DEATH_SHARD_LOSS_PCT` | `0.50` | Unbanked shards lost on death (50%) |
| `DEATH_ICHOR_LOSS_PCT` | `1.00` | Unbanked ichor lost on death (100%) |
| `DEATH_SHARD_BRACED_PCT` | `0.25` | Shard loss when Braced (25%) |
| `DEATH_ICHOR_BRACED_PCT` | `0.50` | Ichor loss when Braced (50%) |

### Siphoning

| Constant | Value | Description |
|----------|-------|-------------|
| `SIPHON_BASE_COST` | `10` | Base shard cost for first siphon |
| `SIPHON_COST_EXPONENT` | `1.7` | Exponential scaling for repeat siphons |

### Scent Events (Phase 2C)

| Constant | Value | Triggers |
|----------|-------|---------|
| `EVENT_THRESHOLD_BLOODLUST` | `0.05` | Enemy Accuracy +10% |
| `EVENT_THRESHOLD_CURSE` | `0.10` | Incoming Damage +15% |
| `EVENT_THRESHOLD_FANGS` | `0.15` | Enemy Attack Speed +10% |
| `BOSS_SCENT_THRESHOLD` | `0.20` | Boss spawn trigger |

### Phase 2B: Refinement

| Constant | Value | Description |
|----------|-------|-------------|
| `MAX_SCENT_SENSITIVITY` | `0.50` | Maximum scent penalty from gear (50%) |
| `REFINEMENT_SCENT_MULT` | `0.02` | Scent gain penalty per refinement level |

---

## Persistence (localStorage)

State is persisted by Zustand to the browser's `localStorage`.

| Key | Store | Schema Version |
|-----|-------|---------------|
| `crimson-engine-player` | `playerStore` | v6 |

> **NOTE**: `combatStore`, `skillingStore`, and `notificationStore` persistence status was not verified. Assume `combatStore` is **not** persisted (session-only). TODO: confirm.

### Migration History

| From Version | To Version | Changes |
|-------------|-----------|---------|
| <4 | 4 | Added `food`, `autoEatThreshold`, `autoEatEnabled` |
| <5 | 5 | Added `activeRituals`, `nextHuntModifiers` |
| <6 | 6 | Added skilling skills: `nightForaging`, `graveHarvesting`, `forging`, `corpseHarvesting`, `alchemy` |

### Clearing Save Data

In browser DevTools:
```javascript
localStorage.removeItem('crimson-engine-player');
location.reload();
```

Or use the in-game **Reset Character** button if present.

---

## Vite / Build Config (`vite.config.ts`)

| Setting | Value | Notes |
|---------|-------|-------|
| Plugin | `@vitejs/plugin-react` | Babel-based React transform |
| Test environment | `jsdom` | Simulates browser DOM for Vitest |
| Test setup | `src/tests/setup.ts` | Minimal setup file |
| SCSS load paths | `src/styles/` | SCSS partials auto-resolved from styles dir |

### Path Aliases

```typescript
'@'          → 'src/'
'@engine'    → 'src/engine/'
'@data'      → 'src/data/'
'@store'     → 'src/store/'
'@features'  → 'src/features/'
'@components'→ 'src/components/'
'@styles'    → 'src/styles/'
```

---

## ESLint Config (`eslint.config.js`)

Based on `@eslint/js` with `typescript-eslint` and `eslint-plugin-react-hooks`. Configured for React + TypeScript. Run with:

```bash
npm run lint
```

---

## ⚠️ High-Impact Constants

Changing these can fundamentally break balance. Do not modify without running the balance simulator (`npm run sim`) after:

- `TICK_MS` — changes all timing globally
- `MAX_DAMAGE_REDUCTION` — caps survivability ceiling
- `SCENT_INCREMENT` + `SCENT_BUILD_INTERVAL` — controls escalation speed
- `MC_POWER_DEFAULT` / `MC_POWER_SLASH` — controls damage stack compression
- `DEATH_SHARD_LOSS_PCT` — affects core risk/reward loop
