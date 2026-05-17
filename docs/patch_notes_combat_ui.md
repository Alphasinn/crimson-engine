# Patch Notes — Combat UI & UX Overhaul
**Date:** May 16, 2026  
**Target Audience:** Development Team / Junior Developers  

## Overview
This patch focuses on improving the flow, feel, and global accessibility of the combat system. We moved several isolated features from the `CombatView` up to the root level (`App.tsx`) to allow players to interact with combat while managing other skills (Forging, Inventory, etc.).

---

## 1. Global Combat Controls (Floating Pill)
*   **What we did:** Replaced the sidebar-docked combat buttons with a floating, draggable "Combat Pill".
*   **Where to find it:** `App.tsx` (Component: `CombatPill`), `App.module.scss`.
*   **Why:** Players needed to access "Flee" and "Return" from any tab without the UI feeling cluttered or blocking content.
*   **Notes for Jr Devs:** 
    *   The drag logic uses standard mouse event listeners (`onMouseMove`, `onMouseUp`) attached to the `window` during dragging to prevent "mouse leave" glitches.
    *   We added a CSS animation `@keyframes combatPulse` to give it a "breathing" red glow effect.
    *   We removed the specific drag handle dots; now the entire background of the pill acts as the drag target (except on the buttons).

## 2. Globalized Modals & Notifications
*   **What we did:** Moved `NotificationContainer` and `SessionSummaryModal` from `CombatView.tsx` to `App.tsx`.
*   **Why:** 
    *   **Toasts:** Players on other tabs (e.g., Forging) weren't seeing their combat loot/XP popups because the container was unmounting. Moving it to `App` makes notifications truly global.
    *   **Combat Report:** When a player clicks "Flee" on the floating pill while on another tab, they should see the report immediately without being yanked back to the Combat tab.
*   **Notes for Jr Devs:** `SessionSummaryModal` now auto-detects if a session just ended by checking `lastSession` in the `combatStore`. If it's not null, it displays.

## 3. Enemy Selection Overhaul
*   **What we did:** Removed the "Fight!" button from enemy cards and made the entire card clickable.
*   **Where to find it:** `EnemyRoster.tsx`, `enemyRoster.module.scss`.
*   **Why:** Modern UX prefers large click targets over small action buttons.
*   **Notes for Jr Devs:** 
    *   Check `.enemyCard` in the SCSS. We added `cursor: pointer` and a custom `:hover` state that glows crimson instead of the default gold to emphasize actionability.

## 4. UI Polish & Bug Fixes
*   **Centered Damage Numbers:** In `combat.module.scss`, we fixed the absolute positioning of the damage splats so they center perfectly on the enemy card instead of clustering in the top-left.
*   **Duplicate Loot Logs:** Fixed a bug in `combatLoop.ts` where loot was being logged twice (once by the engine and once by the UI hook).
*   **Sidebar Button Visibility:** Fixed the logic in `PrepArea.tsx` so the "Return to Combat" button doesn't show up while you are already actively looking at the fight.

---

## 5. Immersive Tooltips & Combat Transparency
*   **What we did:** Replaced native browser tooltips with custom, theme-appropriate tooltips and added dynamic damage indicators.
*   **Why:** The plain white browser tooltips were jarring and didn't fit the gothic theme. Players also needed more transparency on why they were hitting higher than their displayed max hit.
*   **Key Changes:**
    *   **Custom Tooltips**: Added to Equipment slots, Crucible buttons, and Combat Arena status badges (Dash, Armor). Fixed clipping issues by adjusting absolute positioning and overriding `overflow: hidden`.
    *   **Dynamic Max Hit**: The "Max Hit" display now calculates the *actual* ceiling against the current target, factoring in Heavy weapon bonuses (+25%) and Style advantage (+15%) in real-time.
    *   **Crit Max Box**: Added a dedicated "Crit Max" box below Max Hit to show the ultimate ceiling on a critical strike.
    *   **Refinement Stats**: Tooltips now show the exact decimal bonus from refinement in parentheses (e.g., `Power: +14 (+0.3)`) so players see progress even at low levels.

## 6. Loot Table Inspector
*   **What we did:** Added a clickable loot chest icon to enemy cards that opens a modal showing the full loot table and percentage drop chances.
*   **Why:** Players wanted to know what monsters dropped and the likelihood of getting those drops.
*   **Key Changes:**
    *   **Themed Icon**: Added a large (64px) gothic chest icon to the top-right of the enemy card. Used `mix-blend-mode: screen` to make the black background transparent dynamically.
    *   **Loot Modal**: Built a custom modal that iterates through the enemy's `lootTable` and calculates percentage chances based on total weight.
    *   **Data Corrections**: Added `Grave Dust` to the loot tables of `Novice Vampire Hunter` (Elite) and `The Hollow Witness` (Blood Echo).

## 7. Skilling UI & Data Updates
*   **What we did:** Polished the skilling interface with tooltips and more descriptive content.
*   **Why:** Players needed more information on what ingredients were and how many they owned directly from the skilling screen.
*   **Key Changes:**
    *   **Themed Tooltips**: Added hover tooltips for both required ingredients and output items in the skilling grid.
    *   **Node Descriptions**: Added a description field to `SkillingNode` interface and filled it out for Alchemy recipes.
    *   **Quantity Displays**: Added a direct display of how many of the output item you currently own.
    *   **Data Cleanup**: Renamed several nodes for better immersion (e.g., `Dusty Grave Piles` -> `Grave Dust Piles`, `Rusty Relics` -> `Rusty Scrap`).

## 8. Offline Progression & AFK Unlocks
*   **What we did:** Built the foundation for offline progression, allowing players to gain XP and loot while away from the game.
*   **Why:** To respect player time and provide a sense of continuous progression.
*   **Key Changes:**
    *   **Offline Simulation**: Added `offlineProgression.ts` to calculate gains for both skilling and combat based on time away.
    *   **Time Caps**: Base offline time is capped at 12 hours.
    *   **AFK Unlocks**: Each tier of `offlineProgressTiers` extends the cap by +2 hours.
    *   **Combat Simulation**: Factors in player DPS, monster DPS, and food consumption to determine how many kills are possible before running out of resources or being defeated.
    *   **Summary Modal**: Added `OfflineSummaryModal` to display gains when returning to the game.

---
*If you have any questions about the React refs used for the drag logic or the global store connections, feel free to ask the Senior Dev!*
