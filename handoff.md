## Crucible UI Overhaul & Sanctum Refinement

This update introduces the premium "Requirement Card" system to the Crucible and streamlines the Sanctum navigation by removing redundant modules.

### UI Pattern: Requirement Cards (`src/features/ui/CruciblePanel`)
- **New Pattern**: Costs are no longer text-based. They are now visual "Item Cards" using the `requirementContainer` class.
- **Badging Logic**:
    - **Top-Right**: The `qtyBadge` shows the required amount for the action.
    - **Bottom-Middle**: The `stockBadge` shows the player's current inventory.
    - **Validation**: Added the `.insufficient` class to turn the stock badge red if the player lacks resources.

### Altar of Flesh (Tier Shifting)
- **Evolution Preview**: The "Evolving to" text has been moved to the top-right of the card header (`evolveIntoHeader`) to maximize space.
- **2-Row Constraint**: Requirements are strictly grouped into two rows:
    - **Row 1**: Main currencies (Shards/Ichor).
    - **Row 2**: Crafting components (Forge items).
- **Styling**: Cards are set to `min-width: 320px` to handle the horizontal spread of icons.

### Sanctum Streamlining (`src/features/sanctum/SanctumView.tsx`)
- **Removed Vault**: The "Vault" tab and all associated code have been deleted.
- **Removed Progression Summary**: The "Progression Summary" placeholder has been removed to reduce UI clutter.
- **Outcome**: The Sanctum now only contains the **Crucible** and **Rituals**.

### 🛠️ Tasks for Jr Dev
1. **Asset Integration**: In `CruciblePanel.tsx` (lines 197-202), current forged components use a simple fallback (the first letters of their ID, e.g., "IP" for Iron Plate). Once specific icons are added to the assets folder, replace these fallback `div` elements with proper `img` tags.
2. **Tab Re-mapping**: If we ever decide to bring back a Summary or Vault, ensure they are placed in a side-panel or a separate view entirely to keep the Sanctum dashboard focused on actions.
