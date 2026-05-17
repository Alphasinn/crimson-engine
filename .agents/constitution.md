# Crimson Engine — Project Constitution

These rules apply to **all agents, all roles, all sessions**. They are not preferences or guidelines. They are the load-bearing walls of this codebase. Breaking any of them risks data corruption, save loss, or architectural collapse.

No agent may approve, recommend, or implement anything that violates these rules without explicitly flagging the violation, explaining why it is necessary, and proposing a path to restore compliance.

---

## The 8 Non-Negotiables

### 1. Engine Remains Pure TypeScript
`src/engine/` files must have **zero React imports and zero Zustand imports**.
The engine communicates only via the `CombatCallbacks` interface passed at construction.
Coupling the engine to React or stores makes it untestable and impossible to run in isolation.

### 2. UI Contains No Game Math
React components (`src/features/**/*.tsx`) must not contain damage formulas, XP calculations, stat derivations, or economy logic.
All computed values must come from the store or from `computeDerivedStats()`.
Math in UI components forks truth — the same calculation will diverge from the engine over time.

### 3. `computeDerivedStats()` Is the Stat Source of Truth
`src/engine/formulas.ts → computeDerivedStats()` is the single function that produces player stats for a given session.
No component, store action, or engine method may recompute stats ad hoc.
If a stat is wrong, it is wrong in one place and fixed in one place.

### 4. `PlayerState` Changes Require Migrations
Every field added to the `PlayerState` interface in `playerStore.ts` **must have a corresponding migration block** in the `persist` config's `migrate()` function.
The current schema version is **8**. Incrementing it without a migration block silently corrupts existing saves.
There are no exceptions — not even for "safe" fields with zero values.

### 5. Inventory Changes Go Through `InventoryManager`
All inventory array mutations must use `InventoryManager.addItem()`, `InventoryManager.removeItem()`, or `InventoryManager.createItem()`.
Direct array manipulation (`.push()`, `.splice()`, spread without these methods) bypasses stackability logic, type enforcement, and the item template system.

### 6. Items Must Exist in `ITEM_DATABASE`
Every item ID used in loot tables, store purchases, skilling outputs, or inventory operations must be registered in `src/data/items.ts → ITEM_DATABASE`.
Unregistered items are "ghost items" — they will be created with incomplete templates, bypassing type enforcement and breaking future resolution.
The fallback path in `addLootLog` is a **bug handler**, not a valid code path.

### 7. Timer Ownership Must Stay Explicit
- **`CombatEngine`** owns the combat `setInterval`. It is the only thing that starts or clears it.
- **`skillingStore`** owns the skilling `setInterval`. It is the only thing that starts or clears it.
- These two timers are mutually exclusive — `isRunning` (combat) blocks skilling from starting.
- Any new timer introduced to the system must declare its owner, its start condition, and its guaranteed stop condition.

### 8. No localStorage Bloat Without a Compact Persistence Plan
The full `playerStore` serializes to `localStorage` on every state change. Browser limits are typically 5–10MB.
Any feature that stores unbounded data (arrays, history, logs) must define a cap or eviction strategy before implementation.
Current caps: combat log = 120 entries. Loot history is unbounded — a known risk.

---

## Violation Protocol

If any agent encounters a request that would violate a Non-Negotiable:

1. **Name the rule** being violated (e.g., "This violates Non-Negotiable #4").
2. **Explain the specific risk** to data integrity, saves, or architecture.
3. **Propose a compliant alternative** if one exists.
4. **Do not proceed** with implementation until the violation is resolved or the user explicitly accepts the risk on record.

---

*Last updated: Schema v8. Review when schema version increments.*
