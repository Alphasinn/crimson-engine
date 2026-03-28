# ADR-001: Pure TypeScript Combat Engine, Zero React Dependencies

**Date**: Inferred from source (Phase 1/2A)  
**Status**: Accepted

## Context

The core game loop requires deterministic, high-frequency execution (100ms ticks). React's rendering model and hook lifecycle are not designed for tight timing loops. Mixing React state updates with fast timers risks tearing, stale closures, and dropped frames.

## Decision

The combat engine (`CombatEngine` class in `combatLoop.ts`) is implemented as a **pure TypeScript class** with zero React imports. It communicates exclusively through the `CombatCallbacks` interface — callback functions provided by the React layer at construction.

## Consequences

**Positive:**
- Engine can be unit-tested without a React environment (JSDOM not needed for engine tests)
- Engine logic is fully portable and can run in a Node.js simulator (`balanceSim.ts`)
- No risk of stale closure bugs from React effect dependencies in the tick loop
- Clear separation of game logic vs. presentation

**Negative:**
- Requires a custom callback pattern instead of familiar React patterns
- `setCallbacks()` must be called when React hook dependencies change (see `useCombatEngine.ts`)
- Developers must be careful not to import React into `src/engine/` files

---

# ADR-002: Zustand with Persist Middleware for All Player State

**Date**: Inferred from source (Phase 1/2A)  
**Status**: Accepted

## Context

The game requires persistent state across browser sessions (skills, equipment, resources, HP). Options considered:
- React Context + `useReducer` — no built-in persistence
- Redux — heavy boilerplate
- Zustand — minimal API, built-in `persist` middleware
- IndexedDB — more storage but complex API

## Decision

Use **Zustand 5** with the `persist` middleware backed by `localStorage`. All long-term player state lives in `usePlayerStore`. Active combat session state lives in `useCombatStore` (likely not persisted).

Schema versioning and migration are implemented directly in the `persist` config. Current version: **6**.

## Consequences

**Positive:**
- Minimal boilerplate; actions and state co-located
- Persist middleware handles serialization/deserialization automatically
- Schema migration is incremental and explicit

**Negative:**
- `localStorage` has a ~5–10MB browser limit. Not suitable if save data grows very large.
- No offline sync, cloud save, or cross-device support
- Save corruption (e.g., from a failed migration) requires manual `localStorage` clear
- Schema version must be bumped with every state shape change — easy to forget

---

# ADR-003: Static Data as TypeScript Modules, Not a Database

**Date**: Inferred from source (Phase 2A–4)  
**Status**: Accepted

## Context

The game has a large amount of static game data: 6 zones, 36+ enemies, 100+ weapons, 100+ armor pieces, skilling nodes, merchant listings, and Blood Echo definitions. Options:
- External JSON files with `fetch()`
- A backend database
- TypeScript module arrays imported at compile time

## Decision

All game data is defined as **TypeScript type-safe arrays/maps in `src/data/`** and compiled into the application bundle. There is no runtime `fetch()` for game data.

A unified `ITEM_DATABASE` array in `src/data/items.ts` acts as the single lookup table for all equipment and consumables.

## Consequences

**Positive:**
- Full TypeScript type safety on all data — malformed entries are a compile error
- Zero async complexity; all data is synchronously available
- Easy to add new enemies/items without a backend
- Balance changes require only a code change and rebuild

**Negative:**
- Bundle size grows linearly with data volume; at scale (~100KB data) could impact initial load
- Cannot update data without a full redeploy
- No admin panel or content management system — all edits require a developer
- A typo in an enemy ID breaks zone loading silently (TODO: add Zod validation at startup)

---

# ADR-004: Scent of Fear as the Primary Idle Escalation Mechanic

**Date**: Inferred from Phase 2A source comments  
**Status**: Accepted

## Context

Idle/tick-based RPGs face the "untouchable evasion build" problem: a player who maximizes evasion can idle indefinitely without risk. Standard solutions include time limits, fixed zone hazards, or increasing enemy stats over time.

## Decision

Implement **Scent of Fear**: a continuous accuracy pressure system where the longer a player avoids being hit, the higher enemy accuracy becomes (up to +100%). It resets immediately on any hit. Additional escalation layers were added:
- Scent-based events at 5%, 10%, 15% thresholds
- Scent at 100% triggers a Blood Echo (special boss)
- 120-second scent lock after a Blood Echo to reward the encounter

## Consequences

**Positive:**
- Evasion builds are viable but not unkillable
- Creates natural risk/reward tension: survive longer → more scent → more danger → Red Mist potential
- Produces meaningful player decisions (flee before echo vs. stay for loot)

**Negative:**
- Scent resets on ANY damage; even a single hit from a slow enemy resets all pressure
- At very high defense, scent can accumulate faster than armor can compensate
- Blood Echo triggering mid-hunt is only possible if the player survives long enough — very new characters may never see it

---

# Candidate ADRs (Proposed — Not Yet Written)

These architectural decisions exist in the code but lack formal records. Recommend creating full ADRs for:

| Candidate | Why it warrants an ADR |
|-----------|----------------------|
| **Trinity Lock v1.7 mitigation model** (Crush/Stab/Slash differentiation) | Complex formula with style-specific behavior; rationale should be documented |
| **Multiplicative Compression for damage stacking** | Anti-inflation mechanic with balance implications |
| **Per-hit XP instead of per-kill XP** | Fundamental change from XP-on-kill model; affects all training mode design |
| **Crucible Seal (one action per hunt)** | Anti-spam mechanic that constrains Sanctum flow |
| **No Router Library (tab state in useState)** | Simplicity vs scalability tradeoff |
