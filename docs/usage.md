# Usage Guide

## Starting the Game

```bash
npm run dev
# Open http://localhost:5173
```

The app opens on the **Profile** tab. No login, account, or network access is required.

---

## Core Gameplay Loop

```
Hunt (Combat) → Harvest (resources drop) → Evaluate (HP / Scent check) → Distill (spend resources)
```

### 1. Set Up Your Character (Profile Tab)

- View all 13 skill levels and XP progress
- Inspect equipped gear (hover for stats)
- Set your **Training Mode** — controls which skills gain XP from combat hits

**Training Modes by weapon type:**

| Mode | Weapon Type | XP Distribution |
|------|------------|-----------------|
| `attack` | Melee | Fang Mastery ×4 |
| `strength` | Melee | Predator Force ×4 |
| `defense` | Melee | Obsidian Ward ×4 |
| `all_melee` | Melee | Fang + Predator + Obsidian ×1 each |
| `archery` | Archery | Shadow Archery ×4 |
| `warding_archery` | Archery | Shadow Archery ×2 + Obsidian Ward ×2 |
| `sorcery` | Sorcery | Blood Sorcery ×4 |
| `warding_sorcery` | Sorcery | Blood Sorcery ×2 + Obsidian Ward ×2 |

> Vitae always earns ×1.33 XP passively on every hit, regardless of mode.

---

### 2. Equip Gear (Inventory Tab)

- Items in your inventory can be **right-clicked or equipped** from the Inventory panel
- Equipping a weapon sets your combat style (melee / archery / sorcery)
- Unequipping moves the item back to inventory
- Equipment slots: `weapon`, `offhand`, `helmet`, `chest`, `legs`, `gloves`, `boots`, `amulet`, `ring`, `cape`, `ammo`

**Starting gear:** New characters begin with a **Rusted Fang** (weapon) and a small food supply (Blood Oranges × 25, Ironbread × 5).

---

### 3. Configure Auto-Eat (Profile or Combat Tab)

- Unlock the `auto_eat` upgrade in the Sanctum first
- Set the HP threshold (default: **50%**) — auto-eat triggers below this fraction
- The engine uses food from your `food` inventory slot (not general inventory)
- Add food to the food slot via the Inventory panel

---

### 4. Hunt (Combat Tab)

1. Select a **zone** from the Zone roster (recommended levels shown)
2. Click **Start Hunt**
3. Combat runs automatically at a 100ms tick rate — no manual input required
4. Watch the combat log for hits, crits, scent events, and level-ups

**During a Hunt:**

| Mechanic | What Happens |
|----------|-------------|
| Player attacks | Resolved every `attackInterval` seconds (weapon-based) |
| Enemy attacks | Resolved per enemy's own `attackInterval` |
| Scent of Fear | Builds every 4 seconds; resets when you take a hit |
| Red Mist | Activates below 30% HP — +20% damage, +10% Ichor drop rate |
| Blood Echo | Triggered at 100% Scent — elite manifestation spawns after current enemy |
| Auto-Eat | Triggers below your configured HP threshold, consuming one food item |
| Famine Rest | If HP < 30% and Blood Shards < 5, regenerate +1 HP every 5s (safety net) |

5. Click **Flee** to end the hunt manually
6. After fleeing or death, resources are resolved:
   - **Survive**: click **Withdraw** to bank unbanked resources
   - **Death**: 50% of unbanked shards and 100% of unbanked ichor are lost (unless Braced)

---

### 5. Distill Resources (Sanctum Tab)

Spend banked resources on permanent or temporary upgrades:

| Action | Cost | Effect |
|--------|------|--------|
| Sanguine Finesse | 15 Blood Shards | +5% Accuracy, double lifesteal if <50% HP, for 200 ticks |
| Vile Reinforcement | 30 Shards + 10 Steel | +5 Flat Armor (permanent) + Braced status |
| Ichor Stabilization | 125 Shards + 1 Cursed Ichor | Produces 1 Stabilized Ichor (yield scales with last hunt's scent) |
| Gear Refinement | 25× level Shards + 5× level Steel | +1 Refinement on equipped item (max 5) |
| Tier Shift | Variable (×tier cost) | Promote item to next tier; resets refinement to 0 |

> **Crucible is sealed** after one action per session. It resets when you start the next hunt.

---

### 6. Non-Combat Skilling

All skilling activities are idle — click a node to start, and XP accumulates over time.

| Skill | Activity | Example Output |
|-------|----------|---------------|
| Grave Harvesting | Mining ruins | Grave Dust, Cursed Ore, Ancient Relics |
| Night Foraging | Herb gathering | Thornvine, Nightshade Berry, Moonleaf |
| Forging | Crafting | Iron Plate, Cursed Ingot |
| Corpse Harvesting | Processing remains | Beast Sinew, Bone Meal, Tough Leather |
| Alchemy | Brewing | Minor Vitae Extract (heal 25), Greater Vitae Serum (heal 75) |
| Bloodletting | Blood extraction | Raw blood for Distillation |
| Distillation | Refining blood | Processed reagents |

---

## Advanced Workflows

### Farming Blood Echoes

1. Enter any zone with a Blood Echo defined (confirmed: most zones have one)
2. Survive long without taking damage to build **Scent of Fear** to 100%
3. A Blood Echo manifestation queues after the current kill
4. On defeat, the scent resets and a 120-second scent lock begins

### Path Resonance

Equip **3 or more items** of the same specialization path (Sanguine or Vile):
- **Sanguine Resonance**: Dash distance ×1.20, dash cooldown −10%
- **Vile Resonance**: Block triggers 2-second **Ironbound** state (no stagger)

### Gear Tier-Shifting

1. Refine an item to **Refinement 5** (costs scale: 25/50/75/100/125 shards + 5/10/15/20/25 steel)
2. Open Sanctum → Tier Shift the slot
3. Choose a Specialization Path (Sanguine or Vile)
4. Cost is multiplied by the item's current tier number (T1 = 1×, T2 = 2×, etc.)

---

## Running the Balance Simulator

```bash
npm run sim
```

Runs `src/engine/balanceSim.ts` via `ts-node`. Outputs simulated combat statistics to stdout. Use this to validate formula changes without running the browser UI.

---

## Running Tests

```bash
npm test
# or with UI
npx vitest --ui
```

Tests live in `src/tests/formulas.test.ts`. They cover pure formula functions only. Environment: `jsdom`.
