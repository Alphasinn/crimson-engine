# Developer Handoff: Combat System & Loot Fixes

This document summarizes the changes made to resolve the combat interaction bugs and loot system corruption.

## Core Engine Changes (`src/engine/combatLoop.ts`)
- **Fixed HP Initialization**: Corrected `CombatEngine.start` to properly initialize `playerMaxHp` from derived stats. This resolves the bug where manual healing was capped at 10 HP (the old default).
- **Loot Signature Refactor**: Refactored `onLoot` and `spawnLoot` to pass structured payloads (`{ itemId, itemName, quantity }`) instead of simple strings. This ensures data consistency with the UI.
- **Grave Steel Logic**: 
    - Elites now have a 100% chance to drop 1-2 Grave Steel.
    - Regular enemies in Tier 2+ zones HAVE a 10% chance to drop 1 Grave Steel.

## Store & Hook Logic
- **`src/store/playerStore.ts`**: Added a validation layer to the `addFood` action. It now filters all incoming items, ensuring only those with `type === 'food'` enter the consumable array.
- **`src/features/combat/useCombatEngine.ts`**:
    - Updated all `sharedEngine.start` calls to ensure full state synchronization (skills, equipment, rituals, etc.).
    - Updated `onLoot` handler to process the new object-based payloads.
    - Cleaned up `onPlayerDeath` logic to avoid redundant engine restarts.

## UI & Layout Enhancements
- **Consumable Bar Position**: Moved the `ConsumablePanel` from the player card/absolute bottom into a dedicated `bottomConsumableBar` at the bottom center of the arena.
- **UI Data Integrity**: Added a proactive filter to `ConsumablePanel.tsx` to ensure only food items are rendered, even if the underlying state contains rogue loot items.
- **Fight Arena Layout**: 
    - Grouped HP and consumables into a `playerStatsGroup` for tighter spacing.
    - Removed redundant navigation buttons that were overlapping with the sidebars.
- **Crucible Refactor**: Updated `CruciblePanel` to a horizontal, multi-column layout for better readability.

## Formula & Stat Updates (`src/engine/formulas.ts`)
- Refactored derived stat calculations to provide a cleaner breakdown of Melee Power, DR%, and Armor. 
- Ensured specific power bonuses (Melee/Archery/Magic) only apply when the corresponding weapon type is equipped.

## Status: Ready for playtesting and merge.
