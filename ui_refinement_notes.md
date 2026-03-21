# Tactical UI Final Polish

The combat tactical display has been refined to ensure all information is clearly visible and correctly labeled.

## Changes Made

### 1. Unified Tactical Bars
- **HP Bar**: Now features a persistent track background even when empty. Labeled with a heart icon for clarity.
- **Attack Meter**: Positioned clearly below the HP bar with a distinct red glow and a lightning bolt icon.
- **Standardized Sizing**: Both bars are now locked to a 14px height for a clean, balanced look.

### 2. Information Integrity
- **Negative HP Fix**: The UI now correctly clamps health to `0` when an enemy is defeated, preventing confusing "-8/4" displays.
- **Tactical Header**: Consolidated "Hit %" and "Max Hit" into a single, clean row above the tactical stack.

### 3. Layout Reinforcement
- **Min-Height Protection**: The status area now has a guaranteed minimum height to prevent any elements from being pushed out of frame or squashed.
- **Visual Hierarchy**: Created a clear vertical stack: Tactical Stats -> Weakness/Health -> HP Bar -> Attack Meter.

## Verification

### Visual Inspection
- Confirmed HP bar remains visible as a gray track when enemy is at 0 health.
- Confirmed Attack Meter fill is bright red and animates from 0% to 100%.
- Verified labels are correctly aligned and identifiable.

### State Testing
- Verified HP display never drops below 0 in the UI.
- Confirmed layout remains stable across different screen sizes and combat states.
