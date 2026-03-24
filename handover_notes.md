# Handover Notes: Crimson Engine Refactor & Expansion

This document summarizes the major architectural changes and content expansions implemented today. These changes are currently staged/modified in the `DEV` branch and pass `npx tsc --noEmit`.

## 1. Major Architectural Shift: Combat Sustain Simplification
**Goal**: Move from a complex, multi-layered sustain model to a clear "Consumables Only" model.

- **Standardized Healing**: Vitae is now exclusively restored through food and potions via the **Auto-Vita** system.
- **Removed Systems**: 
    - **Siphon**: Purged from types, combat engine, and equipment stats.
    - **Lifesteal**: Removed from `armor.ts`, `weapons.ts`, and the `Altar of Blood` (Replaced with *Sanguine Finesse*).
    - **Passive Regen**: Removed from combat logic and spectral rituals.
- **Improved HUD**: The **Scent of Fear** bar is now significantly more prominent (32px height) with a custom gradient and "shimmer" animation to better communicate heat/risk.

## 2. Non-Combat Expansion: 5 New Skills
Initialized a robust skilling system to provide variety and support the combat loop.

- **Gathering**:
    - **Grave Harvesting**: Extraction of ore/dust from ruins ($iconGrave placeholders).
    - **Night Foraging**: Scavenging herbs/flora from the forest ($iconForaging placeholders).
- **Refinement**:
    - **Forging**: Processing metal shards into gear reinforcement components.
    - **Corpse Harvesting**: Extracting materials from monster "Remains".
    - **Alchemy**: Brewing Vitae extracts and support oils (e.g., Scent Mask).

## 3. Technical Changes (Check these files)
- **`src/store/skillingStore.ts`**: The new heart of all idle actions. It replaces the old `harvestingStore.ts`. It handles gathering (0 inputs) and refining (multi-ingredient recipes) using a unified `tick` logic.
- **`src/features/skilling/SkillingView.tsx`**: A generalized component used for all 5 new skill views. 
- **`src/data/skilling.ts`**: Central data repository for all T1-T6 nodes and recipes.
- **`src/features/character/ProfileView.tsx`**: Reorganized skill grid into **Predation**, **Harvesting**, and **Refinement** categories.

## 4. Pending Tasks / Technical Debt (FOR JR. DEV)

### A. Asset Integration (High Priority)
- [ ] **Icons**: Current icons for the 5 new skills in `ProfileView.tsx` and `App.tsx` are placeholders (emojis or repurposed combat icons). 
    - Action: Generate/Import true 48x48 pixel art icons into `src/assets/tech/icons/`.
- [ ] **Nodes**: The `SkillingView` relies on emojis for node visuals. These should eventually be replaced with sprite/icon URLs in the data.

### B. Progression & Balancing
- [ ] **XP Curves**: Review the XP/Action and Time/Action in `src/data/skilling.ts`. 
- [ ] **Resource Costs**: Ensure the input/output ratio for Forging and Alchemy isn't too punishing.

### C. Logic Implementation
- [ ] **Pre-Hunt Buffs**: `Scent Mask Oil` is currently craftable but has no consumption logic. 
    - Task: Add a "Use" button to these items in the inventory or a "Preparation" slot in the Combat View.
- [ ] **Monster Remains**: Add remains to more enemies (currently only in T1-T3 representative mobs).

### D. Refactoring
- [ ] Remove `BloodlettingView.tsx` and `DistillationView.tsx` completely by migrating their data into the generalized `skilling.ts` format and using `SkillingView.tsx` for everything. (Currently kept for safety).

---
**Status**: The build is stable. All core loops are functional.
**Branch**: `DEV`
**Last TSC Check**: Passed (2026-03-24)
