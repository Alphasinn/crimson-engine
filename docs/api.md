# Internal API Reference

> **Note**: Crimson Engine is a client-side SPA with **no HTTP API**. This document covers the internal callable interfaces — the engine class, Zustand store actions, and pure formula functions. These are the "API" that developers interact with when extending the system.

---

## CombatEngine (`src/engine/combatLoop.ts`)

### Constructor

```typescript
const engine = new CombatEngine(callbacks: CombatCallbacks);
```

### Public Methods

#### `engine.start(zone, skills, equipment, food, autoEatEnabled, autoEatThreshold, initialHp?, trainingMode?, meta?, ritualModifiers?, resonanceState?, activeRitualIds?, initialEnemy?)`

Starts the combat loop. Stops any existing loop first.

```typescript
engine.start(
  zone,             // Zone — the active zone object
  skills,           // PlayerSkills
  equipment,        // PlayerEquipment
  food,             // InventoryItem[] — food items for auto-eat
  autoEatEnabled,   // boolean
  autoEatThreshold, // 0.0–1.0 — HP fraction threshold
  initialHp,        // number | undefined — starts at maxHp if omitted
  trainingMode,     // TrainingMode — defaults to 'attack'
  meta,             // { isBraced, permanentArmorBonus, bloodShards, finesseTicksRemaining }
  ritualModifiers,  // { scentGainMultiplier, lootQualityMultiplier, maxHpMultiplier, speedMultiplier }
  resonanceState,   // ResonanceState
  activeRitualIds,  // string[]
  initialEnemy      // Enemy | undefined — skip first spawn if provided
);
```

#### `engine.stop()`
Clears the setInterval and respawn timeout. Sets `isRunning = false`.

#### `engine.updatePlayerState(skills, equipment, food, trainingMode, autoEatEnabled, autoEatThreshold, meta?, ritualModifiers?, resonanceState?, activeRitualIds?)`
Hot-updates player stats mid-session without restarting combat.

#### `engine.heal(amount: number): number`
Manually heals the player. Returns amount actually healed (capped at missing HP). Logs an `auto_eat` event.

#### `engine.setEnemy(enemy: Enemy): void`
Injects a specific enemy (used by store for Blood Echo manifestations).

#### `engine.setCallbacks(callbacks: CombatCallbacks): void`
Replaces callback references (needed when React hook dependencies change).

### Getters

| Getter | Type | Description |
|--------|------|-------------|
| `engine.running` | `boolean` | Whether the loop is active |
| `engine.redMistSurvived` | `boolean` | True if Red Mist was entered and player survived |
| `engine.scentIntensity` | `number` | Current scent value (0.0–1.0) |
| `engine.tickCount` | `number` | Total ticks since last start |

### CombatCallbacks Interface

```typescript
interface CombatCallbacks {
  onPlayerAttack: (result: AttackResult, enemy: Enemy) => void;
  onEnemyAttack: (result: AttackResult) => void;
  onEnemyDeath: (enemy: Enemy, sessionStats: any, loot: LootTableEntry | null) => void;
  onPlayerDeath: (isBraced: boolean, isRedMist: boolean) => void;
  onRespawn: (enemy: Enemy) => void;
  onTick: (activeCombat: any) => void;
  onAutoEat: (healAmount: number) => void;
  onHitXp: (gains: Partial<PlayerSkills>) => void;
  onLog: (event: CombatEvent) => void;
  onLoot: (item: { itemId: string, itemName: string, quantity: number }, isRedMist: boolean) => void;
  getEnemyData: (id: string) => Enemy | null;
  sanguineFinesse: () => void;
  vileReinforcement: () => void;
}
```

---

## Core Formulas (`src/engine/formulas.ts`)

All pure functions. No side effects. Safe to call in tests or the simulator.

### Attack Interval

```typescript
calcAttackInterval(
  baseInterval: number,   // Weapon base seconds
  pctReductions: number[], // e.g. [0.05, 0.10]
  flatReductions: number   // Flat reduction in seconds
): number  // Clamped to MIN_ATTACK_INTERVAL (0.6s)

calcMeterFillPerTick(interval: number, tickMs: number): number
// Returns: tickMs / 1000 / interval
```

### Hit Chance

```typescript
calcAccuracyRating(level: number, equipmentBonus: number): number
// Returns: level * 4 + equipmentBonus

calcEvasionRating(obsidianWardLevel: number, equipmentBonus: number): number
// Returns: level * 4 + equipmentBonus

calcHitChance(
  accuracyRating: number,
  evasionRating: number,
  styleAdvantageBonus?: number,  // default 0
  gearAccuracyMult?: number,     // default 1
  buffMult?: number              // default 1
): number  // Clamped [0.05, 0.95]

calcStyleBonus(
  playerStyle: CombatStyle,
  enemyWeakness: Weakness,
  enemyResistance: Weakness,
  weaponSubStyle?: Weakness
): number  // +0.15 (advantage) | -0.10 (resistance) | 0
```

### Damage

```typescript
calcBaseMaxHit(level: number): number
// Returns: floor(level / 8) + 1

calcMaxHit(baseMaxHit: number, weaponPowerModifier: number, bonusPct: number): number
// Returns: floor(base * powerMod * (1 + bonusPct))

rollDamage(maxHit: number, minDamagePct?: number): number
// Random [floor(maxHit * minDamagePct), maxHit]; minimum 1

applyWeaknessMod(
  rawDamage: number,
  playerStyle: CombatStyle,
  enemyWeakness: Weakness,
  enemyResistance: Weakness,
  weaponSubStyle?: Weakness
): number  // ×1.15 (weakness) | ×0.85 (resistance) | ×1.0
```

