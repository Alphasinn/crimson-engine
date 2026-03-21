// =============================================================================
// CRIMSON ENGINE — Game Constants
// =============================================================================

/** Tick duration in milliseconds — the heartbeat of the combat loop */
export const TICK_MS = 100;

/** Minimum allowed attack interval in seconds (hard floor) */
export const MIN_ATTACK_INTERVAL = 0.6;

/** Maximum damage reduction percentage (75% cap) */
export const MAX_DAMAGE_REDUCTION = 0.75;

/** Minimum hit chance — always at least a sliver of hope */
export const MIN_HIT_CHANCE = 0.05;

/** Maximum hit chance — nothing is guaranteed */
export const MAX_HIT_CHANCE = 0.95;

/** Maximum block chance from shields */
export const MAX_BLOCK_CHANCE = 0.20;

/** Maximum combat level */
export const MAX_LEVEL = 120;

/** Maximum XP cap (500 million) */
export const XP_CAP = 500_000_000;

/** Starting Vitae level for a new character */
export const STARTING_VITAE_LEVEL = 10;

/** Starting HP = STARTING_VITAE_LEVEL */
export const STARTING_HP = STARTING_VITAE_LEVEL;

/** Auto-eat triggers when HP falls below this fraction */
export const AUTO_EAT_THRESHOLD = 0.5;

/** Max offline simulation in hours */
export const MAX_OFFLINE_HOURS = 8;

/** Anti-stall: warn if no kill in this many seconds */
export const ANTI_STALL_SECONDS = 60;

/** Style advantage/resistance modifiers */
export const STYLE_ADVANTAGE_BONUS = 0.15;
export const STYLE_RESISTANCE_PENALTY = -0.10;

/** Damage modifier when hitting a weakness */
export const WEAKNESS_DAMAGE_MOD = 1.15;

/** Damage modifier when hitting a resistance */
export const RESISTANCE_DAMAGE_MOD = 0.85;

/** Vitae XP share — kept for reference; per-hit system uses HIT_XP_VITAE_MULT */
export const VITAE_XP_SHARE = 0.33;

// --- Per-hit XP Multipliers (Idle Clans model) ---
/** Single-skill focus modes (attack/strength/defense/ranged/magic) */
export const HIT_XP_FOCUS_MULT = 4;
/** Mixed modes — warding (2x each of two skills) */
export const HIT_XP_MIXED_MULT = 2;
/** All-melee mode — 1x each of three skills */
export const HIT_XP_ALL_MULT = 1;
/** Vitae — always awarded passively on every hit */
export const HIT_XP_VITAE_MULT = 1.33;
// --- Trinity Lock Math (v1.7) ---
/** Multiplicative Compression threshold multiplier */
export const MC_THRESHOLD = 1.0;
/** Default MC power (applied to magnitudes above threshold) */
export const MC_POWER_DEFAULT = 0.65;
/** Aggressive MC power for SLASH style */
export const MC_POWER_SLASH = 0.45;

/** STAB style: Base armor bypass fraction */
export const STAB_ARMOR_BYPASS = 0.15;
/** STAB/SLASH style: Frequency threshold for armor scaling */
export const STYLE_FREQ_THRESHOLD = 1.5;
/** STAB/SLASH style: Intensity of armor scaling */
export const STYLE_FREQ_INTENSITY = 1.5;

/** CRUSH style: Fracture rate (bypass fraction per second of interval) */
export const CRUSH_FRACTURE_RATE = 0.05;

/** Absolute minimum damage floor as fraction of raw pre-mitigation damage */
export const DAMAGE_FLOOR_PERCENT = 0.15;

// =============================================================================
// PHASE 2A PROTOTYPE CONSTANTS
// =============================================================================

/** Fraction of unbanked shards lost on death */
export const DEATH_SHARD_LOSS_PCT = 0.50;
/** Fraction of unbanked ichor lost on death */
export const DEATH_ICHOR_LOSS_PCT = 1.00;
/** "Braced" shard loss reduction modifier (0.50 -> 0.25) */
export const DEATH_SHARD_BRACED_PCT = 0.25;
/** "Braced" ichor loss reduction modifier (1.00 -> 0.50) */
export const DEATH_ICHOR_BRACED_PCT = 0.50;

/** Fraction of Max HP restored per siphon */
export const SIPHON_HEAL_PCT = 0.20;
/** Starting shard cost for the first siphon */
export const SIPHON_BASE_COST = 10;
/** Scaling factor for siphoning cost */
export const SIPHON_COST_EXPONENT = 1.7;

/** Ticks between each accuracy increment (4s @ 100ms ticks) */
export const SCENT_BUILD_INTERVAL = 40;
/** Accuracy bonus gained per interval */
export const SCENT_INCREMENT = 0.01;
/** Maximum accuracy bonus enemy can gain from scent */
export const SCENT_ACCURACY_CAP = 0.20;

/** HP threshold (<30%) to trigger Red Mist bonuses */
export const RED_MIST_THRESHOLD = 0.30;
/** Damage multiplier during Red Mist */
export const RED_MIST_DMG_BONUS = 1.20;
/** Additive drop rate bonus for Cursed Ichor during Red Mist */
export const RED_MIST_ICHOR_MOD = 0.10;
