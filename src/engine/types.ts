// =============================================================================
// CRIMSON ENGINE — TypeScript Types & Interfaces
// =============================================================================

export type SkillName =
    | 'fangMastery'
    | 'predatorForce'
    | 'obsidianWard'
    | 'shadowArchery'
    | 'bloodSorcery'
    | 'vitae';

export type CombatStyle = 'melee' | 'archery' | 'sorcery';

export type UpgradeId = 'auto_loot' | 'auto_eat';

/**
 * The skill the player is actively training during combat.
 * Determines which skills receive XP per successful hit.
 * Available modes depend on the equipped weapon type.
 */
export type TrainingMode =
    // Melee weapon modes
    | 'attack'          // fangMastery ×4
    | 'strength'        // predatorForce ×4
    | 'defense'         // obsidianWard ×4
    | 'all_melee'       // fangMastery + predatorForce + obsidianWard ×1 each
    // Archery weapon modes
    | 'archery'          // shadowArchery ×4
    | 'warding_archery'  // shadowArchery ×2 + obsidianWard ×2
    // Sorcery weapon modes
    | 'sorcery'           // bloodSorcery ×4
    | 'warding_sorcery';  // bloodSorcery ×2 + obsidianWard ×2
    // Vitae is always passive (×1.33) regardless of mode

export type GearTier = 'T1' | 'T2' | 'T3' | 'T4' | 'T5' | 'T6';

export type EquipmentSlot =
    | 'weapon'
    | 'offhand'
    | 'helmet'
    | 'chest'
    | 'legs'
    | 'gloves'
    | 'boots'
    | 'amulet'
    | 'ring'
    | 'cape'
    | 'ammo';

export type Weakness =
    | 'fang' | 'shadow' | 'blood'
    | 'stab' | 'slash' | 'crush' | 'pound'
    | 'archery' | 'sorcery'
    | 'none'
    | null;


// --- Skills ---
export interface SkillData {
    level: number;
    xp: number;
}

export type PlayerSkills = Record<SkillName, SkillData>;

// --- Equipment ---
export interface EquipmentItem {
    id: string;
    name: string;
    slot: EquipmentSlot;
    tier: GearTier;
    levelRequirement: number;
    style?: CombatStyle;
    subStyle?: Weakness;
    // Offensive
    accuracyBonus?: number;
    powerModifier?: number;       // Multiplier on max hit (1.0 = no change)
    attackIntervalFlat?: number;  // Flat seconds reduction
    attackIntervalPct?: number;   // % reduction (0.0–1.0)
    // Defensive
    drPercent?: number;           // Damage reduction % (0.0–0.75)
    evasionBonus?: number;
    blockChance?: number;         // 0.0–0.20
    flatArmor?: number;
    // Special
    lifestealPercent?: number;    // 0.0–1.0 fraction of damage dealt
    regenPerSec?: number;         // HP restored every second
    siphonChance?: number;        // 0.0–1.0 chance to trigger Blood Siphon
    siphonAmount?: number;        // 0.0–1.0 fraction of incoming damage to recover
    armPen?: number;              // 0.0–1.0 fraction of flat armor to ignore
    minDamagePct?: number;        // 0.0–1.0 fraction of max hit as minimum damage
    specialTrait?: string;
    specialTraitValue?: number;
    // Phase 2B Progression
    refinement: number;           // 0-5
    specPath?: 'sanguine' | 'vile';
}

export type PlayerEquipment = Partial<Record<EquipmentSlot, EquipmentItem>>;

// --- Loot ---
export interface LootTableEntry {
    itemId: string;
    itemName: string;
    weight: number;
}

export interface LootHistoryItem {
    id: string;
    name: string;
    quantity: number;
    firstLooted: number; // timestamp
}

// --- Enemies ---
export interface EnemyStats {
    attack: number;
    strength: number;
    defense: number;
    ranged: number;
    magic: number;
    hp: number;
    flatArmor?: number;
    drPercent?: number;
}

export interface Enemy {
    id: string;
    name: string;
    zoneId: string;
    stats: EnemyStats;
    attackInterval: number;
    accuracy: number;
    maxHit: number;
    attackCategory: CombatStyle;
    damageProfile: Weakness;
    weakness: Weakness;
    resistance: Weakness;
    xpReward: number;
    respawnTime: number;
    isElite: boolean;
    spriteUrl?: string; // Optional URL for visual sprites
    lootTable: LootTableEntry[];
    notes?: string;
}

