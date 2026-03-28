# Contributor Guide & Onboarding

## New Engineer: Start Here

1. Read this file
2. Read `docs/architecture.md` — understand the component layers
3. Read `src/engine/types.ts` — all game types are defined here
4. Read `src/engine/constants.ts` — all tunable values are here
5. Run `npm run dev` — get it running in your browser
6. Read `src/engine/formulas.ts` — understand how combat math works
7. Play through a combat session to understand the feel of the system

**First safe tasks to try:**
- Add a new enemy to `src/data/enemies.ts` (copy an existing entry, change stats and ID)
- Add a new skilling node to `src/data/skilling.ts`
- Adjust a constant in `constants.ts` and observe the behavior change in dev mode
- Write a new test for a formula function in `src/tests/formulas.test.ts`

**Avoid on your first week:**
- Modifying `combatLoop.ts` tick logic without fully understanding the meter/callback pattern
- Changing `playerStore.ts` persistence schema without bumping the version and writing a migration
- Pushing directly to `main` or `DEV`

---

## Repository Structure

```
combat_system/
├── src/
│   ├── engine/             # Pure TypeScript game engine (no React)
│   │   ├── types.ts        # All TypeScript interfaces and types
│   │   ├── constants.ts    # All game balance constants
│   │   ├── formulas.ts     # Pure combat math functions
│   │   ├── combatLoop.ts   # CombatEngine class (tick loop)
│   │   ├── progression.ts  # Tier-shift, hunt evaluation
│   │   ├── inventoryManager.ts  # Inventory CRUD helpers
│   │   ├── lootRoller.ts   # Weighted loot table roller
│   │   ├── statsUtils.ts   # Stat display helpers
│   │   ├── xpTable.ts      # XP → level conversion
│   │   └── balanceSim.ts   # CLI balance simulator
│   ├── data/               # Static game data (arrays & maps)
│   │   ├── enemies.ts      # All enemy definitions
│   │   ├── zones.ts        # Zone definitions (6 zones)
│   │   ├── weapons.ts      # Weapon item definitions (T1–T6)
│   │   ├── armor.ts        # Armor item definitions
│   │   ├── consumables.ts  # Food & consumable definitions
│   │   ├── items.ts        # ITEM_DATABASE (combined index)
│   │   ├── skilling.ts     # Skilling node definitions
│   │   ├── bloodEchoes.ts  # Blood Echo manifestation data
│   │   ├── bloodEchoItems.ts # Blood Echo loot tables
│   │   ├── harvesting.ts   # Harvesting node data
│   │   ├── merchants.ts    # Sanguine Exchange merchant data
│   │   └── index.ts        # Data barrel export
│   ├── store/              # Zustand global state
│   │   ├── playerStore.ts  # Player progress, equipment, resources
│   │   ├── combatStore.ts  # Active combat session state
│   │   ├── skillingStore.ts# Skilling progress state
│   │   └── notificationStore.ts
│   ├── features/           # React UI components by feature
│   │   ├── combat/         # CombatView, FightArena, PrepArea, EnemyRoster
│   │   ├── character/      # ProfileView, EquipmentPanel, ConsumablePanel
│   │   ├── inventory/      # InventoryView
│   │   ├── sanctum/        # SanctumView (Crucible, Rituals)
│   │   ├── store/          # SanguineExchangeView
│   │   ├── harvesting/     # BloodlettingView, DistillationView
│   │   ├── skilling/       # SkillingView (generic)
│   │   └── ui/             # ResourceHUD, shared components
│   ├── styles/             # Global SCSS partials
│   ├── assets/             # Game images, icons, sprites
│   ├── tests/              # Vitest test files
│   ├── App.tsx             # Root component + navigation
│   └── main.tsx            # Vite entry point
├── public/                 # Static assets served as-is
├── docs/                   # This documentation
├── dist/                   # Build output (not committed)
├── package.json
├── vite.config.ts
├── tsconfig.app.json
└── CONTRIBUTING.md         # Branching workflow
```

---

## Branching Workflow

```
tech/YOUR_NAME   →   DEV   →   main
  (sandbox)       (staging)  (production)
```

