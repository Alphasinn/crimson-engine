# Handoff: Coven Feature & Skill Integration

This document outlines the recent integration of the **Coven** (multiplayer/social) system UI and the addition of three new non-combat skills into the **Crimson Engine**.

## 🚀 What's New?

### 1. Coven (Multiplayer/Social UI)
A new structural UI for the **Coven** system has been implemented. This serves as a foundation for both personal progression (Domicile) and group activities (Collective).

*   **Domicile Tab**: A personal sanctum for managing Runecraft components and passive player bonuses. Features a 2x3 fixture grid and status panels.
*   **Collective Tab**: A group-focused view for tracking active Coven objectives, contribution leaderboards, and group-wide unlocks.
*   **Placement**: Located in the sidebar navigation just below the first divider, above **Sanguine Exchange**.

### 2. New Skills Summary
| Skill | Category | Placeholder Icon | Initial Role |
|-------|----------|------------------|--------------|
| **Butchery** | Harvesting | `iconCorpse` | Process remains for food/materials. |
| **Relic Scavenging** | Harvesting | `iconGrave` | Sift for ancient fragments/relics. |
| **Runecraft** | Refinement | `iconMagic` | Inscribe sigils and glyphs for gear. |

---

## 🛠️ Technical Implementation

### 1. Coven Architecture (`src/features/coven/`)
*   **`CovenView.tsx`**: Main component managing tab state between Domicile and Collective views.
*   **`DomicileTab.tsx` / `CollectiveTab.tsx`**: Modularized tab components for clean separation of solo vs. group UI logic.
*   **`coven.module.scss`**: Dedicated styling using the `glass-card` mixin to match existing game aesthetics.

### 2. Type Safety (`src/engine/types.ts`)
The `SkillName` union has been extended. Ensure any new logic using skills includes these types to maintain TS compiler safety.

### 3. State Management (`src/store/playerStore.ts`)
*   **Default State**: New skills now start at `Level 1` with `0 XP` in `DEFAULT_SKILLS`.
*   **Migration (v7)**: I have bumped the store version. The `migrate` function automatically injects these 3 skills into the player's profile.

### 4. Routing & Nav (`src/App.tsx`)
*   Added `'coven'` to the `Tab` type and integrated `CovenView` into the main application switch.
*   **Sidebar Navigation**: 
    *   **Coven**: Placed below the first divider for prominence.
    *   **New Skills**: Integrated into the harvesting and refinement groups respectively.

---

## 🎨 UI & Layout Fixes

### Icon Normalization
Updated the following style files to enforce a **64x64px** constraint on header icons to prevent layout overflow:
*   `SkillingView.module.scss`
*   `BloodlettingView.module.scss`
*   `DistillationView.module.scss`

### Profile Page (`ProfileView.tsx`)
*   **Harvesting Panel**: Now includes Butchery and Relic Scavenging.
*   **Refinement Panel**: Now includes Runecraft.

---

## 🚧 Known Debt & Next Steps
1.  **Coven Backend**: The Coven UI currently uses mock data. Future work includes connecting this to a backend/multiplayer state for real-time contributions.
2.  **Dedicated Assets**: New skills and Coven-specific icons are currently reusing existing assets.
3.  **Runecraft Integration**: The Domicile slots need to be linked to the actual `Runecraft` skill level and item outputs.

---
**Last Updated**: 2026-04-04
**Latest Commit**: `feat: Implement Coven (multiplayer/social system UI) structure and navigation`