// --- Zones ---
export interface Zone {
    id: string;
    name: string;
    description: string;
    recommendedLevelMin: number;
    recommendedLevelMax: number;
    dropTier: GearTier;
    respawnBase: number;
    enemyPool: string[]; // ordered array of enemy IDs (weakest → elite)
    bgUrl?: string;
}

// --- Combat Events (for the log) ---
export type CombatEventType =
    | 'hit'
    | 'miss'
    | 'enemy_hit'
    | 'enemy_miss'
    | 'kill'
    | 'xp_gain'
    | 'level_up'
    | 'auto_eat'
    | 'player_death'
    | 'loot'
    | 'respawn'
    | 'siphon';

export interface CombatEvent {
    id: string;
    type: CombatEventType;
    tick: number;
    message: string;
    value?: number;
    skill?: SkillName;
}

// --- Active Combat State ---
export interface ActiveCombat {
    zone: Zone | null;
    enemy: Enemy | null;
    enemyCurrentHp: number;
    playerCurrentHp: number;
    playerMeter: number;   // 0.0 → 1.0
    enemyMeter: number;    // 0.0 → 1.0
    currentTick: number;
    isRunning: boolean;
    autoEatThreshold: number; // 0.0 to 1.0
    autoEatEnabled: boolean;
    log: CombatEvent[];
    // Phase 2A: Foundational Mechanics
    scentIntensity: number;   // 0.0 → 0.20
    isRedMistActive: boolean;
    redMistTicks: number;     // Session ticks in Red Mist
    redMistIchorDrops: number;
    redMistDeaths: number;
    siphonsThisHunt: number;  // For scaling cost
    finesseTicksRemaining: number;
    isBraced: boolean;
    // Phase 2C: Scent refinement
    activeEvent?: string; // e.g. 'Bloodlust', 'Hemophilic Curse'
    isBossPending?: boolean;
    hasSpawnedBoss?: boolean;
}

// --- Derived Player Stats (computed each frame, not stored) ---
export interface DerivedStats {
    maxHp: number;
    accuracyRating: number;
    evasionRating: number;
    meleeMaxHit: number;
    rangedMaxHit: number;
    magicMaxHit: number;
    damageReduction: number;
    attackInterval: number;
    blockChance: number;
    flatArmor: number;
    lifestealPercent: number;
    regenPerSec: number;
    siphonChance: number;
    siphonAmount: number;
    armPen: number;              // Total armor pen from gear/weapon
    minDamagePct: number;        // Highest min damage floor from gear
    scentSensitivity: number;    // Phase 2B: 0.0 to 0.50
    weaponStyle: CombatStyle;   // derived from equipped weapon, not training mode
    weaponSubStyle: Weakness;
    // Phase 2C: Scent refinement
    critChance: number;      // 0.0 to 1.0
    critMultiplier: number;  // Multiplier, e.g. 1.5
}

// --- Stats Tracking ---
export interface StatWindowEntry {
    timestamp: number;
    type: 'kill' | 'xp' | 'loot' | 'death';
    value: number; // XP amount, or 1 for kill/death, etc.
}

export interface ComputedRates {
    xpPerHour: number;
    lootPerHour: number;
    killsPerHour: number;
    deathsPerHour: number;
    survivalRate: number;
    avgKillTime: number;
    confidence: 'Safe' | 'Risky' | 'Deadly';
}

export interface LootDrop {
    itemId: string;
    itemName: string;
    quantity: number;
    timestamp: number;
}

export interface SessionStats {
    startTime: number;
    endTime?: number;
    kills: number;
    xpGained: number;
    lootCount: number;
    lootItems: LootDrop[];
    bloodShardsGained: number;
    cursedIchorGained: number;
    graveSteelGained: number;
    wasSlain?: boolean;
    lastScentIntensity?: number;
    bossesSlain: number;
}

// --- Inventory Item (stub for future expansion) ---
export interface InventoryItem {
    id: string;
    name: string;
    quantity: number;
    type: 'food' | 'material' | 'equipment' | 'misc';
    healAmount?: number; // For food items
}