1. **Get latest**:
   ```bash
   git fetch --all
   git checkout main && git pull origin main
   ```
2. **Work in your sandbox**:
   ```bash
   git checkout tech/YOUR_NAME
   git merge main
   # ... make changes ...
   git commit -m "feat: add new enemy type"
   ```
3. **Promote to testing**:
   ```bash
   git checkout DEV && git merge tech/YOUR_NAME
   git push origin DEV
   ```
4. **Release**: Project lead merges `DEV → main`.

---

## Coding Standards

These are inferred from the existing source; not formally documented yet.

**TypeScript:**
- All new game types go in `src/engine/types.ts`
- Engine functions must be pure (no side effects, no React imports)
- Use `Math.floor()` for all final damage/XP values — never floating point HP or XP
- Export named constants from `constants.ts` for any magic numbers

**React:**
- Use SCSS Modules for all component-level styles
- Access global state via Zustand hooks only (no prop drilling for store state)
- Avoid large components — split by concern (PrepArea, FightArena, etc.)

**Data:**
- All new items must be added to `src/data/items.ts` `ITEM_DATABASE` array
- Enemy IDs must match zone `enemyPool` entries exactly
- Use consistent naming: `snake_case` for IDs, `PascalCase` for component files

---

## Adding a New Enemy

```typescript
// In src/data/enemies.ts
{
    id: 'my_new_enemy',       // Must be unique, snake_case
    name: 'My New Enemy',
    zoneId: 'grimwood_forest',
    stats: { attack: 20, strength: 18, defense: 15, ranged: 0, magic: 0, hp: 45 },
    attackInterval: 2.4,
    accuracy: 80,
    maxHit: 8,
    attackCategory: 'melee',
    damageProfile: 'slash',
    weakness: 'archery',
    resistance: 'slash',
    xpReward: 25,
    respawnTime: 2,
    isElite: false,
    lootTable: [
        { itemId: 'blood_shard', itemName: 'Blood Shard', weight: 10 },
    ],
}
```

Then add `'my_new_enemy'` to the appropriate zone's `enemyPool` in `src/data/zones.ts`.

---

## Writing Tests

```typescript
// src/tests/formulas.test.ts
import { calcMaxHp, calcHitChance } from '../engine/formulas';

describe('calcMaxHp', () => {
    it('returns vitae level as max HP', () => {
        expect(calcMaxHp(10)).toBe(10);
        expect(calcMaxHp(120)).toBe(120);
    });
});
```

Run tests:
```bash
npm test            # Watch mode
npx vitest run      # Single pass
npx vitest --ui     # Browser UI
```

---

## Submitting Changes

**Review checklist before a PR / merge to DEV:**
- [ ] `npm run build` succeeds (no TypeScript errors)
- [ ] `npm run lint` shows no new errors
- [ ] `npm test` passes
- [ ] Game loads and runs a combat session in dev mode
- [ ] If adding a new item: item added to `ITEM_DATABASE` in `items.ts`
- [ ] If modifying `playerStore.ts` schema: version bumped and migration written
- [ ] No debug `console.log` left in engine or store code
- [ ] No test/simulation files committed to `main` (e.g., `tmp/`, `*.log`)

---

## Known Gotchas for New Developers

1. **The Crucible is sealed per-session**: Only one Sanctum action per hunt. `crucibleSealed` is reset at the start of the next hunt via `resetCrucibleSeal()`.
2. **HP is persisted**: `currentVitae` in `playerStore` is restored on page load. Don't assume HP starts at max.
3. **Food ≠ Inventory**: The `food` array and `inventory` array are separate. Auto-eat reads from `food`, not `inventory`.
4. **`applyMitigation` minimum floor**: Even with massive armor, 15% of raw damage always goes through (`DAMAGE_FLOOR_PERCENT`).
5. **Scent resets on ANY hit, not on kill**: Taking any damage instantly resets scent to 0.
6. **Blood Shard cap**: Total banked + unbanked shards are capped at 5000 in `addUnbankedLoot`.
7. **Refinement adds Scent Sensitivity**: Every refinement level on every piece of gear adds 2% to scent gain rate. Fully refined gear (5×11 slots = 55 levels) approaches the 50% cap.
