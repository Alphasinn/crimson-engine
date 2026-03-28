# Troubleshooting Guide

## Development Issues

### The dev server doesn't start

**Symptom**: `npm run dev` fails or hangs.

**Diagnose:**
```bash
node -v      # Must be v18+
npm -v       # Must be v9+
ls node_modules  # Must exist
```

**Fixes:**
- Node too old → update Node.js from [nodejs.org](https://nodejs.org)
- Missing `node_modules` → run `npm install`
- Port conflict → `npm run dev -- --port 5174`
- Windows path issues with OneDrive → move project to a local path without spaces or sync conflicts

---

### TypeScript compilation errors on `npm run build`

**Symptom**: `tsc` exits with errors before Vite bundles.

**Diagnose:**
```bash
npx tsc --noEmit   # Check types without building
```

**Common causes:**
- Missing type annotations on new engine code
- A `// @ts-ignore` comment removed but the underlying issue not fixed
- Breaking changes to `types.ts` without updating callers

**Fix**: Resolve all `tsc` errors before merging to `DEV`.

---

### SCSS import errors

**Symptom**: `Error: Can't find stylesheet to import`.

**Cause**: SCSS partials in `src/styles/` not found.

**Fix**: The `vite.config.ts` sets `loadPaths: [stylesDir]`. Ensure you're using the correct import syntax:
```scss
@use 'variables';       // ✅ Correct (no path needed)
@use 'src/styles/variables'; // ❌ Redundant
```

---

### `npm run sim` fails with "Cannot find module ts-node"

**Fix:**
```bash
npm install     # ts-node is a devDependency
# or explicitly:
npx ts-node src/engine/balanceSim.ts
```

---

## Runtime / Gameplay Issues

### Combat doesn't start / zone doesn't load enemies

**Symptom**: Clicking "Start Hunt" does nothing or shows no enemy.

**Diagnose via browser console:**
```
F12 → Console → look for errors like:
"Cannot read properties of undefined (reading 'enemyPool')"
```

**Causes & Fixes:**
1. `combatStore` state is stale — try refreshing
2. Enemy ID in zone `enemyPool` doesn't match any key in `enemies.ts` — add the missing enemy
3. `localStorage` is corrupted — clear it:
   ```javascript
   localStorage.removeItem('crimson-engine-player');
   location.reload();
   ```

---

### Skills not gaining XP

**Symptom**: Hits register in the combat log, but skill XP doesn't increase.

**Cause**: Training mode mismatch with equipped weapon style.

**Fix:**
- Check your **Training Mode** on the Profile tab
- If you have a Melee weapon equipped, `archery` and `sorcery` modes won't affect any skills that weapon uses
- Switch mode to match weapon type

---

### Food not being consumed by auto-eat

**Symptom**: HP drops below threshold but no food is eaten.

**Check:**
1. `auto_eat` upgrade is unlocked in Sanctum
2. `autoEatEnabled` toggle is ON
3. There is food in the **food slot** (not just general inventory)
4. `autoEatThreshold` is set appropriately (default 0.5 = 50%)

---

### Resources not banking after a hunt

**Symptom**: Blood Shards show as "unbanked" and don't persist.

**Cause**: Withdraw was not triggered.

**Fix**: After fleeing, click the **Withdraw** button or use **Claim All Loot** — `claimAllLoot()` internally calls `withdraw()`. On death, `applyDeathPenalties()` is called automatically, which clears unbanked resources with the death penalty applied.

---

### Save data appears to have reset / rolled back

**Symptom**: Character progress is gone after browser update or clearing cache.

**Cause**: `localStorage` was cleared (browser privacy mode, cache clear, or private browsing).

**Mitigation (TODO)**: Implement export/import save data feature. Currently not available.

---

### Scent never reaches 100% / Blood Echo never spawns

**Symptom**: Scent builds but plateaus.

**Check:**
1. Scent resets to 0 every time you **take a hit**. In high-evasion builds this may not be frequent, but any hit resets it.
2. **Not all zones have a Blood Echo defined yet** — this is planned content. Currently only select zones have a matching entry in `src/data/bloodEchoes.ts`.
3. Check if `scentLockTicks > 0` in the console — a previous Blood Echo may have triggered the 120s lock.

---

### Performance / browser freezing

**Symptom**: UI becomes sluggish during combat.

**Causes:**
- TICK_MS is too low (below 50ms becomes hard on browsers)
- Too many combat log entries accumulating in state without rotation — TODO: log rotation limit not confirmed

**Fix:**
- Don't modify `TICK_MS` below 100ms
- Refresh the page to clear the log between sessions

---

## Inspecting Live State

Open DevTools → Console and run:
```javascript
// Read player state
JSON.parse(localStorage.getItem('crimson-engine-player'))

// Check current vitae
JSON.parse(localStorage.getItem('crimson-engine-player')).state.currentVitae
```

---

## Lint Checking

The project has lint output files at the root (`lint_results.txt`, `lint_final.txt`). These are development artifacts. To run a fresh check:

```bash
npm run lint
```

Known lint issues are catalogued in `lint_final.txt`. Do not block releases on warnings — prioritize errors.

---

## Escalation

For persistent unexplained bugs:
1. Check git log for recent changes to `combatLoop.ts` or `playerStore.ts`
2. Run `npm run sim` to verify formula output hasn't changed
3. Check if the issue reproduces with a **fresh save** (after `localStorage` clear)
4. Review `build_error.log` if the build is failing
