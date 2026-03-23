// =============================================================================
// CRIMSON ENGINE — Game Constants
// Centralized balance parameters and system thresholds.
// =============================================================================

/** Core engine tick rate (100ms = 10 ticks per second) */
export const TICK_MS = 100;

/** Starting level for most skills */
export const STARTING_LEVEL = 1;
/** Starting level for Vitae */
export const STARTING_VITAE_LEVEL = 10;

/** Level cap for all skills */
export const MAX_LEVEL = 120;

// --- Combat Constants ---
/** Base chance to hit (if accuracy == evasion) */
export const BASE_HIT_CHANCE = 0.50;
/** Bonus damage multiplier for weakness matches */
export const WEAKNESS_DAMAGE_MOD = 1.25;
/** Damage reduction multiplier for resistance matches */
export const RESISTANCE_DAMAGE_MOD = 0.75;

/** Hard cap for damage reduction (75%) */
export const DR_CAP = 0.75;
/** Multiplicative compression power factor */
export const MC_POWER_DEFAULT = 0.5;
export const MC_POWER_SLASH = 0.6;

// --- Blood Siphon ---
/** Fraction of Max HP restored per siphon */
export const SIPHON_HEAL_PCT = 0.20;
/** Starting shard cost for the first siphon */
export const SIPHON_BASE_COST = 10;
/** Scaling factor for siphoning cost */
export const SIPHON_COST_EXPONENT = 1.7;

// --- Scent of Fear ---
/** Ticks between each accuracy increment (4s @ 100ms ticks) */
export const SCENT_BUILD_INTERVAL = 40;
/** Accuracy bonus gained per interval (3% per 4s) */
export const SCENT_INCREMENT = 0.03;
/** Maximum accuracy bonus enemy can gain from scent (100%) */
export const SCENT_ACCURACY_CAP = 1.00;

/** Scent threshold required to trigger a Boss spawn */
export const BOSS_SCENT_THRESHOLD = 0.20;
/** Scent reduction awarded upon defeating a Zone Boss (10%) */
export const SCENT_REDUCTION_BOSS = 0.10;

// --- Red Mist & Events ---
/** HP threshold (<30%) to trigger Red Mist bonuses */
export const RED_MIST_THRESHOLD = 0.30;
/** Damage multiplier during Red Mist */
export const RED_MIST_DMG_BONUS = 1.20;
/** Additive drop rate bonus for Cursed Ichor during Red Mist */
export const RED_MIST_ICHOR_MOD = 0.10;

/** Scent threshold for 'Bloodlust' event */
export const EVENT_THRESHOLD_BLOODLUST = 0.05;
/** Scent threshold for 'Hemophilic Curse' event */
export const EVENT_THRESHOLD_CURSE = 0.10;
/** Scent threshold for 'Razor Fangs' event */
export const EVENT_THRESHOLD_FANGS = 0.15;

// --- Phase 2B Progression ---
/** Maximum additive Scent accumulation penalty from gear (50%) */
export const MAX_SCENT_SENSITIVITY = 0.50;
/** Scent accumulation penalty per refinement level (2%) */
export const REFINEMENT_SCENT_MULT = 0.02;

/** Default damage multiplier for critical hits */
export const CRIT_MULTIPLIER_DEFAULT = 1.5;