### Mitigation (Trinity Lock v1.7)

```typescript
applyMitigation(
  incoming: number,
  flatArmor: number,
  drPct: number,         // 0.0–0.75 clamped
  armPen?: number,       // 0.0–1.0 fraction of armor to ignore
  style?: Weakness,      // Affects armor bypass calculation
  interval?: number      // Attack interval in seconds
): number  // Minimum: max(1, 15% of raw incoming)
```

**Style behaviors:**
- `crush` / `pound`: Armor bypass = `CRUSH_FRACTURE_RATE × interval` (0.05/s)
- `stab`: Bypass = 0.15 + mild frequency scaling (>1.5 attacks/s)
- `slash`: Frequency scaling only (no bypass)

### HP & XP

```typescript
calcMaxHp(vitaeLevel: number): number  // vitaeLevel (1:1 mapping)

calcHitXpGains(
  damage: number,
  mode: TrainingMode
): Partial<PlayerSkills>  // Returns map of skill → { level: 0, xp: N }
// Vitae always included at ×1.33
```

### Scent & Red Mist

```typescript
calcScentScalingDmg(base: number, scent: number): number
// Enemy damage: floor(base × (1 + scent))  — up to 2× at full scent

calcScentScalingHp(base: number, scent: number): number
// Enemy HP: floor(base × (1 + scent × 0.5))  — up to 1.5×

calcCritChance(agilityLevel: number): number
// Returns: level × 0.002  (~24% at L120)
```

### Aggregate Stat Computation

```typescript
computeDerivedStats(
  skills: PlayerSkills,
  equipment: PlayerEquipment,
  meta?: {
    permanentArmorBonus: number;
    isFinesseActive: boolean;
    isLowHp: boolean;
    isFlickerActive: boolean;
  }
): DerivedStats
```

Returns the complete `DerivedStats` object used by the engine every tick.

---

## Zustand Store Actions

### playerStore

```typescript
const { gainXp, equipItem, unequipItem, consumeFood, addInventoryItem,
        addUnbankedLoot, withdraw, applyDeathPenalties, sanguineFinesse,
        vileReinforcement, stabilizeIchor, refineGear, tierShift,
        resetPlayer, buyItem, addRitual, removeRitual } = usePlayerStore();
```

| Action | Signature | Effect |
|--------|-----------|--------|
| `gainXp` | `(skill, amount) => void` | Adds XP to skill, recomputes level, caps at 500M |
| `equipItem` | `(itemId) => void` | Moves item from inventory → equipment slot |
| `unequipItem` | `(slot) => void` | Moves item from equipment → inventory |
| `consumeFood` | `(itemId) => void` | Decrements food quantity by 1 |
| `addUnbankedLoot` | `(shards, steel, ichor, isRedMist?) => void` | Adds to unbanked pool (shard cap: 5000 total) |
| `withdraw` | `() => void` | Banks all unbanked resources |
| `applyDeathPenalties` | `(isBraced, isRedMist?) => void` | Applies death losses, clears unbanked |
| `sanguineFinesse` | `() => void` | Costs 15 shards; sets finesseTicksRemaining: 200 |
| `vileReinforcement` | `() => void` | Costs 30 shards + 10 steel; +5 armor, Braced |
| `stabilizeIchor` | `() => void` | Costs 125 shards + 1 ichor; yields Stabilized Ichor |
| `refineGear` | `(slot) => void` | Costs 25×(ref+1) shards + 5×(ref+1) steel; +1 refinement |
| `tierShift` | `(slot, path) => void` | Requires ref=5; promotes item to next tier |
| `buyItem` | `(itemId, price, currency?) => boolean` | Returns `false` if insufficient funds |
| `resetPlayer` | `() => void` | Full character reset; starts with 100 shards + Rusted Fang |

---

## Progression Functions (`src/engine/progression.ts`)

```typescript
evaluateHuntPerformance(
  session: SessionStats,
  tickCount: number,
  wasSlain: boolean,
  redMistSurvived: boolean
): HuntEvaluation
// { isValid, quality: 0.0–1.0, reason }
// Scoring: Survival (40%) + Aggression (25%) + Pressure (25%) + Rituals (9%)

getNextTier(current: GearTier): GearTier | null
// T1→T2→T3→T4→T5→T6→null

isEligibleForTierShift(item: EquipmentItem): boolean
// refinement === 5 AND tier !== T6

getTierShiftCost(current: GearTier): { shards, stabilizedIchor, steel }
// Base cost × tier number (T1=1×, T2=2×, …)

resolveNextTierItem(item, allEquipment): EquipmentItem | null
// Finds matching item in next tier by slot/style/subStyle
```

---

## XP Table (`src/engine/xpTable.ts`)

```typescript
getLevelFromXp(xp: number): number   // 1–120
getXpForLevel(level: number): number  // XP required to reach this level
```

---

## Type Reference (`src/engine/types.ts`)

Key exported types (import from `@engine/types`):

- `SkillName` — union of 13 skill keys
- `CombatStyle` — `'melee' | 'archery' | 'sorcery'`
- `TrainingMode` — 8 training modes
- `GearTier` — `'T1' | 'T2' | 'T3' | 'T4' | 'T5' | 'T6'`
- `EquipmentSlot` — 11 equipment slot keys
- `Weakness` — damage profile + weakness type union
- `EquipmentItem` — full gear item interface
- `Enemy` — enemy definition with stats, loot table, weakness
- `Zone` — zone definition with enemy pool
- `ActiveCombat` — live combat snapshot passed to UI
- `DerivedStats` — computed player stats snapshot
- `SessionStats` — end-of-session metrics
